-- Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data for categories
INSERT INTO public.categories (name, icon, sort_order) VALUES
  ('Trending', '🔥', 1),
  ('Update Harian', '📰', 2),
  ('Analisa', '📊', 3),
  ('Transfer', '💰', 4),
  ('La Liga', '⚽', 5),
  ('Serie A', '⚽', 6),
  ('Premier League', '⚽', 7),
  ('Liga 1', '⚽', 8),
  ('Ligue 1', '⚽', 9),
  ('Bundesliga', '⚽', 10);

-- RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create clubs table
CREATE TABLE public.clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  league_id UUID REFERENCES public.leagues(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for clubs
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active clubs" ON public.clubs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage clubs" ON public.clubs
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create badges table
CREATE TABLE public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data for badges
INSERT INTO public.badges (name, icon, sort_order) VALUES
  ('New', '🆕', 1),
  ('Viral', '🔥', 2),
  ('Popular', '⭐', 3),
  ('Trending', '📈', 4);

-- RLS for badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active badges" ON public.badges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage badges" ON public.badges
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));