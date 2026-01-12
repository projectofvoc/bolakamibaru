-- First create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for best moments
CREATE TABLE public.best_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.best_moments ENABLE ROW LEVEL SECURITY;

-- Public can view active moments (no auth required)
CREATE POLICY "Public can view active moments" 
ON public.best_moments 
FOR SELECT 
USING (is_active = true);

-- Authenticated users can manage all moments
CREATE POLICY "Authenticated users can insert moments" 
ON public.best_moments 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update moments" 
ON public.best_moments 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete moments" 
ON public.best_moments 
FOR DELETE 
TO authenticated
USING (true);

-- Create storage bucket for videos and thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('moments-media', 'moments-media', true, 52428800);

-- Storage policies
CREATE POLICY "Authenticated can upload to moments-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'moments-media');

CREATE POLICY "Authenticated can update moments-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'moments-media');

CREATE POLICY "Authenticated can delete from moments-media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'moments-media');

CREATE POLICY "Public can view moments-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'moments-media');

-- Trigger for updated_at
CREATE TRIGGER update_best_moments_updated_at
BEFORE UPDATE ON public.best_moments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data from existing dummy data
INSERT INTO public.best_moments (title_id, title_en, thumbnail_url, video_url, sort_order) VALUES
('Gol Spektakuler Ronaldo', 'Spectacular Ronaldo Goal', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&h=400&fit=crop', NULL, 1),
('Penyelamatan Gemilang Courtois', 'Brilliant Courtois Save', 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=300&h=400&fit=crop', NULL, 2),
('Free Kick Messi yang Indah', 'Beautiful Messi Free Kick', 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&h=400&fit=crop', NULL, 3),
('Dribbling Mbappe Menembus Pertahanan', 'Mbappe Dribbling Through Defense', 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=300&h=400&fit=crop', NULL, 4),
('Sundulan Haaland', 'Haaland Header', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=400&fit=crop', NULL, 5),
('Tendangan Salju Salah', 'Salah Snow Goal', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&h=400&fit=crop', NULL, 6);