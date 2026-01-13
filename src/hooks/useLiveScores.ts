import { useState, useEffect, useCallback } from 'react';

// External Supabase configuration for centralized API management
const EXTERNAL_SUPABASE_URL = import.meta.env.VITE_EXTERNAL_SUPABASE_URL;
const EXTERNAL_SUPABASE_ANON_KEY = import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY;

// Debug logging for environment variables
console.log('[Live Scores] External Supabase URL:', EXTERNAL_SUPABASE_URL || 'NOT SET');
console.log('[Live Scores] External Supabase Key configured:', !!EXTERNAL_SUPABASE_ANON_KEY);

export interface LiveMatch {
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

interface UseLiveScoresResult {
  matches: LiveMatch[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  debugInfo: {
    lastUrl: string | null;
    lastStatus: number | null;
    lastFetchedAt: string | null;
  };
}

// Transform raw Sportmonks fixture to LiveMatch format (fallback if backend returns raw data)
function transformRawFixture(fixture: any): LiveMatch | null {
  try {
    const participants = fixture.participants || [];
    const homeTeam = participants.find((p: any) => p.meta?.location === 'home');
    const awayTeam = participants.find((p: any) => p.meta?.location === 'away');
    
    const scores = fixture.scores || [];
    const homeScore = scores.find((s: any) => s.participant_id === homeTeam?.id && s.description === 'CURRENT')?.score?.goals;
    const awayScore = scores.find((s: any) => s.participant_id === awayTeam?.id && s.description === 'CURRENT')?.score?.goals;
    
    const stateId = fixture.state?.id;
    let status: 'live' | 'ft' | 'scheduled' | 'post' = 'scheduled';
    if ([2, 3, 4, 5].includes(stateId)) status = 'live';
    else if (stateId === 5) status = 'ft';
    else if ([7, 8, 9, 10, 11].includes(stateId)) status = 'post';
    
    const startTime = new Date(fixture.starting_at);
    const timeStr = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    return {
      id: fixture.id,
      homeTeam: homeTeam?.name || 'Unknown',
      awayTeam: awayTeam?.name || 'Unknown',
      homeScore: homeScore ?? null,
      awayScore: awayScore ?? null,
      status,
      minute: fixture.periods?.[0]?.minutes ?? null,
      league: fixture.league?.name || 'Unknown League',
      leagueShort: fixture.league?.short_code || fixture.league?.name?.slice(0, 3).toUpperCase() || 'UNK',
      time: timeStr,
    };
  } catch {
    return null;
  }
}

export function useLiveScores(): UseLiveScoresResult {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<{
    lastUrl: string | null;
    lastStatus: number | null;
    lastFetchedAt: string | null;
  }>({ lastUrl: null, lastStatus: null, lastFetchedAt: null });

  const fetchLiveScores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if external Supabase is configured
      if (!EXTERNAL_SUPABASE_URL || !EXTERNAL_SUPABASE_ANON_KEY) {
        console.warn('[Live Scores] External Supabase not configured');
        setError('ENV_NOT_CONFIGURED: VITE_EXTERNAL_SUPABASE_URL or VITE_EXTERNAL_SUPABASE_ANON_KEY not set');
        setIsLoading(false);
        return;
      }

      const url = `${EXTERNAL_SUPABASE_URL}/functions/v1/sportmonks-api`;
      console.log('[Live Scores] Fetching from:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${EXTERNAL_SUPABASE_ANON_KEY}`,
          'apikey': EXTERNAL_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ endpoint: 'livescores' }),
      });

      setDebugInfo({
        lastUrl: url,
        lastStatus: response.status,
        lastFetchedAt: new Date().toISOString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Live Scores] API error:', response.status, errorText);
        throw new Error(`API_ERROR_${response.status}: ${errorText.slice(0, 100)}`);
      }

      const data = await response.json();
      console.log('[Live Scores] Response data keys:', Object.keys(data));

      // Handle different response formats
      if (data?.matches && Array.isArray(data.matches)) {
        // Ideal case: backend returns transformed matches
        setMatches(data.matches);
        console.log('[Live Scores] Loaded', data.matches.length, 'matches (transformed)');
      } else if (data?.data && Array.isArray(data.data)) {
        // Fallback: backend returns raw Sportmonks data
        console.log('[Live Scores] Transforming raw data...');
        const transformed = data.data
          .map(transformRawFixture)
          .filter((m: LiveMatch | null): m is LiveMatch => m !== null);
        setMatches(transformed);
        console.log('[Live Scores] Loaded', transformed.length, 'matches (raw transformed)');
      } else if (data?.error) {
        throw new Error(`BACKEND_ERROR: ${data.error}`);
      } else {
        console.warn('[Live Scores] Unexpected response format:', data);
        setMatches([]);
      }
    } catch (err) {
      console.error('[Live Scores] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch live scores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveScores();

    // Refresh every 60 seconds for live updates
    const interval = setInterval(fetchLiveScores, 60000);

    return () => clearInterval(interval);
  }, [fetchLiveScores]);

  return { matches, isLoading, error, refetch: fetchLiveScores, debugInfo };
}
