import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StandingTeam {
  position: number;
  teamId: number;
  teamName: string;
  teamLogo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string;
}

export interface StandingsResponse {
  standings: StandingTeam[];
  league: string;
  leagueName: { id: string; en: string };
  seasonId: number;
  totalTeams: number;
  error?: string;
}

export const useStandings = (leagueSlug: string) => {
  return useQuery<StandingsResponse>({
    queryKey: ['standings', leagueSlug],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('sportmonks-standings', {
        body: { league: leagueSlug },
      });

      if (error) {
        console.error('Error fetching standings:', error);
        throw new Error(error.message || 'Failed to fetch standings');
      }

      return data as StandingsResponse;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });
};

// Available leagues for the dropdown
export const availableLeagues = [
  { slug: 'liga-1', nameId: 'Liga 1 Indonesia', nameEn: 'Liga 1 Indonesia' },
  { slug: 'liga-2', nameId: 'Liga 2 Indonesia', nameEn: 'Liga 2 Indonesia' },
  { slug: 'premier-league', nameId: 'Premier League', nameEn: 'Premier League' },
  { slug: 'la-liga', nameId: 'La Liga', nameEn: 'La Liga' },
  { slug: 'serie-a', nameId: 'Serie A', nameEn: 'Serie A' },
  { slug: 'bundesliga', nameId: 'Bundesliga', nameEn: 'Bundesliga' },
  { slug: 'champions-league', nameId: 'Liga Champions', nameEn: 'Champions League' },
];
