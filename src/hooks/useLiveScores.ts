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
      console.log('[Live Scores] Fetching from both Sportmonks and API-Football...');
      
      // Fetch from both APIs in parallel
      const [sportmonksResult, apiFootballResult] = await Promise.all([
        supabase.functions.invoke('sportmonks-livescore'),
        supabase.functions.invoke('apifootball-livescore')
      ]);

      const sportmonksMatches: LiveMatch[] = [];
      const apiFootballMatches: LiveMatch[] = [];

      // Process Sportmonks data
      if (!sportmonksResult.error && sportmonksResult.data?.matches) {
        const matches = sportmonksResult.data.matches;
        console.log('[Live Scores] Sportmonks matches:', matches.length);
        sportmonksMatches.push(...matches.map((m: any) => ({
          ...m,
          leagueShort: m.leagueShort || m.league?.slice(0, 8) || 'Unknown'
        })));
      } else if (sportmonksResult.error) {
        console.warn('[Live Scores] Sportmonks error:', sportmonksResult.error);
      }

      // Process API-Football data (Liga Indonesia)
      if (!apiFootballResult.error && apiFootballResult.data?.liveMatches) {
        const liveMatches = apiFootballResult.data.liveMatches;
        console.log('[Live Scores] API-Football live matches:', liveMatches.length);
        apiFootballMatches.push(...liveMatches);
      } else if (apiFootballResult.error) {
        console.warn('[Live Scores] API-Football error:', apiFootballResult.error);
      }

      // Combine all matches, prioritizing live matches first
      const allMatches = [...sportmonksMatches, ...apiFootballMatches];
      
      // Sort: live matches first, then by league
      allMatches.sort((a, b) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (a.status !== 'live' && b.status === 'live') return 1;
        return 0;
      });

      setMatches(allMatches);
      console.log('[Live Scores] Total matches:', allMatches.length);
      
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
