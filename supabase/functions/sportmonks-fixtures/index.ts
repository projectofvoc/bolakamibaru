import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map internal league IDs to Sportmonks league IDs
// Note: Liga 1 Indonesia is NOT available in Sportmonks - use API-Football instead
const leagueIdMapping: Record<string, number> = {
  'premier-league': 8,     // English Premier League
  'la-liga': 564,         // Spanish La Liga
  'serie-a': 384,         // Italian Serie A
  'bundesliga': 82,       // German Bundesliga
  'champions-league': 2,  // UEFA Champions League
};

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
    const apiKey = Deno.env.get('SPORTMONKS_API_KEY');
    if (!apiKey) {
      throw new Error('SPORTMONKS_API_KEY not configured');
    }

    // Parse request body for optional league filter
    let leagueId: string | null = null;
    try {
      const body = await req.json();
      leagueId = body.leagueId || null;
    } catch {
      // No body or invalid JSON, use all leagues
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

    // Fetch fixtures from Sportmonks (removed venue include - not available in current plan)
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

    return new Response(
      JSON.stringify({ fixtures }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching fixtures:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, fixtures: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
