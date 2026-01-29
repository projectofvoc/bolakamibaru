import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StandingTeam {
  position: number;
  teamId: number;
  teamName: string;
  teamLogo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string;
}

interface CachedStandingsData {
  standings: StandingTeam[];
  league: string;
  leagueName: { id: string; en: string };
  seasonLabel: string;
  seasonId: number | null;
  totalTeams: number;
  source: string;
}

// Cache TTL: 30 minutes for standings (klasemen jarang berubah)
const CACHE_TTL_SECONDS = 30 * 60;

// Static League ID mapping for Sportmonks (international leagues)
const sportmonksLeagueIdMapping: Record<string, number> = {
  'premier-league': 8,      // Premier League (England)
  'la-liga': 564,           // La Liga (Spain)
  'serie-a': 384,           // Serie A (Italy)
  'bundesliga': 82,         // Bundesliga (Germany)
  'champions-league': 2,    // UEFA Champions League
};

// API Football league IDs for Indonesian leagues
const apiFootballLeagueIds: Record<string, number> = {
  'liga-1': 274,   // Liga 1 Indonesia
  'liga-2': 275,   // Liga 2 Indonesia
};

// League display names
const leagueNames: Record<string, { id: string; en: string }> = {
  'liga-1': { id: 'Liga 1 Indonesia', en: 'Liga 1 Indonesia' },
  'liga-2': { id: 'Liga 2 Indonesia', en: 'Liga 2 Indonesia' },
  'premier-league': { id: 'Premier League', en: 'Premier League' },
  'la-liga': { id: 'La Liga', en: 'La Liga' },
  'serie-a': { id: 'Serie A', en: 'Serie A' },
  'bundesliga': { id: 'Bundesliga', en: 'Bundesliga' },
  'champions-league': { id: 'Liga Champions', en: 'Champions League' },
};

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

// Function to get Sportmonks API key
async function getSportmonksApiKey(supabase: any): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('api_configurations')
      .select('api_key')
      .eq('name', 'sportmonks')
      .eq('is_active', true)
      .single();
    
    if (data?.api_key) {
      console.log('Using Sportmonks API key from database');
      return data.api_key;
    }
  } catch (e) {
    console.log('Failed to get Sportmonks API key from database:', e);
  }
  
  // Fallback to environment variable
  console.log('Falling back to SPORTMONKS_API_KEY env variable');
  return Deno.env.get('SPORTMONKS_API_KEY') || null;
}

// Function to get API Football key (for Indonesian leagues)
async function getApiFootballKey(supabase: any): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('api_configurations')
      .select('api_key')
      .eq('name', 'api_football_indo')
      .eq('is_active', true)
      .single();
    
    if (data?.api_key) {
      console.log('Using API Football key from database');
      return data.api_key;
    }
  } catch (e) {
    console.log('Failed to get API Football key from database:', e);
  }
  
  // Fallback to environment variable
  console.log('Falling back to API_FOOTBALL_KEY env variable');
  return Deno.env.get('API_FOOTBALL_KEY') || null;
}

// Function to fetch standings from API Football (for Indonesian leagues)
async function fetchApiFootballStandings(
  leagueId: number,
  season: number,
  apiKey: string
): Promise<{ standings: StandingTeam[]; seasonLabel: string } | null> {
  try {
    console.log(`Fetching API Football standings for league ${leagueId}, season ${season}`);
    
    const response = await fetch(
      `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`,
      {
        method: 'GET',
        headers: {
          'x-apisports-key': apiKey,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Football error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('API Football response:', JSON.stringify(data).slice(0, 800));

    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error('API Football errors:', JSON.stringify(data.errors));
      return null;
    }

    // API Football response structure:
    // response[0].league.standings[0] = array of teams
    const leagueData = data.response?.[0];
    if (!leagueData?.league?.standings?.[0]) {
      console.log('No standings data in API Football response');
      return null;
    }

    const standingsData = leagueData.league.standings[0];
    const standings: StandingTeam[] = standingsData.map((team: any) => ({
      position: team.rank || 0,
      teamId: team.team?.id || 0,
      teamName: team.team?.name || 'Unknown',
      teamLogo: team.team?.logo || '',
      played: team.all?.played || 0,
      won: team.all?.win || 0,
      drawn: team.all?.draw || 0,
      lost: team.all?.lose || 0,
      goalsFor: team.all?.goals?.for || 0,
      goalsAgainst: team.all?.goals?.against || 0,
      goalDifference: team.goalsDiff || 0,
      points: team.points || 0,
      form: team.form || undefined,
    }));

    const seasonLabel = `${season}/${(season + 1).toString().slice(-2)}`;
    
    return { standings, seasonLabel };
  } catch (error) {
    console.error('Error fetching API Football standings:', error);
    return null;
  }
}

// Function to find season ID for a specific year range from Sportmonks
async function findSeasonIdForYear(
  leagueId: number,
  targetStartYear: number,
  apiKey: string
): Promise<number | null> {
  try {
    console.log(`Finding season ID for league ${leagueId}, target year ${targetStartYear}`);
    
    // Fetch league with all seasons included
    const response = await fetch(
      `https://api.sportmonks.com/v3/football/leagues/${leagueId}?api_token=${apiKey}&include=seasons`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch league ${leagueId}:`, response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log(`League ${leagueId} seasons response:`, JSON.stringify(data).slice(0, 1000));

    const seasons = data.data?.seasons || [];
    
    // Look for a season that matches the target year
    // Season can have name like "2025/2026" or dates like starting_at: "2025-08-01"
    for (const season of seasons) {
      // Check by starting_at date
      if (season.starting_at) {
        const startYear = new Date(season.starting_at).getFullYear();
        if (startYear === targetStartYear) {
          console.log(`Found season by date: ID=${season.id}, name=${season.name}, starting_at=${season.starting_at}`);
          return season.id;
        }
      }
      
      // Check by name (e.g., "2025/2026" or "2025-2026")
      if (season.name) {
        const nameMatch = season.name.match(/^(\d{4})/);
        if (nameMatch && parseInt(nameMatch[1]) === targetStartYear) {
          console.log(`Found season by name: ID=${season.id}, name=${season.name}`);
          return season.id;
        }
      }
    }

    // If no exact match, try to get current season as fallback
    const currentSeasonId = data.data?.current_season_id;
    if (currentSeasonId) {
      console.log(`Using current season as fallback: ${currentSeasonId}`);
      return currentSeasonId;
    }

    console.log(`No matching season found for year ${targetStartYear}`);
    return null;
  } catch (error) {
    console.error(`Error finding season for league ${leagueId}:`, error);
    return null;
  }
}

// Function to fetch standings from Sportmonks
async function fetchSportmonksStandings(
  seasonId: number,
  apiKey: string
): Promise<StandingTeam[]> {
  try {
    console.log(`Fetching Sportmonks standings for season ID: ${seasonId}`);
    
    const response = await fetch(
      `https://api.sportmonks.com/v3/football/standings/seasons/${seasonId}?api_token=${apiKey}&include=participant;details`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sportmonks standings error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log('Sportmonks standings response:', JSON.stringify(data).slice(0, 500));

    const standingsData = data.data || [];
    const standings: StandingTeam[] = [];
    
    for (const standing of standingsData) {
      if (!standing.participant) continue;
      
      const details = standing.details || [];
      
      const getDetailValue = (typeId: number): number => {
        const detail = details.find((d: any) => d.type_id === typeId);
        return detail?.value || 0;
      };

      // Sportmonks type_ids:
      // 129 = Matches Played, 130 = Won, 131 = Draw, 132 = Lost
      // 133 = Goals For, 134 = Goals Against, 135 = Goal Difference
      // 187 = Points
      
      const team: StandingTeam = {
        position: standing.position || 0,
        teamId: standing.participant?.id || 0,
        teamName: standing.participant?.name || 'Unknown',
        teamLogo: standing.participant?.image_path || '',
        played: getDetailValue(129),
        won: getDetailValue(130),
        drawn: getDetailValue(131),
        lost: getDetailValue(132),
        goalsFor: getDetailValue(133),
        goalsAgainst: getDetailValue(134),
        goalDifference: getDetailValue(135),
        points: getDetailValue(187) || standing.points || 0,
        form: standing.form || undefined,
      };
      
      if (team.position > 0 && !standings.find(s => s.teamId === team.teamId)) {
        standings.push(team);
      }
    }

    standings.sort((a, b) => a.position - b.position);
    return standings;
  } catch (error) {
    console.error('Error fetching Sportmonks standings:', error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const url = new URL(req.url);
    let leagueSlug = url.searchParams.get('league') || 'premier-league';
    let seasonStartYear = 2025; // Default to 2025/2026 season

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.league) leagueSlug = body.league;
        if (body.seasonStartYear) seasonStartYear = parseInt(body.seasonStartYear) || 2025;
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const leagueName = leagueNames[leagueSlug] || { id: leagueSlug, en: leagueSlug };
    const seasonLabel = `${seasonStartYear}/${(seasonStartYear + 1).toString().slice(-2)}`;
    const cacheKey = `standings:${leagueSlug}:${seasonStartYear}`;

    console.log(`Processing standings request: league=${leagueSlug}, seasonStartYear=${seasonStartYear}`);

    // Check if this is an Indonesian league (use API Football)
    if (apiFootballLeagueIds[leagueSlug]) {
      const apiFootballId = apiFootballLeagueIds[leagueSlug];
      console.log(`Using API Football for ${leagueSlug} (league ID: ${apiFootballId})`);

      const apiKey = await getApiFootballKey(supabase);
      if (!apiKey) {
        throw new Error('API_FOOTBALL_KEY not configured');
      }

      // Use cache helper
      const { data: cachedData, fromCache } = await getCachedOrFetch<CachedStandingsData>(
        supabase,
        cacheKey,
        CACHE_TTL_SECONDS,
        async () => {
          const result = await fetchApiFootballStandings(apiFootballId, seasonStartYear, apiKey);

          if (!result || result.standings.length === 0) {
            return {
              standings: [],
              league: leagueSlug,
              leagueName,
              seasonLabel,
              seasonId: null,
              totalTeams: 0,
              source: 'api_football',
            };
          }

          return {
            standings: result.standings,
            league: leagueSlug,
            leagueName,
            seasonLabel: result.seasonLabel,
            seasonId: null,
            totalTeams: result.standings.length,
            source: 'api_football',
          };
        }
      );

      return new Response(JSON.stringify({ ...cachedData, fromCache }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // International leagues - use Sportmonks
    const sportmonksLeagueId = sportmonksLeagueIdMapping[leagueSlug];
    
    if (!sportmonksLeagueId) {
      return new Response(JSON.stringify({ 
        error: `League not supported: ${leagueSlug}`,
        availableLeagues: [...Object.keys(apiFootballLeagueIds), ...Object.keys(sportmonksLeagueIdMapping)],
        standings: [] 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Using Sportmonks for ${leagueSlug} (league ID: ${sportmonksLeagueId})`);

    const apiKey = await getSportmonksApiKey(supabase);
    if (!apiKey) {
      throw new Error('SPORTMONKS_API_KEY not configured');
    }

    // Use cache helper
    const { data: cachedData, fromCache } = await getCachedOrFetch<CachedStandingsData>(
      supabase,
      cacheKey,
      CACHE_TTL_SECONDS,
      async () => {
        // Find the correct season ID for the target year
        const seasonId = await findSeasonIdForYear(sportmonksLeagueId, seasonStartYear, apiKey);

        if (!seasonId) {
          return { 
            standings: [],
            league: leagueSlug,
            leagueName,
            seasonLabel,
            seasonId: null,
            totalTeams: 0,
            source: 'sportmonks',
          };
        }

        console.log(`Found season ID: ${seasonId} for ${leagueSlug} ${seasonLabel}`);

        // Fetch standings
        const standings = await fetchSportmonksStandings(seasonId, apiKey);

        return { 
          standings,
          league: leagueSlug,
          leagueName,
          seasonLabel,
          seasonId,
          totalTeams: standings.length,
          source: 'sportmonks',
        };
      }
    );

    return new Response(JSON.stringify({ ...cachedData, fromCache }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sportmonks-standings function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage, standings: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
