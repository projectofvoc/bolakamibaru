import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface Reward {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  points_required: number;
  stock: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface Redemption {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  rewards?: Reward;
}

interface RedeemResult {
  success: boolean;
  message: string;
}

export const useRewards = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      setUserEmail(user?.email || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch all active rewards
  const { data: rewards = [], isLoading: isLoadingRewards } = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Reward[];
    },
  });

  // Fetch user's redemption history
  const { data: redemptions = [], isLoading: isLoadingRedemptions } = useQuery({
    queryKey: ['user-redemptions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          rewards (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Redemption[];
    },
    enabled: !!userId,
  });

  // Redeem a reward
  const redeemMutation = useMutation({
    mutationFn: async (rewardId: string): Promise<RedeemResult> => {
      if (!userId) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('redeem_reward', {
        p_user_id: userId,
        p_reward_id: rewardId,
        p_user_email: userEmail,
        p_user_name: userEmail?.split('@')[0] || 'User'
      });
      
      if (error) throw error;
      return data as unknown as RedeemResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-points', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-redemptions', userId] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });

  return {
    rewards,
    isLoadingRewards,
    redemptions,
    isLoadingRedemptions,
    redeemReward: redeemMutation.mutateAsync,
    isRedeeming: redeemMutation.isPending,
    userId,
  };
};

// Admin hooks for CMS
export const useRewardsAdmin = () => {
  const queryClient = useQueryClient();

  // Fetch all rewards (including inactive)
  const { data: allRewards = [], isLoading } = useQuery({
    queryKey: ['admin-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Reward[];
    },
  });

  // Fetch all redemptions
  const { data: allRedemptions = [] } = useQuery({
    queryKey: ['admin-redemptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          rewards (name, image_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch all user points
  const { data: allUserPoints = [] } = useQuery({
    queryKey: ['admin-user-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .order('total_points', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Create reward
  const createRewardMutation = useMutation({
    mutationFn: async (reward: Partial<Reward>) => {
      const { data, error } = await supabase
        .from('rewards')
        .insert(reward as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });

  // Update reward
  const updateRewardMutation = useMutation({
    mutationFn: async ({ id, ...reward }: Partial<Reward> & { id: string }) => {
      const { data, error } = await supabase
        .from('rewards')
        .update(reward)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });

  // Delete reward
  const deleteRewardMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });

  // Update redemption status
  const updateRedemptionStatusMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .update({ status, admin_notes })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-redemptions'] });
    },
  });

  // Analytics data
  const { data: analytics } = useQuery({
    queryKey: ['rte-analytics'],
    queryFn: async () => {
      // Get total points distributed
      const { data: pointsData } = await supabase
        .from('point_history')
        .select('points')
        .gt('points', 0);
      
      const totalPointsDistributed = pointsData?.reduce((sum, p) => sum + p.points, 0) || 0;
      
      // Get total redemptions
      const { count: totalRedemptions } = await supabase
        .from('reward_redemptions')
        .select('*', { count: 'exact', head: true });
      
      // Get active users (users with points)
      const { count: activeUsers } = await supabase
        .from('user_points')
        .select('*', { count: 'exact', head: true });
      
      // Get today's check-ins
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCheckins } = await supabase
        .from('user_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('checkin_date', today);
      
      return {
        totalPointsDistributed,
        totalRedemptions: totalRedemptions || 0,
        activeUsers: activeUsers || 0,
        todayCheckins: todayCheckins || 0,
      };
    },
  });

  // Get RTE settings
  const { data: rteSettings = [] } = useQuery({
    queryKey: ['admin-rte-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rte_settings')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  // Update RTE setting
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data, error } = await supabase
        .from('rte_settings')
        .update({ value })
        .eq('key', key)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rte-settings'] });
      queryClient.invalidateQueries({ queryKey: ['rte-settings'] });
    },
  });

  return {
    allRewards,
    isLoading,
    allRedemptions,
    allUserPoints,
    analytics,
    rteSettings,
    createReward: createRewardMutation.mutateAsync,
    updateReward: updateRewardMutation.mutateAsync,
    deleteReward: deleteRewardMutation.mutateAsync,
    updateRedemptionStatus: updateRedemptionStatusMutation.mutateAsync,
    updateSetting: updateSettingMutation.mutateAsync,
    isCreating: createRewardMutation.isPending,
    isUpdating: updateRewardMutation.isPending,
    isDeleting: deleteRewardMutation.isPending,
  };
};
