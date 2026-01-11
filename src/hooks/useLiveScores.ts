import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

      const { data, error: fnError } = await supabase.functions.invoke('sportmonks-livescore');

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message);
      }

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
