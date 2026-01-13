import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeagueLogo {
  id: number;
  internalId: string | null;
  name: string;
  shortCode: string;
  logo: string;
  countryId: number;
}

export const useLeaguesLogo = () => {
  return useQuery({
    queryKey: ['leagues-logo'],
    queryFn: async () => {
      console.log('Fetching league logos from Sportmonks...');
      
      const { data, error } = await supabase.functions.invoke('sportmonks-leagues');
      
      if (error) {
        console.error('Error fetching league logos:', error);
        throw error;
      }
      
      console.log('League logos response:', data);
      return data.leagues as LeagueLogo[];
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours (logos rarely change)
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 2,
  });
};
