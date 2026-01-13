import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapping internal league ID to Sportmonks league ID
const leagueIdMapping: Record<string, number> = {
  'liga-1': 501,
  'premier-league': 8,
  'la-liga': 564,
  'serie-a': 384,
  'bundesliga': 82,
  'champions-league': 2,
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('SPORTMONKS_API_KEY');
    
    if (!apiKey) {
      console.error('SPORTMONKS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all league IDs
    const leagueIds = Object.values(leagueIdMapping).join(',');
    
    console.log('Fetching leagues from Sportmonks:', leagueIds);
    
    const response = await fetch(
      `https://api.sportmonks.com/v3/football/leagues?api_token=${apiKey}&filter=leagueIds:${leagueIds}`,
      { 
        headers: { 
          'Accept': 'application/json',
        } 
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sportmonks API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch leagues', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    console.log('Sportmonks response:', JSON.stringify(data, null, 2));

    // Transform to simpler format with internal ID mapping
    const leagues = data.data?.map((league: any) => {
      // Find the internal ID for this Sportmonks league
      const internalId = Object.entries(leagueIdMapping).find(
        ([_, sportmonksId]) => sportmonksId === league.id
      )?.[0] || null;

      return {
        id: league.id,
        internalId,
        name: league.name,
        shortCode: league.short_code,
        logo: league.image_path,
        countryId: league.country_id,
      };
    }) || [];

    console.log('Transformed leagues:', JSON.stringify(leagues, null, 2));

    return new Response(
      JSON.stringify({ leagues }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in sportmonks-leagues:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
