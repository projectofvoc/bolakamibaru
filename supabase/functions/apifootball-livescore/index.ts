import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
    status: {
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    logo: string;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface LiveMatch {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'live' | 'ft' | 'scheduled' | 'postponed';
  minute: number | null;
  league: string;
  leagueShort: string;
  time: string;
}

interface UpcomingMatch {
  id: number;
  homeTeam: { name: string; logo: string | null };
  awayTeam: { name: string; logo: string | null };
  league: { name: string; logo: string | null };
  startingAt: string;
  time: string;
  date: string;
}

interface CachedData {
  liveMatches: LiveMatch[];
  upcomingMatches: UpcomingMatch[];
  recentMatches: LiveMatch[];
  meta: {
    timestamp: string;
    leagues: number[];
  };
}

// Cache TTL in seconds (30 seconds for live data)
const CACHE_TTL_SECONDS = 30;

async function getApiKey(supabase: any): Promise<string | null> {
  // Try to get from database first
  const { data, error } = await supabase
    .from('api_configurations')
    .select('api_key')
    .eq('name', 'api_football_indo')
    .eq('is_active', true)
    .single();
  
  if (data?.api_key) {
    return data.api_key;
  }
  
  // Fallback to environment variable
  return Deno.env.get('API_FOOTBALL_KEY') || null;
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

function mapStatus(shortStatus: string): 'live' | 'ft' | 'scheduled' | 'postponed' {
  const liveStatuses = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'INT', 'LIVE'];
  const finishedStatuses = ['FT', 'AET', 'PEN'];
  const postponedStatuses = ['PST', 'CANC', 'ABD', 'AWD', 'WO'];
  
  if (liveStatuses.includes(shortStatus)) return 'live';
  if (finishedStatuses.includes(shortStatus)) return 'ft';
  if (postponedStatuses.includes(shortStatus)) return 'postponed';
  return 'scheduled';
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  // Convert to WIB (UTC+7)
  const wibOffset = 7 * 60 * 60 * 1000;
  const wibDate = new Date(date.getTime() + wibOffset);
  return wibDate.toISOString().slice(11, 16);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const wibOffset = 7 * 60 * 60 * 1000;
  const wibDate = new Date(date.getTime() + wibOffset);
  
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  return `${days[wibDate.getUTCDay()]}, ${wibDate.getUTCDate()} ${months[wibDate.getUTCMonth()]}`;
}

function transformToLiveMatch(fixture: ApiFootballFixture): LiveMatch {
  const leagueName = fixture.league.name;
  const leagueShort = leagueName.includes('Liga 1') ? 'Liga 1' 
                    : leagueName.includes('Liga 2') ? 'Liga 2' 
                    : leagueName.slice(0, 8);
  
  return {
    id: fixture.fixture.id,
    homeTeam: fixture.teams.home.name,
    awayTeam: fixture.teams.away.name,
    homeScore: fixture.goals.home,
    awayScore: fixture.goals.away,
    status: mapStatus(fixture.fixture.status.short),
    minute: fixture.fixture.status.elapsed,
    league: leagueName,
    leagueShort: leagueShort,
    time: formatTime(fixture.fixture.date),
  };
}

function transformToUpcomingMatch(fixture: ApiFootballFixture): UpcomingMatch {
  return {
    id: fixture.fixture.id,
    homeTeam: { 
      name: fixture.teams.home.name, 
      logo: fixture.teams.home.logo 
    },
    awayTeam: { 
      name: fixture.teams.away.name, 
      logo: fixture.teams.away.logo 
    },
    league: { 
      name: fixture.league.name, 
      logo: fixture.league.logo 
    },
    startingAt: fixture.fixture.date,
    time: formatTime(fixture.fixture.date),
    date: formatDate(fixture.fixture.date),
  };
}

// Helper function untuk menentukan season yang benar
// Liga 1 Indonesia: Agustus - Mei tahun berikutnya
// Jika bulan Jan-Jul -> season = tahun sebelumnya
// Jika bulan Aug-Dec -> season = tahun ini
function getCurrentSeason(): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  // Jika Jan-Jul, musim dimulai tahun lalu
  if (currentMonth <= 7) {
    return currentYear - 1;
  }
  // Jika Aug-Dec, musim dimulai tahun ini
  return currentYear;
}

// Helper function to fetch fixtures for a single league
async function fetchLeagueFixtures(
  baseUrl: string, 
  headers: Record<string, string>, 
  leagueId: number, 
  endpoint: string
): Promise<ApiFootballFixture[]> {
  try {
    const response = await fetch(`${baseUrl}/fixtures?${endpoint}&league=${leagueId}`, { headers });
    const data = await response.json();
    
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error(`API error for league ${leagueId}:`, JSON.stringify(data.errors));
      return [];
    }
    
    return data.response || [];
  } catch (error) {
    console.error(`Failed to fetch league ${leagueId}:`, error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const apiKey = await getApiKey(supabase);
    if (!apiKey) {
      console.error('API key not found');
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          liveMatches: [],
          upcomingMatches: [],
          recentMatches: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get today's date for cache key
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `apifb-livescore:${today}`;

    // Use cache helper
    const { data: cachedData, fromCache } = await getCachedOrFetch<CachedData>(
      supabase,
      cacheKey,
      CACHE_TTL_SECONDS,
      async () => {
        const baseUrl = 'https://v3.football.api-sports.io';
        const headers = { 'x-apisports-key': apiKey };
        
        // Liga 1 Indonesia = 274, Liga 2 Indonesia = 275
        const LIGA_1_ID = 274;
        const LIGA_2_ID = 275;
        const currentSeason = getCurrentSeason();
        console.log(`Using season: ${currentSeason} for Liga Indonesia (current date: ${new Date().toISOString()})`);

        // Fetch all data in parallel - separate calls for each league
        console.log('Fetching Liga 1 & Liga 2 data in parallel...');
        
        const [
          liveL1, liveL2,
          upcomingL1, upcomingL2,
          recentL1, recentL2
        ] = await Promise.all([
          // Live matches
          fetchLeagueFixtures(baseUrl, headers, LIGA_1_ID, 'live=all'),
          fetchLeagueFixtures(baseUrl, headers, LIGA_2_ID, 'live=all'),
          // Upcoming matches
          fetchLeagueFixtures(baseUrl, headers, LIGA_1_ID, `season=${currentSeason}&next=20`),
          fetchLeagueFixtures(baseUrl, headers, LIGA_2_ID, `season=${currentSeason}&next=20`),
          // Recent matches
          fetchLeagueFixtures(baseUrl, headers, LIGA_1_ID, `season=${currentSeason}&last=20`),
          fetchLeagueFixtures(baseUrl, headers, LIGA_2_ID, `season=${currentSeason}&last=20`),
        ]);

        // Combine results
        const allLiveFixtures = [...liveL1, ...liveL2];
        const allUpcomingFixtures = [...upcomingL1, ...upcomingL2];
        const allRecentFixtures = [...recentL1, ...recentL2];

        console.log(`Live matches: Liga1=${liveL1.length}, Liga2=${liveL2.length}, Total=${allLiveFixtures.length}`);
        console.log(`Upcoming matches: Liga1=${upcomingL1.length}, Liga2=${upcomingL2.length}, Total=${allUpcomingFixtures.length}`);
        console.log(`Recent matches: Liga1=${recentL1.length}, Liga2=${recentL2.length}, Total=${allRecentFixtures.length}`);

        // Transform to output format
        const liveMatches: LiveMatch[] = allLiveFixtures
          .map((f: ApiFootballFixture) => transformToLiveMatch(f));

        const upcomingMatches: UpcomingMatch[] = allUpcomingFixtures
          .filter((f: ApiFootballFixture) => mapStatus(f.fixture.status.short) === 'scheduled')
          .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
          .map((f: ApiFootballFixture) => transformToUpcomingMatch(f));

        const recentMatches: LiveMatch[] = allRecentFixtures
          .filter((f: ApiFootballFixture) => mapStatus(f.fixture.status.short) === 'ft')
          .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
          .map((f: ApiFootballFixture) => transformToLiveMatch(f));

        return {
          liveMatches,
          upcomingMatches,
          recentMatches,
          meta: {
            timestamp: new Date().toISOString(),
            leagues: [LIGA_1_ID, LIGA_2_ID],
          }
        };
      }
    );

    return new Response(
      JSON.stringify({
        ...cachedData,
        fromCache,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in apifootball-livescore:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        liveMatches: [],
        upcomingMatches: [],
        recentMatches: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
