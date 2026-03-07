import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsResponse {
  visitors: { total: number; trend: { date: string; value: number }[] };
  pageviews: { total: number; trend: { date: string; value: number }[] };
  pageviewsPerVisit: { total: number };
  sessionDuration: { total: number };
  bounceRate: { total: number };
  pages: { page: string; count: number }[];
  countries: { country: string; count: number }[];
  devices: { device: string; count: number }[];
  sources: { source: string; count: number }[];
  articlesPublished30d: number;
  articlesPublished7d: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startDate, endDate } = await req.json();
    
    console.log('Fetching real analytics data:', { startDate, endDate });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch sessions with range to bypass 1000-row default limit
    const { data: sessions, error: sessionsError } = await supabase
      .from('analytics_sessions')
      .select('*')
      .gte('started_at', startDate)
      .lte('started_at', `${endDate}T23:59:59.999Z`)
      .range(0, 9999);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      throw sessionsError;
    }

    // Fetch pageviews with range to bypass 1000-row default limit
    const { data: pageviews, error: pageviewsError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_type', 'pageview')
      .gte('created_at', startDate)
      .lte('created_at', `${endDate}T23:59:59.999Z`)
      .range(0, 9999);

    if (pageviewsError) {
      console.error('Error fetching pageviews:', pageviewsError);
      throw pageviewsError;
    }

    // Article publish counts (rolling 30d and 7d from today)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [articles30dRes, articles7dRes] = await Promise.all([
      supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('published_at', thirtyDaysAgo),
      supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('published_at', sevenDaysAgo),
    ]);

    const articlesPublished30d = articles30dRes.count ?? 0;
    const articlesPublished7d = articles7dRes.count ?? 0;

    const totalVisitors = sessions?.length || 0;
    const totalPageviews = pageviews?.length || 0;

    // Calculate visitors trend (group by date)
    const visitorsTrendMap = new Map<string, Set<string>>();
    const pageviewsTrendMap = new Map<string, number>();
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      visitorsTrendMap.set(dateStr, new Set());
      pageviewsTrendMap.set(dateStr, 0);
    }

    sessions?.forEach(session => {
      if (session.started_at) {
        const date = session.started_at.split('T')[0];
        if (visitorsTrendMap.has(date)) {
          visitorsTrendMap.get(date)!.add(session.session_id);
        }
      }
    });

    pageviews?.forEach(pv => {
      if (pv.created_at) {
        const date = pv.created_at.split('T')[0];
        if (pageviewsTrendMap.has(date)) {
          pageviewsTrendMap.set(date, (pageviewsTrendMap.get(date) || 0) + 1);
        }
      }
    });

    const visitorsTrend = Array.from(visitorsTrendMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, sessionSet]) => ({ date, value: sessionSet.size }));

    const pageviewsTrend = Array.from(pageviewsTrendMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, value: count }));

    // Average session duration
    const sessionsWithDuration = sessions?.filter(s => s.duration_seconds && s.duration_seconds > 0) || [];
    const avgDuration = sessionsWithDuration.length > 0
      ? Math.round(sessionsWithDuration.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessionsWithDuration.length)
      : 0;

    // Bounce rate
    const bouncedSessions = sessions?.filter(s => s.is_bounced === true) || [];
    const bounceRate = totalVisitors > 0 
      ? Math.round((bouncedSessions.length / totalVisitors) * 100) 
      : 0;

    // Pages per visit
    const pagesPerVisit = totalVisitors > 0 
      ? Number((totalPageviews / totalVisitors).toFixed(2)) 
      : 0;

    // Top pages
    const pageCountMap = new Map<string, number>();
    pageviews?.forEach(pv => {
      const path = pv.page_path;
      pageCountMap.set(path, (pageCountMap.get(path) || 0) + 1);
    });
    const topPages = Array.from(pageCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // Country distribution
    const countryCountMap = new Map<string, number>();
    sessions?.forEach(session => {
      const country = session.country || 'Unknown';
      countryCountMap.set(country, (countryCountMap.get(country) || 0) + 1);
    });
    const countries = Array.from(countryCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => ({ country, count }));

    // Device distribution
    const deviceCountMap = new Map<string, number>();
    sessions?.forEach(session => {
      const device = session.device_type || 'unknown';
      deviceCountMap.set(device, (deviceCountMap.get(device) || 0) + 1);
    });
    const devices = Array.from(deviceCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([device, count]) => ({ device, count }));

    // Source distribution
    const sourceCountMap = new Map<string, number>();
    sessions?.forEach(session => {
      const source = session.referrer_source || 'direct';
      sourceCountMap.set(source, (sourceCountMap.get(source) || 0) + 1);
    });
    const sources = Array.from(sourceCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count }));

    const analyticsData: AnalyticsResponse = {
      visitors: { total: totalVisitors, trend: visitorsTrend },
      pageviews: { total: totalPageviews, trend: pageviewsTrend },
      pageviewsPerVisit: { total: pagesPerVisit },
      sessionDuration: { total: avgDuration },
      bounceRate: { total: bounceRate },
      pages: topPages,
      countries,
      devices,
      sources,
      articlesPublished30d,
      articlesPublished7d,
    };

    console.log('Real analytics data generated:', { 
      totalVisitors, totalPageviews, avgDuration, bounceRate,
      sessionsCount: sessions?.length, pageviewsCount: pageviews?.length,
      articlesPublished30d, articlesPublished7d,
    });
    
    return new Response(JSON.stringify({
      source: 'database',
      data: analyticsData
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new Response(JSON.stringify({ 
      source: 'error',
      error: String(error),
      data: getEmptyAnalyticsData()
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

function getEmptyAnalyticsData(): AnalyticsResponse {
  return {
    visitors: { total: 0, trend: [] },
    pageviews: { total: 0, trend: [] },
    pageviewsPerVisit: { total: 0 },
    sessionDuration: { total: 0 },
    bounceRate: { total: 0 },
    pages: [],
    countries: [],
    devices: [],
    sources: [],
    articlesPublished30d: 0,
    articlesPublished7d: 0,
  };
}
