import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SportmonksFixture {
  id: number;
  name: string;
  starting_at: string;
  state: {
    id: number;
    short_name: string;
  };
  scores: Array<{
    participant_id: number;
    score: {
      goals: number;
    };
  }>;
  participants: Array<{
    id: number;
    name: string;
    meta: {
      location: string;
    };
  }>;
  league: {
    id: number;
    name: string;
    short_code: string;
  };
  periods: Array<{
    minutes: number;
    type_id: number;
  }>;
}

interface TransformedMatch {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'live' | 'ft' | 'scheduled' | 'post';
  minute: number | null;
  league: string;
  leagueShort: string;
  time: string;
}

// Cache TTL in seconds (30 seconds for live data)
const CACHE_TTL_SECONDS = 30;

// Function to get API key from database with fallback to env
async function getApiKey(supabase: any, apiName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('api_configurations')
      .select('api_key')
      .eq('name', apiName)
      .eq('is_active', true)
      .single();
    
    if (data?.api_key) {
      console.log(`Using API key from database for: ${apiName}`);
      return data.api_key;
    }
  } catch (e) {
    console.log(`Failed to get API key from database: ${e}`);
  }
  
  // Fallback to environment variable
  console.log(`Falling back to env variable for: ${apiName}`);
  return Deno.env.get('SPORTMONKS_API_KEY') || null;
}

// Cache helper function
async function getCachedOrFetch<T>(
  supabase: any,
  cacheKey: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<{ data: T; fromCache: boolean }> {
  try {
    // 1. Check cache
    const { data: cached, error: cacheError } = await supabase
      .from('api_cache')
      .select('cache_value')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (!cacheError && cached) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return { data: cached.cache_value as T, fromCache: true };
    }
  } catch (e) {
    console.log(`[Cache] Error checking cache: ${e}`);
  }
  
  // 2. Fetch fresh data
  console.log(`[Cache MISS] ${cacheKey}`);
  const freshData = await fetchFn();
  
  // 3. Store in cache (upsert)
  try {
    await supabase.from('api_cache').upsert({
      cache_key: cacheKey,
      cache_value: freshData,
      expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    }, { onConflict: 'cache_key' });
    console.log(`[Cache] Stored: ${cacheKey}, TTL: ${ttlSeconds}s`);
  } catch (e) {
    console.log(`[Cache] Error storing cache: ${e}`);
  }
  
  return { data: freshData, fromCache: false };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for reading api_configurations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get API key from database or fallback to env
    const apiKey = await getApiKey(supabase, 'sportmonks');
    
    if (!apiKey) {
      throw new Error('SPORTMONKS_API_KEY not configured in database or environment');
    }

    // Get today's date in YYYY-MM-DD format for cache key
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `livescore:${today}`;

    // Use cache helper
    const { data: transformedMatches, fromCache } = await getCachedOrFetch<TransformedMatch[]>(
      supabase,
      cacheKey,
      CACHE_TTL_SECONDS,
      async () => {
        // Fetch live fixtures with scores, participants, and league info
        const response = await fetch(
          `https://api.sportmonks.com/v3/football/livescores/inplay?api_token=${apiKey}&include=participants;scores;league;state;periods`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Sportmonks API error:', response.status, errorText);
          throw new Error(`Sportmonks API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Sportmonks response:', JSON.stringify(data).slice(0, 500));

        const fixtures: SportmonksFixture[] = data.data || [];

        // If no live matches, fetch recent finished matches
        let matches: TransformedMatch[] = [];

        if (fixtures.length === 0) {
          // Fetch today's fixtures including finished ones
          const fixturesResponse = await fetch(
            `https://api.sportmonks.com/v3/football/fixtures/date/${today}?api_token=${apiKey}&include=participants;scores;league;state;periods`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            }
          );

          if (fixturesResponse.ok) {
            const fixturesData = await fixturesResponse.json();
            const allFixtures: SportmonksFixture[] = fixturesData.data || [];
            
            matches = allFixtures
              .map((fixture) => transformFixture(fixture))
              .filter(Boolean)
              .slice(0, 10) as TransformedMatch[];
          }
        } else {
          matches = fixtures
            .map((fixture) => transformFixture(fixture))
            .filter(Boolean)
            .slice(0, 10) as TransformedMatch[];
        }

        return matches;
      }
    );

    return new Response(JSON.stringify({ 
      matches: transformedMatches,
      fromCache,
      cacheKey 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in sportmonks-livescore function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage, matches: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function transformFixture(fixture: SportmonksFixture): TransformedMatch | null {
  try {
    const participants = fixture.participants || [];
    const homeTeam = participants.find(p => p.meta?.location === 'home');
    const awayTeam = participants.find(p => p.meta?.location === 'away');

    if (!homeTeam || !awayTeam) return null;

    const scores = fixture.scores || [];
    const homeScore = scores.find(s => s.participant_id === homeTeam.id)?.score?.goals ?? null;
    const awayScore = scores.find(s => s.participant_id === awayTeam.id)?.score?.goals ?? null;

    // Get current minute from periods
    const periods = fixture.periods || [];
    const currentPeriod = periods.find(p => p.minutes > 0);
    const minute = currentPeriod?.minutes || null;

    // Determine status based on state
    const stateShort = fixture.state?.short_name?.toUpperCase() || '';
    let status: 'live' | 'ft' | 'scheduled' | 'post' = 'scheduled';
    
    if (['LIVE', '1H', '2H', 'HT', 'ET', 'PEN'].includes(stateShort)) {
      status = 'live';
    } else if (['FT', 'AET', 'FT_PEN'].includes(stateShort)) {
      status = 'ft';
    } else if (['POST', 'POSTP', 'SUSP', 'INT', 'ABAN', 'CANCL', 'AWARDED'].includes(stateShort)) {
      status = 'post';
    }

    // Format time from starting_at
    const startTime = fixture.starting_at ? new Date(fixture.starting_at) : null;
    const time = startTime 
      ? startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      : '--:--';

    return {
      id: fixture.id,
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      homeScore,
      awayScore,
      status,
      minute,
      league: fixture.league?.name || 'Unknown',
      leagueShort: fixture.league?.short_code || fixture.league?.name?.slice(0, 5) || 'N/A',
      time,
    };
  } catch (e) {
    console.error('Error transforming fixture:', e);
    return null;
  }
}
