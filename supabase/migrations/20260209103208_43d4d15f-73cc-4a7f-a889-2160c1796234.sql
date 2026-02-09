-- =====================================================
-- READ TO EARN SYSTEM TABLES
-- =====================================================

-- 1. User Points Table - Stores total points per user
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. User Checkins Table - Daily check-in records
CREATE TABLE public.user_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

-- 3. Point History Table - Log of all point transactions
CREATE TABLE public.point_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. User Activity Table - Track active time per session
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  active_minutes INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- 5. Rewards Table - Catalog of available rewards
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  points_required INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Reward Redemptions Table - History of reward claims
CREATE TABLE public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  user_email TEXT,
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. RTE Settings Table - Configuration for the system
CREATE TABLE public.rte_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.rte_settings (key, value, description) VALUES
  ('checkin_points', '1', 'Points awarded for daily check-in'),
  ('read_time_minutes', '60', 'Minutes of activity required for read time points'),
  ('read_time_points', '1', 'Points awarded per read time interval');

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rte_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: user_points
-- =====================================================
CREATE POLICY "Users can view own points"
  ON public.user_points FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all points"
  ON public.user_points FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own points"
  ON public.user_points FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own points"
  ON public.user_points FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all points"
  ON public.user_points FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- RLS POLICIES: user_checkins
-- =====================================================
CREATE POLICY "Users can view own checkins"
  ON public.user_checkins FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all checkins"
  ON public.user_checkins FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own checkins"
  ON public.user_checkins FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- RLS POLICIES: point_history
-- =====================================================
CREATE POLICY "Users can view own history"
  ON public.point_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all history"
  ON public.point_history FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own history"
  ON public.point_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- RLS POLICIES: user_activity
-- =====================================================
CREATE POLICY "Users can view own activity"
  ON public.user_activity FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity"
  ON public.user_activity FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own activity"
  ON public.user_activity FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- RLS POLICIES: rewards
-- =====================================================
CREATE POLICY "Anyone can view active rewards"
  ON public.rewards FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all rewards"
  ON public.rewards FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- RLS POLICIES: reward_redemptions
-- =====================================================
CREATE POLICY "Users can view own redemptions"
  ON public.reward_redemptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all redemptions"
  ON public.reward_redemptions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own redemptions"
  ON public.reward_redemptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update redemptions"
  ON public.reward_redemptions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- RLS POLICIES: rte_settings
-- =====================================================
CREATE POLICY "Anyone can view settings"
  ON public.rte_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.rte_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================
CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reward_redemptions_updated_at
  BEFORE UPDATE ON public.reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rte_settings_updated_at
  BEFORE UPDATE ON public.rte_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- DATABASE FUNCTION: Claim daily check-in
-- =====================================================
CREATE OR REPLACE FUNCTION public.claim_daily_checkin(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_checkin_points INTEGER;
  v_already_checked BOOLEAN;
  v_result JSON;
BEGIN
  -- Get checkin points from settings
  SELECT COALESCE(value::INTEGER, 1) INTO v_checkin_points
  FROM public.rte_settings WHERE key = 'checkin_points';
  
  -- Check if already checked in today
  SELECT EXISTS(
    SELECT 1 FROM public.user_checkins
    WHERE user_id = p_user_id AND checkin_date = CURRENT_DATE
  ) INTO v_already_checked;
  
  IF v_already_checked THEN
    RETURN json_build_object('success', false, 'message', 'Already checked in today');
  END IF;
  
  -- Insert checkin record
  INSERT INTO public.user_checkins (user_id, checkin_date, points_earned)
  VALUES (p_user_id, CURRENT_DATE, v_checkin_points);
  
  -- Insert point history
  INSERT INTO public.point_history (user_id, points, source, description)
  VALUES (p_user_id, v_checkin_points, 'checkin', 'Daily check-in bonus');
  
  -- Update or insert user points
  INSERT INTO public.user_points (user_id, total_points)
  VALUES (p_user_id, v_checkin_points)
  ON CONFLICT (user_id)
  DO UPDATE SET total_points = user_points.total_points + v_checkin_points,
                updated_at = now();
  
  RETURN json_build_object('success', true, 'points', v_checkin_points);
END;
$$;

-- =====================================================
-- DATABASE FUNCTION: Award read time points
-- =====================================================
CREATE OR REPLACE FUNCTION public.award_read_time_points(p_user_id UUID, p_session_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_read_time_points INTEGER;
  v_read_time_minutes INTEGER;
  v_current_minutes INTEGER;
  v_points_awarded INTEGER;
  v_new_points INTEGER;
BEGIN
  -- Get settings
  SELECT COALESCE(value::INTEGER, 1) INTO v_read_time_points
  FROM public.rte_settings WHERE key = 'read_time_points';
  
  SELECT COALESCE(value::INTEGER, 60) INTO v_read_time_minutes
  FROM public.rte_settings WHERE key = 'read_time_minutes';
  
  -- Get current activity
  SELECT active_minutes, points_awarded INTO v_current_minutes, v_points_awarded
  FROM public.user_activity
  WHERE user_id = p_user_id AND session_id = p_session_id;
  
  IF v_current_minutes IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'No activity found');
  END IF;
  
  -- Calculate if new points should be awarded
  v_new_points := FLOOR(v_current_minutes / v_read_time_minutes) - v_points_awarded;
  
  IF v_new_points <= 0 THEN
    RETURN json_build_object('success', false, 'message', 'No points to award yet');
  END IF;
  
  -- Award the points
  INSERT INTO public.point_history (user_id, points, source, description)
  VALUES (p_user_id, v_new_points * v_read_time_points, 'read_time', 
          'Read time bonus: ' || v_new_points * v_read_time_minutes || ' minutes');
  
  -- Update user points
  INSERT INTO public.user_points (user_id, total_points)
  VALUES (p_user_id, v_new_points * v_read_time_points)
  ON CONFLICT (user_id)
  DO UPDATE SET total_points = user_points.total_points + v_new_points * v_read_time_points,
                updated_at = now();
  
  -- Update activity record
  UPDATE public.user_activity
  SET points_awarded = points_awarded + v_new_points
  WHERE user_id = p_user_id AND session_id = p_session_id;
  
  RETURN json_build_object('success', true, 'points', v_new_points * v_read_time_points);
END;
$$;

-- =====================================================
-- DATABASE FUNCTION: Redeem reward
-- =====================================================
CREATE OR REPLACE FUNCTION public.redeem_reward(
  p_user_id UUID, 
  p_reward_id UUID,
  p_user_email TEXT DEFAULT NULL,
  p_user_name TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_points INTEGER;
  v_reward_points INTEGER;
  v_reward_stock INTEGER;
  v_reward_name TEXT;
BEGIN
  -- Get user's current points
  SELECT total_points INTO v_user_points
  FROM public.user_points WHERE user_id = p_user_id;
  
  IF v_user_points IS NULL THEN
    v_user_points := 0;
  END IF;
  
  -- Get reward details
  SELECT points_required, stock, name INTO v_reward_points, v_reward_stock, v_reward_name
  FROM public.rewards WHERE id = p_reward_id AND is_active = true;
  
  IF v_reward_points IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Reward not found or inactive');
  END IF;
  
  -- Check if user has enough points
  IF v_user_points < v_reward_points THEN
    RETURN json_build_object('success', false, 'message', 'Insufficient points');
  END IF;
  
  -- Check stock
  IF v_reward_stock <= 0 THEN
    RETURN json_build_object('success', false, 'message', 'Reward out of stock');
  END IF;
  
  -- Create redemption record
  INSERT INTO public.reward_redemptions (user_id, reward_id, points_spent, user_email, user_name)
  VALUES (p_user_id, p_reward_id, v_reward_points, p_user_email, p_user_name);
  
  -- Deduct points
  UPDATE public.user_points
  SET total_points = total_points - v_reward_points, updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log point history
  INSERT INTO public.point_history (user_id, points, source, description)
  VALUES (p_user_id, -v_reward_points, 'redemption', 'Redeemed: ' || v_reward_name);
  
  -- Reduce stock
  UPDATE public.rewards
  SET stock = stock - 1, updated_at = now()
  WHERE id = p_reward_id;
  
  RETURN json_build_object('success', true, 'message', 'Reward redeemed successfully');
END;
$$;