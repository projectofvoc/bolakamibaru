-- Create advertisements table
CREATE TABLE public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  media_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Public can view active ads
CREATE POLICY "Public can view active ads" ON public.advertisements
  FOR SELECT USING (is_active = true);

-- Admins can manage all ads
CREATE POLICY "Admins can manage ads" ON public.advertisements
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_advertisements_updated_at
  BEFORE UPDATE ON public.advertisements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for advertisements
INSERT INTO storage.buckets (id, name, public)
VALUES ('advertisements', 'advertisements', true);

-- Storage policies for advertisements bucket
CREATE POLICY "Admins can upload ads media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'advertisements' AND 
    public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update ads media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'advertisements' AND 
    public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete ads media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'advertisements' AND 
    public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Public can view ads media" ON storage.objects
  FOR SELECT USING (bucket_id = 'advertisements');