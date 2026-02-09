import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  created_at: string;
  updated_at: string;
}

interface CheckinResult {
  success: boolean;
  message?: string;
  points?: number;
}

export const useUserPoints = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user's total points
  const { data: points, isLoading: isLoadingPoints, refetch: refetchPoints } = useQuery({
    queryKey: ['user-points', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserPoints | null;
    },
    enabled: !!userId,
  });

  // Check if user already checked in today
  const { data: hasCheckedInToday, isLoading: isLoadingCheckin, refetch: refetchCheckin } = useQuery({
    queryKey: ['user-checkin-today', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('user_checkins')
        .select('id')
        .eq('user_id', userId)
        .eq('checkin_date', today)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!userId,
  });

  // Get check-in streak (consecutive days)
  const { data: streak = 0 } = useQuery({
    queryKey: ['user-checkin-streak', userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { data, error } = await supabase
        .from('user_checkins')
        .select('checkin_date')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false })
        .limit(30);
      
      if (error || !data || data.length === 0) return 0;
      
      let streakCount = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < data.length; i++) {
        const checkinDate = new Date(data[i].checkin_date);
        checkinDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (checkinDate.getTime() === expectedDate.getTime()) {
          streakCount++;
        } else {
          break;
        }
      }
      
      return streakCount;
    },
    enabled: !!userId,
  });

  // Claim daily check-in mutation
  const claimCheckinMutation = useMutation({
    mutationFn: async (): Promise<CheckinResult> => {
      if (!userId) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('claim_daily_checkin', {
        p_user_id: userId
      });
      
      if (error) throw error;
      return data as unknown as CheckinResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-points', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-checkin-today', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-checkin-streak', userId] });
    },
  });

  // Get point history
  const { data: pointHistory = [] } = useQuery({
    queryKey: ['point-history', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('point_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return {
    userId,
    totalPoints: points?.total_points || 0,
    isLoadingPoints,
    hasCheckedInToday: hasCheckedInToday ?? false,
    isLoadingCheckin,
    streak,
    pointHistory,
    claimCheckin: claimCheckinMutation.mutateAsync,
    isClaimingCheckin: claimCheckinMutation.isPending,
    refetchPoints,
    refetchCheckin,
  };
};
