import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UpcomingFixture {
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

interface FixturesResponse {
  fixtures: UpcomingFixture[];
  error?: string;
}

interface ApiFootballUpcoming {
  id: number;
  homeTeam: { name: string; logo: string | null };
  awayTeam: { name: string; logo: string | null };
  league: { name: string; logo: string | null };
  startingAt: string;
  time: string;
  date: string;
}

function getDateLabel(dateStr: string): { id: string; en: string } {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (targetDate.getTime() === today.getTime()) {
    return { id: 'Hari Ini', en: 'Today' };
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    return { id: 'Besok', en: 'Tomorrow' };
  } else {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    const dayIdx = date.getDay();
    const dayOfMonth = date.getDate();
    const monthIdx = date.getMonth();
    
    return { 
      id: `${days[dayIdx]}, ${dayOfMonth} ${months[monthIdx]}`,
      en: `${daysEn[dayIdx]}, ${dayOfMonth} ${months[monthIdx]}`
    };
  }
}

function transformApiFootballToFixture(match: ApiFootballUpcoming): UpcomingFixture {
  const leagueName = match.league.name;
  const isLiga1 = leagueName.includes('Liga 1');
  
  return {
    id: match.id,
    homeTeam: {
      id: match.id,
      name: match.homeTeam.name,
      shortCode: null,
      logo: match.homeTeam.logo,
    },
    awayTeam: {
      id: match.id + 1,
      name: match.awayTeam.name,
      shortCode: null,
      logo: match.awayTeam.logo,
    },
    league: {
      id: isLiga1 ? 274 : 275,
      internalId: isLiga1 ? 'liga-1' : 'liga-2',
      name: leagueName,
      shortCode: isLiga1 ? 'Liga 1' : 'Liga 2',
      logo: match.league.logo,
      color: 'red',
    },
    startingAt: match.startingAt,
    time: match.time,
    dateLabel: getDateLabel(match.startingAt),
    venue: null,
  };
}

export const useUpcomingFixtures = (leagueId?: string) => {
  return useQuery({
    queryKey: ['upcoming-fixtures', leagueId],
    queryFn: async (): Promise<UpcomingFixture[]> => {
      // Fetch from both APIs in parallel
      const [sportmonksResult, apiFootballResult] = await Promise.all([
        supabase.functions.invoke<FixturesResponse>('sportmonks-fixtures', {
          body: leagueId ? { leagueId } : {},
        }),
        supabase.functions.invoke('apifootball-livescore')
      ]);

      const allFixtures: UpcomingFixture[] = [];

      // Process Sportmonks fixtures
      if (!sportmonksResult.error && sportmonksResult.data?.fixtures) {
        console.log('[Fixtures] Sportmonks fixtures:', sportmonksResult.data.fixtures.length);
        allFixtures.push(...sportmonksResult.data.fixtures);
      } else if (sportmonksResult.error) {
        console.warn('[Fixtures] Sportmonks error:', sportmonksResult.error);
      }

      // Process API-Football upcoming matches (Liga Indonesia)
      if (!apiFootballResult.error && apiFootballResult.data?.upcomingMatches) {
        const upcomingMatches = apiFootballResult.data.upcomingMatches as ApiFootballUpcoming[];
        console.log('[Fixtures] API-Football upcoming matches:', upcomingMatches.length);
        
        // Transform and add to fixtures
        const transformedMatches = upcomingMatches.map(transformApiFootballToFixture);
        allFixtures.push(...transformedMatches);
      } else if (apiFootballResult.error) {
        console.warn('[Fixtures] API-Football error:', apiFootballResult.error);
      }

      // Sort all fixtures: Liga 1 Indonesia first, then by start time
      allFixtures.sort((a, b) => {
        // Priority: Liga 1/2 Indonesia first
        const aIsLigaIndonesia = a.league.internalId === 'liga-1' || a.league.internalId === 'liga-2';
        const bIsLigaIndonesia = b.league.internalId === 'liga-1' || b.league.internalId === 'liga-2';
        
        if (aIsLigaIndonesia && !bIsLigaIndonesia) return -1;
        if (!aIsLigaIndonesia && bIsLigaIndonesia) return 1;
        
        // Then sort by start time
        return new Date(a.startingAt).getTime() - new Date(b.startingAt).getTime();
      });

      console.log('[Fixtures] Total fixtures:', allFixtures.length);
      return allFixtures;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
