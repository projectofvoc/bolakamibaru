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
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Live Scores] Calling sportmonks-livescore edge function...');
      
      const { data, error: fnError } = await supabase.functions.invoke('sportmonks-livescore');

      if (fnError) {
        console.error('[Live Scores] Function error:', fnError);
        throw new Error(fnError.message || 'Edge function error');
      }

      console.log('[Live Scores] Response:', data);

      if (data?.error) {
        throw new Error(data.error);
      }

      const matchesData = data?.matches || [];
      setMatches(matchesData);
      console.log('[Live Scores] Loaded', matchesData.length, 'matches');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Live Scores] Error:', errorMessage);
      setError(errorMessage);
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveScores();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchLiveScores, 60000);
    return () => clearInterval(interval);
  }, [fetchLiveScores]);

  return { matches, isLoading, error, refetch: fetchLiveScores };
}
