import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startDate, endDate, granularity = 'daily' } = await req.json();
    
    console.log('Fetching analytics:', { startDate, endDate, granularity });

    const projectId = Deno.env.get('VITE_SUPABASE_PROJECT_ID') || 'wqrvguxkanjuorntlmmx';
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      console.log('LOVABLE_API_KEY not configured, returning empty data');
      return new Response(JSON.stringify({
        source: 'fallback',
        error: 'API key not configured',
        data: getEmptyAnalyticsData()
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Call Lovable Analytics API
    const apiUrl = `https://api.lovable.dev/v1/projects/${projectId}/analytics?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`;
    console.log('Calling Lovable API:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable API error:', response.status, errorText);
      throw new Error(`API responded with ${response.status}: ${errorText}`);
    }

    const analyticsData = await response.json();
    console.log('Analytics data received:', JSON.stringify(analyticsData).substring(0, 500));
    
    return new Response(JSON.stringify({
      source: 'lovable',
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
    sources: []
  };
}
