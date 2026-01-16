import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'live' | 'ft' | 'scheduled' | 'post' | 'postponed';
  minute: number | null;
  league: string;
  leagueShort: string;
  time: string;
}

interface ApiFootballUpcoming {
  id: number;
  homeTeam: { name: string; logo: string | null };
  awayTeam: { name: string; logo: string | null };
  league: { name: string; logo: string | null };
  time: string;
  date: string;
  startingAt: string;
}

interface ApiFootballRecent {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
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
      const apiFootballLiveMatches: LiveMatch[] = [];
      const apiFootballUpcomingMatches: LiveMatch[] = [];
      const apiFootballRecentMatches: LiveMatch[] = [];

      // Process Sportmonks data
      if (!sportmonksResult.error && sportmonksResult.data?.matches) {
        const matches = sportmonksResult.data.matches;
        console.log('[Live Scores] Sportmonks matches:', matches.length);
        sportmonksMatches.push(...matches.map((m: any) => ({
          id: `sm-${m.id}`,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: m.status,
          minute: m.minute,
          league: m.league,
          leagueShort: m.leagueShort || m.league?.slice(0, 8) || 'Unknown',
          time: m.time || ''
        })));
      } else if (sportmonksResult.error) {
        console.warn('[Live Scores] Sportmonks error:', sportmonksResult.error);
      }

      // Process API-Football data (Liga Indonesia)
      if (!apiFootballResult.error && apiFootballResult.data) {
        const { liveMatches = [], upcomingMatches = [], recentMatches = [] } = apiFootballResult.data;
        
        console.log('[Live Scores] API-Football live:', liveMatches.length);
        console.log('[Live Scores] API-Football upcoming:', upcomingMatches.length);
        console.log('[Live Scores] API-Football recent:', recentMatches.length);
        
        // Transform live matches
        apiFootballLiveMatches.push(...liveMatches.map((m: any) => ({
          id: `api-${m.id}`,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: m.status as 'live' | 'ft' | 'scheduled' | 'post' | 'postponed',
          minute: m.minute,
          league: m.league,
          leagueShort: m.leagueShort || 'Liga 1',
          time: m.time || ''
        })));

        // Transform upcoming matches (scheduled) - note: homeTeam/awayTeam are objects here
        apiFootballUpcomingMatches.push(...upcomingMatches.map((m: ApiFootballUpcoming) => {
          const leagueName = typeof m.league === 'object' ? m.league.name : m.league;
          const leagueShort = leagueName.includes('Liga 1') ? 'Liga 1' 
                            : leagueName.includes('Liga 2') ? 'Liga 2' 
                            : leagueName.slice(0, 8);
          return {
            id: `api-up-${m.id}`,
            homeTeam: typeof m.homeTeam === 'object' ? m.homeTeam.name : m.homeTeam,
            awayTeam: typeof m.awayTeam === 'object' ? m.awayTeam.name : m.awayTeam,
            homeScore: null,
            awayScore: null,
            status: 'scheduled' as const,
            minute: null,
            league: leagueName,
            leagueShort: leagueShort,
            time: m.time || ''
          };
        }));

        // Transform recent matches (finished)
        apiFootballRecentMatches.push(...recentMatches.map((m: any) => ({
          id: `api-rc-${m.id}`,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: 'ft' as const,
          minute: null,
          league: m.league,
          leagueShort: m.leagueShort || 'Liga 1',
          time: m.time || ''
        })));
      } else if (apiFootballResult.error) {
        console.warn('[Live Scores] API-Football error:', apiFootballResult.error);
      }

      // Build combined list with priority:
      // 1. All live matches first (Liga Indonesia priority among live)
      // 2. Liga Indonesia upcoming/recent (so Liga 1 always appears)
      // 3. Other leagues
      
      const allLive = [...apiFootballLiveMatches, ...sportmonksMatches.filter(m => m.status === 'live')];
      const allFinished = [...apiFootballRecentMatches, ...sportmonksMatches.filter(m => m.status === 'ft')];
      const allScheduled = [...apiFootballUpcomingMatches, ...sportmonksMatches.filter(m => m.status === 'scheduled')];
      const allOther = sportmonksMatches.filter(m => m.status !== 'live' && m.status !== 'ft' && m.status !== 'scheduled');

      // Helper: Liga priority (Liga 1 = 0, Liga 2 = 1, others = 2)
      const getLeaguePriority = (leagueShort: string): number => {
        if (leagueShort === 'Liga 1') return 0;
        if (leagueShort === 'Liga 2') return 1;
        return 2;
      };

      // Sort live matches: Liga 1 first, then Liga 2, then others
      allLive.sort((a, b) => getLeaguePriority(a.leagueShort) - getLeaguePriority(b.leagueShort));

      // Separate by league priority
      const liga1Scheduled = allScheduled.filter(m => m.leagueShort === 'Liga 1');
      const liga2Scheduled = allScheduled.filter(m => m.leagueShort === 'Liga 2');
      const liga1Recent = allFinished.filter(m => m.leagueShort === 'Liga 1');
      const liga2Recent = allFinished.filter(m => m.leagueShort === 'Liga 2');
      const otherScheduled = allScheduled.filter(m => m.leagueShort !== 'Liga 1' && m.leagueShort !== 'Liga 2');
      const otherFinished = allFinished.filter(m => m.leagueShort !== 'Liga 1' && m.leagueShort !== 'Liga 2');

      // Combine with priority: Liga 1 > Liga 2 > Others
      const allMatches = [
        ...allLive,
        ...liga1Scheduled.slice(0, 3), // Liga 1 upcoming (max 3)
        ...liga1Recent.slice(0, 2),    // Liga 1 recent (max 2)
        ...liga2Scheduled.slice(0, 3), // Liga 2 upcoming (max 3)
        ...liga2Recent.slice(0, 2),    // Liga 2 recent (max 2)
        ...otherScheduled,
        ...otherFinished,
        ...allOther
      ];

      // Deduplicate by id
      const uniqueMatches = allMatches.filter((match, index, self) => 
        index === self.findIndex(m => m.id === match.id)
      );

      setMatches(uniqueMatches);
      console.log('[Live Scores] Total matches:', uniqueMatches.length);
      
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
