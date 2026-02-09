import { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActivityState {
  activeMinutes: number;
  pointsAwarded: number;
  sessionId: string;
}

export const useActivityTracker = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isVisible, setIsVisible] = useState(true);
  const [localActiveMinutes, setLocalActiveMinutes] = useState(0);
  const lastUpdateRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get user
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

  // Get RTE settings
  const { data: settings } = useQuery({
    queryKey: ['rte-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rte_settings')
        .select('key, value');
      
      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      data?.forEach(s => { settingsMap[s.key] = s.value; });
      return {
        readTimeMinutes: parseInt(settingsMap['read_time_minutes'] || '60'),
        readTimePoints: parseInt(settingsMap['read_time_points'] || '1'),
      };
    },
  });

  // Get current activity state
  const { data: activityState, refetch: refetchActivity } = useQuery({
    queryKey: ['user-activity', userId, sessionId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        activeMinutes: data.active_minutes,
        pointsAwarded: data.points_awarded,
        sessionId: data.session_id,
      } as ActivityState;
    },
    enabled: !!userId,
  });

  // Update activity mutation
  const updateActivityMutation = useMutation({
    mutationFn: async (minutes: number) => {
      if (!userId) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_activity')
        .upsert({
          user_id: userId,
          session_id: sessionId,
          active_minutes: minutes,
          last_activity_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,session_id'
        });
      
      if (error) throw error;
    },
  });

  // Award read time points mutation
  const awardPointsMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('award_read_time_points', {
        p_user_id: userId,
        p_session_id: sessionId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-points', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-activity', userId, sessionId] });
    },
  });

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      if (!document.hidden) {
        lastUpdateRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Track active time
  useEffect(() => {
    if (!userId || !isVisible) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedMinutes = Math.floor((now - lastUpdateRef.current) / 60000);
      
      if (elapsedMinutes >= 1) {
        setLocalActiveMinutes(prev => {
          const newMinutes = prev + 1;
          
          // Update database
          updateActivityMutation.mutate(newMinutes);
          
          // Check if we should award points
          if (settings && newMinutes > 0 && newMinutes % settings.readTimeMinutes === 0) {
            awardPointsMutation.mutate();
          }
          
          return newMinutes;
        });
        
        lastUpdateRef.current = now;
      }
    }, 60000); // Check every minute

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, isVisible, settings]);

  // Calculate progress percentage
  const progressPercentage = settings 
    ? ((localActiveMinutes % settings.readTimeMinutes) / settings.readTimeMinutes) * 100
    : 0;

  const minutesUntilNextPoint = settings 
    ? settings.readTimeMinutes - (localActiveMinutes % settings.readTimeMinutes)
    : 60;

  return {
    userId,
    sessionId,
    activeMinutes: localActiveMinutes,
    pointsAwarded: activityState?.pointsAwarded || 0,
    progressPercentage,
    minutesUntilNextPoint,
    readTimeMinutes: settings?.readTimeMinutes || 60,
    readTimePoints: settings?.readTimePoints || 1,
    isTracking: isVisible && !!userId,
  };
};
