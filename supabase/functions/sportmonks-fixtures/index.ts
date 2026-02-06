import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache TTL: 15 minutes for fixtures to reduce API calls
const CACHE_TTL_SECONDS = 15 * 60;

// Map internal league IDs to Sportmonks league IDs
// Note: Liga 1 & Liga 2 Indonesia are NOT available in Sportmonks - use API-Football instead
const leagueIdMapping: Record<string, number> = {
  'premier-league': 8,     // English Premier League
  'la-liga': 564,         // Spanish La Liga
  'serie-a': 384,         // Italian Serie A
  'bundesliga': 82,       // German Bundesliga
  'champions-league': 2,  // UEFA Champions League
};

// Indonesian leagues - handled by API Football
const indonesianLeagues = ['liga-1', 'liga-2'];

// League colors for UI
const leagueColors: Record<string, string> = {
  'premier-league': 'purple',
  'la-liga': 'orange',
  'serie-a': 'blue',
  'bundesliga': 'red',
  'champions-league': 'blue',
};

interface SportmonksParticipant {
  id: number;
  name: string;
  short_code?: string;
  image_path?: string;
  meta?: {
    location?: string;
  };
}

interface SportmonksLeague {
  id: number;
  name: string;
  short_code?: string;
  image_path?: string;
}

interface SportmonksFixture {
  id: number;
  name: string;
  starting_at: string;
  participants?: SportmonksParticipant[];
  league?: SportmonksLeague;
  venue?: {
    name?: string;
    city?: string;
  };
}

interface TransformedFixture {
  id: number;
  homeTeam: {
    id: number;
    name: string;
    shortCode: string | null;
    logo: string | null;
  };
  awayTeam: {
    id: number;
    name: string;
    shortCode: string | null;
    logo: string | null;
  };
  league: {
    id: number;
    internalId: string;
    name: string;
    shortCode: string | null;
    logo: string | null;
    color: string;
  };
  startingAt: string;
  time: string;
  dateLabel: { id: string; en: string };
  venue: string | null;
}

interface CachedFixturesData {
  fixtures: TransformedFixture[];
}

// Helper function to get API key from database with fallback to env
async function getApiKey(supabase: any, configName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('api_configurations')
      .select('api_key')
      .eq('name', configName)
      .eq('is_active', true)
      .single();

    if (!error && data?.api_key) {
      console.log(`Using API key from database for: ${configName}`);
      return data.api_key;
    }
  } catch (e) {
    console.log(`Error fetching API key from database: ${e}`);
  }

  // Fallback to environment variable
  const envKey = Deno.env.get('SPORTMONKS_API_KEY');
  if (envKey) {
    console.log(`Using API key from environment variable`);
    return envKey;
  }

  return null;
}

// Cache helper function with rate limit fallback
async function getCachedOrFetch<T>(
  supabase: any,
  cacheKey: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>,
  isValidData?: (data: T) => boolean,
  defaultValue?: T
): Promise<{ data: T; fromCache: boolean; rateLimited?: boolean }> {
  let expiredCache: T | null = null;
  
  try {
    // 1. Check cache (including expired for fallback)
    const { data: cached, error: cacheError } = await supabase
      .from('api_cache')
      .select('cache_value, expires_at')
      .eq('cache_key', cacheKey)
      .single();
    
    if (!cacheError && cached) {
      const isExpired = new Date(cached.expires_at) < new Date();
      if (!isExpired) {
        console.log(`[Cache HIT] ${cacheKey}`);
        return { data: cached.cache_value as T, fromCache: true };
      } else {
        expiredCache = cached.cache_value as T;
        console.log(`[Cache EXPIRED] ${cacheKey} - will try fresh fetch`);
      }
    }
  } catch (e) {
    console.log(`[Cache] Error checking cache: ${e}`);
  }
  
  // 2. Try to fetch fresh data
  console.log(`[Cache MISS] ${cacheKey}`);
  try {
    const freshData = await fetchFn();
    
    // 3. Only store in cache if data is valid
    const shouldCache = isValidData ? isValidData(freshData) : true;
    
    if (shouldCache) {
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
    } else {
      console.log(`[Cache] Skipped storing (invalid/empty data): ${cacheKey}`);
    }
    
    return { data: freshData, fromCache: false };
  } catch (fetchError) {
    const errorMsg = fetchError instanceof Error ? fetchError.message : '';
    if (errorMsg.includes('429')) {
      console.log(`[Rate Limited] Falling back to expired cache or default`);
      if (expiredCache !== null) {
        return { data: expiredCache, fromCache: true, rateLimited: true };
      }
    }
    console.log(`[Fetch Error] ${errorMsg}`);
    if (defaultValue !== undefined) {
      return { data: defaultValue, fromCache: false, rateLimited: errorMsg.includes('429') };
    }
    throw fetchError;
  }
}

function getDateLabel(date: Date, now: Date): { id: string; en: string } {
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const dayOfWeek = date.getDay();
  
  const dayNames = {
    id: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  };

  if (diffDays === 0) {
    return { id: 'Hari Ini', en: 'Today' };
  } else if (diffDays === 1) {
    return { id: 'Besok', en: 'Tomorrow' };
  } else {
    return {
      id: dayNames.id[dayOfWeek],
      en: dayNames.en[dayOfWeek],
    };
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  // Add 7 hours for WIB (UTC+7)
  date.setHours(date.getHours() + 7);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getInternalLeagueId(sportmonksId: number): string | null {
  for (const [internalId, smId] of Object.entries(leagueIdMapping)) {
    if (smId === sportmonksId) {
      return internalId;
    }
  }
  return null;
}

function transformFixture(fixture: SportmonksFixture, now: Date): TransformedFixture | null {
  const participants = fixture.participants || [];
  const homeTeam = participants.find(p => p.meta?.location === 'home');
  const awayTeam = participants.find(p => p.meta?.location === 'away');

  if (!homeTeam || !awayTeam || !fixture.league) {
    return null;
  }

  const internalLeagueId = getInternalLeagueId(fixture.league.id);
  if (!internalLeagueId) {
    return null;
  }

  const fixtureDate = new Date(fixture.starting_at);

  return {
    id: fixture.id,
    homeTeam: {
      id: homeTeam.id,
      name: homeTeam.name,
      shortCode: homeTeam.short_code || null,
      logo: homeTeam.image_path || null,
    },
    awayTeam: {
      id: awayTeam.id,
      name: awayTeam.name,
      shortCode: awayTeam.short_code || null,
      logo: awayTeam.image_path || null,
    },
    league: {
      id: fixture.league.id,
      internalId: internalLeagueId,
      name: fixture.league.name,
      shortCode: fixture.league.short_code || null,
      logo: fixture.league.image_path || null,
      color: leagueColors[internalLeagueId] || 'blue',
    },
    startingAt: fixture.starting_at,
    time: formatTime(fixture.starting_at),
    dateLabel: getDateLabel(fixtureDate, now),
    venue: fixture.venue?.name || null,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for optional league filter
    let leagueId: string | null = null;
    try {
      const body = await req.json();
      leagueId = body.leagueId || null;
    } catch {
      // No body or invalid JSON, use all leagues
    }

    // Handle Indonesian leagues - they use API Football, not Sportmonks
    if (leagueId && indonesianLeagues.includes(leagueId)) {
      console.log(`Liga Indonesia (${leagueId}) - use API Football instead`);
      return new Response(
        JSON.stringify({ 
          fixtures: [], 
          source: 'use-api-football',
          message: `${leagueId} fixtures are provided by API Football`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API key from database (with fallback to env)
    const apiKey = await getApiKey(supabase, 'sportmonks');
    if (!apiKey) {
      throw new Error('Sportmonks API key not configured in database or environment');
    }

    // Calculate date range (today + 7 days)
    const now = new Date();
    const startDate = now.toISOString().split('T')[0];
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Build league IDs to fetch
    const leagueIds = leagueId 
      ? [leagueIdMapping[leagueId]].filter(Boolean)
      : Object.values(leagueIdMapping);

    if (leagueIds.length === 0) {
      return new Response(
        JSON.stringify({ fixtures: [], error: 'Invalid league ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cache key includes league filter and date range
    const cacheKey = `fixtures:${leagueId || 'all'}:${startDate}`;

    // Validator: only cache if we have fixtures
    const hasValidData = (data: CachedFixturesData): boolean => {
      return data.fixtures.length > 0;
    };

    // Use cache helper with rate limit fallback
    const { data: cachedData, fromCache, rateLimited } = await getCachedOrFetch<CachedFixturesData>(
      supabase,
      cacheKey,
      CACHE_TTL_SECONDS,
      async () => {
        // Fetch fixtures from Sportmonks
        const url = `https://api.sportmonks.com/v3/football/fixtures/between/${startDate}/${endDate}?api_token=${apiKey}&include=participants;league&filters=fixtureLeagues:${leagueIds.join(',')}`;
        
        console.log(`Fetching fixtures from ${startDate} to ${endDate} for leagues: ${leagueIds.join(',')}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Sportmonks API error:', errorText);
          throw new Error(`Sportmonks API error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Received ${data.data?.length || 0} fixtures from Sportmonks`);

        // Transform fixtures
        const fixtures: TransformedFixture[] = [];
        for (const fixture of data.data || []) {
          const transformed = transformFixture(fixture, now);
          if (transformed) {
            fixtures.push(transformed);
          }
        }

        // Sort by date
        fixtures.sort((a, b) => new Date(a.startingAt).getTime() - new Date(b.startingAt).getTime());

        console.log(`Transformed ${fixtures.length} fixtures`);

        return { fixtures };
      },
      hasValidData,
      { fixtures: [] } // Default value if rate limited
    );

    return new Response(
      JSON.stringify({ ...cachedData, fromCache, rateLimited }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching fixtures:', errorMessage);
    
    // Return graceful response instead of 500
    return new Response(
      JSON.stringify({ 
        fixtures: [], 
        error: errorMessage,
        rateLimited: errorMessage.includes('429')
      }),
      { 
        status: errorMessage.includes('429') ? 200 : 500, // Return 200 for rate limit
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
