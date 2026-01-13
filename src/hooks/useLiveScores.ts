import { useState, useEffect, useCallback } from 'react';

// External Supabase configuration for centralized API management
const EXTERNAL_SUPABASE_URL = import.meta.env.VITE_EXTERNAL_SUPABASE_URL;
const EXTERNAL_SUPABASE_ANON_KEY = import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY;

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
}

export function useLiveScores(): UseLiveScoresResult {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveScores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if external Supabase is configured
      if (!EXTERNAL_SUPABASE_URL || !EXTERNAL_SUPABASE_ANON_KEY) {
        console.warn('External Supabase not configured, skipping live scores fetch');
        setError('External API not configured');
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${EXTERNAL_SUPABASE_URL}/functions/v1/sportmonks-api`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${EXTERNAL_SUPABASE_ANON_KEY}`,
            'apikey': EXTERNAL_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ endpoint: 'livescores' }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('External API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data?.matches) {
        setMatches(data.matches);
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Error fetching live scores:', err);
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

  return { matches, isLoading, error, refetch: fetchLiveScores };
}
