-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'author', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_id TEXT,
  excerpt_en TEXT,
  content_id TEXT NOT NULL,
  content_en TEXT NOT NULL,
  featured_image TEXT,
  category TEXT NOT NULL DEFAULT 'daily', -- 'trending', 'daily', 'analisa'
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  club TEXT,
  league TEXT,
  publisher_name TEXT,
  publisher_icon TEXT,
  publisher_verified BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  badges TEXT[] DEFAULT '{}', -- ['new', 'viral', 'popular', 'trending']
  badge_expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft', -- 'draft', 'pending', 'published'
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create leagues table
CREATE TABLE public.leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  country TEXT,
  icon_url TEXT,
  is_international BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on leagues
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Create nav_items table
CREATE TABLE public.nav_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id TEXT NOT NULL,
  label_en TEXT NOT NULL,
  path TEXT NOT NULL,
  icon TEXT,
  parent_id UUID REFERENCES public.nav_items(id) ON DELETE SET NULL,
  is_external BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on nav_items
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for article media
INSERT INTO storage.buckets (id, name, public)
VALUES ('articles-media', 'articles-media', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for articles
CREATE POLICY "Public can view published articles"
  ON public.articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can view own articles"
  ON public.articles FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Admins can view all articles"
  ON public.articles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authors can create articles"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'author'))
    AND author_id = auth.uid()
  );

CREATE POLICY "Authors can update own articles"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete articles"
  ON public.articles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR author_id = auth.uid());

-- RLS Policies for leagues
CREATE POLICY "Public can view active leagues"
  ON public.leagues FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage leagues"
  ON public.leagues FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for nav_items
CREATE POLICY "Public can view active nav items"
  ON public.nav_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage nav items"
  ON public.nav_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage policies for articles-media
CREATE POLICY "Anyone can view article media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'articles-media');

CREATE POLICY "Authenticated users can upload article media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'articles-media'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'author'))
  );

CREATE POLICY "Authenticated users can update own article media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'articles-media'
    AND (public.has_role(auth.uid(), 'admin') OR owner_id = auth.uid()::text)
  );

CREATE POLICY "Admins can delete article media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'articles-media'
    AND (public.has_role(auth.uid(), 'admin') OR owner_id = auth.uid()::text)
  );

-- Trigger for updated_at on articles
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on leagues
CREATE TRIGGER update_leagues_updated_at
  BEFORE UPDATE ON public.leagues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on nav_items
CREATE TRIGGER update_nav_items_updated_at
  BEFORE UPDATE ON public.nav_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();