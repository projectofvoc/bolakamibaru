-- Create table for dynamic AI prompts
CREATE TABLE public.ai_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_text TEXT NOT NULL,
  prompt_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;

-- Allow public read access (prompts are public content)
CREATE POLICY "Anyone can read active prompts" 
ON public.ai_prompts 
FOR SELECT 
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_prompts_updated_at
BEFORE UPDATE ON public.ai_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial prompts
INSERT INTO public.ai_prompts (prompt_text, prompt_order) VALUES
('Siapa pencetak gol terbanyak Liga 1?', 1),
('Jadwal pertandingan Persebaya', 2),
('Statistik pemain terbaik', 3);

-- Enable pg_cron and pg_net extensions for scheduled updates
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;