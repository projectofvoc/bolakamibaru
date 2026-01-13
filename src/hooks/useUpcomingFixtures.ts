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

export const useUpcomingFixtures = (leagueId?: string) => {
  return useQuery({
    queryKey: ['upcoming-fixtures', leagueId],
    queryFn: async (): Promise<UpcomingFixture[]> => {
      const { data, error } = await supabase.functions.invoke<FixturesResponse>('sportmonks-fixtures', {
        body: leagueId ? { leagueId } : {},
      });

      if (error) {
        console.error('Error fetching fixtures:', error);
        throw error;
      }

      if (data?.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }

      return data?.fixtures || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
