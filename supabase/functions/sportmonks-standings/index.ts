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

// Static League ID mapping (these don't change between seasons)
const leagueIdMapping: Record<string, number> = {
  'liga-1': 501,            // Liga 1 Indonesia
  'liga-2': 648,            // Liga 2 Indonesia  
  'premier-league': 8,      // Premier League (England)
  'la-liga': 564,           // La Liga (Spain)
  'serie-a': 384,           // Serie A (Italy)
  'bundesliga': 82,         // Bundesliga (Germany)
  'champions-league': 2,    // UEFA Champions League
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

// Function to fetch current season ID dynamically from Sportmonks
async function getCurrentSeasonId(leagueId: number, apiKey: string): Promise<number | null> {
  try {
    console.log(`Fetching current season for league ID: ${leagueId}`);
    
    const response = await fetch(
      `https://api.sportmonks.com/v3/football/leagues/${leagueId}?api_token=${apiKey}&include=currentSeason`,
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
    console.log(`League ${leagueId} response:`, JSON.stringify(data).slice(0, 500));

    // Extract current season ID from the response
    const currentSeasonId = data.data?.current_season_id || data.data?.currentseason?.id || null;
    
    if (currentSeasonId) {
      console.log(`Found current season ID: ${currentSeasonId} for league ${leagueId}`);
      return currentSeasonId;
    }

    // If currentSeason is included, try to get it from there
    if (data.data?.currentSeason?.id) {
      console.log(`Found current season ID from include: ${data.data.currentSeason.id}`);
      return data.data.currentSeason.id;
    }

    console.log(`No current season found for league ${leagueId}`);
    return null;
  } catch (error) {
    console.error(`Error fetching current season for league ${leagueId}:`, error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body or URL params
    const url = new URL(req.url);
    let leagueSlug = url.searchParams.get('league') || 'premier-league';

    // Also support POST body
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.league) {
          leagueSlug = body.league;
        }
      } catch (e) {
        // Ignore JSON parse errors, use default
      }
    }

    // Create Supabase client with service role for reading api_configurations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get API key from database or fallback to env
    const apiKey = await getApiKey(supabase, 'sportmonks');
    
    if (!apiKey) {
      throw new Error('SPORTMONKS_API_KEY not configured in database or environment');
    }

    // Get static League ID for the league slug
    const leagueId = leagueIdMapping[leagueSlug];
    
    if (!leagueId) {
      return new Response(JSON.stringify({ 
        error: `League not supported: ${leagueSlug}`,
        availableLeagues: Object.keys(leagueIdMapping),
        standings: [] 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing request for league: ${leagueSlug} (League ID: ${leagueId})`);

    // Step 1: Fetch current season ID dynamically
    const seasonId = await getCurrentSeasonId(leagueId, apiKey);

    if (!seasonId) {
      console.error(`Could not find current season for league: ${leagueSlug} (${leagueId})`);
      return new Response(JSON.stringify({ 
        error: `No current season found for league: ${leagueSlug}. This league may not be available in your Sportmonks subscription.`,
        leagueId,
        standings: [] 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching standings for league: ${leagueSlug}, season ID: ${seasonId}`);

    // Step 2: Fetch standings using the dynamic season ID
    const response = await fetch(
      `https://api.sportmonks.com/v3/football/standings/seasons/${seasonId}?api_token=${apiKey}&include=participant;details`,
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
      throw new Error(`Sportmonks API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Sportmonks standings response:', JSON.stringify(data).slice(0, 500));

    // Transform the standings data
    const standingsData = data.data || [];
    
    // Find the overall standings (not home/away specific)
    // Sportmonks returns standings grouped by stage, we want the overall one
    const standings: StandingTeam[] = [];
    
    for (const standing of standingsData) {
      // Skip if no participant data
      if (!standing.participant) continue;
      
      // Extract stats from details array
      const details = standing.details || [];
      
      const getDetailValue = (typeId: number): number => {
        const detail = details.find((d: any) => d.type_id === typeId);
        return detail?.value || 0;
      };

      // Sportmonks type_ids for standing details:
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
      
      // Only add if we have valid position (skip duplicates from home/away splits)
      if (team.position > 0 && !standings.find(s => s.teamId === team.teamId)) {
        standings.push(team);
      }
    }

    // Sort by position
    standings.sort((a, b) => a.position - b.position);

    const leagueName = leagueNames[leagueSlug] || { id: leagueSlug, en: leagueSlug };

    return new Response(JSON.stringify({ 
      standings,
      league: leagueSlug,
      leagueName,
      leagueId,
      seasonId,
      totalTeams: standings.length,
    }), {
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
