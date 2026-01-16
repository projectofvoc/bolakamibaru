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

    const baseUrl = 'https://v3.football.api-sports.io';
    const headers = { 'x-apisports-key': apiKey };
    
    // Liga 1 Indonesia = 274, Liga 2 Indonesia = 275
    const leagueIds = '274';
    const currentSeason = new Date().getFullYear();

    // Fetch live matches
    console.log('Fetching live matches for Liga Indonesia...');
    const liveResponse = await fetch(
      `${baseUrl}/fixtures?live=all&league=${leagueIds}`,
      { headers }
    );
    const liveData = await liveResponse.json();
    console.log('Live matches response:', JSON.stringify(liveData).slice(0, 500));

    const liveMatches: LiveMatch[] = (liveData.response || [])
      .map((f: ApiFootballFixture) => transformToLiveMatch(f));

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    
    // Fetch upcoming matches (next 20)
    console.log('Fetching upcoming matches...');
    const upcomingResponse = await fetch(
      `${baseUrl}/fixtures?league=${leagueIds}&season=${currentSeason}&next=20`,
      { headers }
    );
    const upcomingData = await upcomingResponse.json();
    console.log('Upcoming matches count:', upcomingData.response?.length || 0);

    const upcomingMatches: UpcomingMatch[] = (upcomingData.response || [])
      .filter((f: ApiFootballFixture) => mapStatus(f.fixture.status.short) === 'scheduled')
      .map((f: ApiFootballFixture) => transformToUpcomingMatch(f));

    // Fetch recent matches (last 20)
    console.log('Fetching recent matches...');
    const recentResponse = await fetch(
      `${baseUrl}/fixtures?league=${leagueIds}&season=${currentSeason}&last=20`,
      { headers }
    );
    const recentData = await recentResponse.json();
    console.log('Recent matches count:', recentData.response?.length || 0);

    const recentMatches: LiveMatch[] = (recentData.response || [])
      .filter((f: ApiFootballFixture) => mapStatus(f.fixture.status.short) === 'ft')
      .map((f: ApiFootballFixture) => transformToLiveMatch(f));

    return new Response(
      JSON.stringify({
        liveMatches,
        upcomingMatches,
        recentMatches,
        meta: {
          timestamp: new Date().toISOString(),
          leagues: leagueIds,
        }
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
