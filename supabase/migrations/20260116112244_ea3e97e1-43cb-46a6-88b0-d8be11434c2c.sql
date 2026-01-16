-- Create social_media_links table
CREATE TABLE public.social_media_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;

-- Public read access (untuk Footer)
CREATE POLICY "Anyone can read active social links"
  ON public.social_media_links FOR SELECT
  USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage social links"
  ON public.social_media_links FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_social_media_links_updated_at
  BEFORE UPDATE ON public.social_media_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
INSERT INTO public.social_media_links (platform, display_name, url, icon_name, sort_order) VALUES
  ('instagram', 'Instagram', 'https://www.instagram.com/bolakami_ofc/', 'instagram', 1),
  ('threads', 'Threads', 'https://www.threads.com/@bolakami_ofc', 'threads', 2),
  ('twitter', 'Twitter/X', 'https://x.com/Bolakamiofc', 'twitter', 3),
  ('facebook', 'Facebook', 'https://www.facebook.com/bolakamiofc/', 'facebook', 4),
  ('tiktok', 'TikTok', 'https://www.tiktok.com/@bolakami', 'tiktok', 5),
  ('youtube', 'YouTube', 'https://www.youtube.com/@bolakami', 'youtube', 6);