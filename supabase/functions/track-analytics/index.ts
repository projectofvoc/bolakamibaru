import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function parseDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
}

function parseBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
  
  return 'Other';
}

function parseOS(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac os')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  
  return 'Other';
}

function parseReferrerSource(referrer: string): string {
  if (!referrer) return 'direct';
  
  const url = referrer.toLowerCase();
  
  // Social media
  if (url.includes('facebook.com') || url.includes('fb.com')) return 'social';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'social';
  if (url.includes('instagram.com')) return 'social';
  if (url.includes('linkedin.com')) return 'social';
  if (url.includes('tiktok.com')) return 'social';
  if (url.includes('youtube.com')) return 'social';
  if (url.includes('whatsapp.com') || url.includes('wa.me')) return 'social';
  if (url.includes('t.me') || url.includes('telegram')) return 'social';
  
  // Search engines
  if (url.includes('google.')) return 'organic';
  if (url.includes('bing.com')) return 'organic';
  if (url.includes('yahoo.')) return 'organic';
  if (url.includes('duckduckgo.com')) return 'organic';
  if (url.includes('baidu.com')) return 'organic';
  
  return 'referral';
}

function getCountryFromHeaders(req: Request): string {
  // Try Cloudflare header first
  const cfCountry = req.headers.get('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX') {
    return cfCountry;
  }
  
  // Try Vercel/Netlify headers
  const xCountry = req.headers.get('x-vercel-ip-country') || req.headers.get('x-country');
  if (xCountry) {
    return xCountry;
  }
  
  // Default to unknown
  return 'ID'; // Default to Indonesia for this Indonesian sports site
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { sessionId, eventType, pagePath, pageTitle, referrer, userAgent } = body;
    
    if (!sessionId || !eventType || !pagePath) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Tracking event:', { sessionId, eventType, pagePath });

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const deviceType = parseDeviceType(userAgent || '');
    const browser = parseBrowser(userAgent || '');
    const os = parseOS(userAgent || '');
    const country = getCountryFromHeaders(req);
    const referrerSource = parseReferrerSource(referrer || '');

    // Insert the event
    const { error: eventError } = await supabase.from('analytics_events').insert({
      session_id: sessionId,
      event_type: eventType,
      page_path: pagePath,
      page_title: pageTitle || null,
      referrer: referrer || null,
      user_agent: userAgent || null,
      device_type: deviceType,
      browser,
      os,
      country,
    });

    if (eventError) {
      console.error('Error inserting event:', eventError);
      throw eventError;
    }

    // Handle session tracking
    if (eventType === 'pageview') {
      // Check if session exists
      const { data: existingSession } = await supabase
        .from('analytics_sessions')
        .select('id, pageviews, started_at')
        .eq('session_id', sessionId)
        .single();

      if (existingSession) {
        // Update existing session
        const startedAt = new Date(existingSession.started_at);
        const now = new Date();
        const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

        const { error: updateError } = await supabase
          .from('analytics_sessions')
          .update({
            pageviews: existingSession.pageviews + 1,
            exit_page: pagePath,
            last_activity_at: now.toISOString(),
            duration_seconds: durationSeconds,
            is_bounced: false, // More than one pageview = not bounced
          })
          .eq('id', existingSession.id);

        if (updateError) {
          console.error('Error updating session:', updateError);
        }
      } else {
        // Create new session
        const { error: insertError } = await supabase.from('analytics_sessions').insert({
          session_id: sessionId,
          entry_page: pagePath,
          exit_page: pagePath,
          device_type: deviceType,
          browser,
          os,
          country,
          referrer: referrer || null,
          referrer_source: referrerSource,
          user_agent: userAgent || null,
          pageviews: 1,
          is_bounced: true, // Single pageview = bounced until proven otherwise
        });

        if (insertError) {
          console.error('Error inserting session:', insertError);
        }
      }
    } else if (eventType === 'session_end') {
      // Update session end time
      const { data: existingSession } = await supabase
        .from('analytics_sessions')
        .select('id, started_at')
        .eq('session_id', sessionId)
        .single();

      if (existingSession) {
        const startedAt = new Date(existingSession.started_at);
        const now = new Date();
        const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

        const { error: updateError } = await supabase
          .from('analytics_sessions')
          .update({
            ended_at: now.toISOString(),
            duration_seconds: durationSeconds,
          })
          .eq('id', existingSession.id);

        if (updateError) {
          console.error('Error updating session end:', updateError);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error tracking analytics:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
