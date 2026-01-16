import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LiveMatchIndo {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'live' | 'ft' | 'scheduled' | 'postponed';
  minute: number | null;
  league: string;
  time: string;
}

export interface UpcomingMatchIndo {
  id: number;
  homeTeam: { name: string; logo: string | null };
  awayTeam: { name: string; logo: string | null };
  league: { name: string; logo: string | null };
  startingAt: string;
  time: string;
  date: string;
}

export interface UseLiveScoresIndoResult {
  liveMatches: LiveMatchIndo[];
  upcomingMatches: UpcomingMatchIndo[];
  recentMatches: LiveMatchIndo[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLiveScoresIndonesia(): UseLiveScoresIndoResult {
  const [liveMatches, setLiveMatches] = useState<LiveMatchIndo[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatchIndo[]>([]);
  const [recentMatches, setRecentMatches] = useState<LiveMatchIndo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('apifootball-livescore');

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data) {
        setLiveMatches(data.liveMatches || []);
        setUpcomingMatches(data.upcomingMatches || []);
        setRecentMatches(data.recentMatches || []);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch live scores';
      console.error('Error fetching Indonesia live scores:', message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    liveMatches,
    upcomingMatches,
    recentMatches,
    isLoading,
    error,
    refetch: fetchData,
  };
}
