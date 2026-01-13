-- Create api_configurations table
CREATE TABLE public.api_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  api_key text,
  description text,
  is_active boolean DEFAULT true,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

-- Create history table for audit trail
CREATE TABLE public.api_configurations_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid REFERENCES public.api_configurations(id) ON DELETE CASCADE,
  old_api_key text,
  new_api_key text,
  changed_at timestamptz DEFAULT now(),
  changed_by uuid,
  reason text
);

-- Enable RLS
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_configurations_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_configurations - Admin only
CREATE POLICY "Admins can view api configurations"
ON public.api_configurations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert api configurations"
ON public.api_configurations
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update api configurations"
ON public.api_configurations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete api configurations"
ON public.api_configurations
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for history - Admin only
CREATE POLICY "Admins can view api history"
ON public.api_configurations_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert api history"
ON public.api_configurations_history
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to update updated_at
CREATE TRIGGER update_api_configurations_updated_at
BEFORE UPDATE ON public.api_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default Sportmonks configuration
INSERT INTO public.api_configurations (name, display_name, description, category, is_active)
VALUES ('sportmonks', 'Sportmonks Live Score API', 'API untuk menampilkan skor pertandingan langsung (Live Score)', 'livescore', true);