-- Create sidebar_banners table for left/right vertical banners
CREATE TABLE public.sidebar_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'left' CHECK (position IN ('left', 'right')),
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sidebar_banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Anyone can view active sidebar banners"
ON public.sidebar_banners
FOR SELECT
USING (is_active = true);

-- Admins can manage banners
CREATE POLICY "Admins can manage sidebar banners"
ON public.sidebar_banners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_sidebar_banners_updated_at
BEFORE UPDATE ON public.sidebar_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for sidebar banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sidebar-banners', 'sidebar-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for sidebar banners bucket
CREATE POLICY "Anyone can view sidebar banners images"
ON storage.objects FOR SELECT
USING (bucket_id = 'sidebar-banners');

CREATE POLICY "Admins can upload sidebar banners"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sidebar-banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sidebar banners"
ON storage.objects FOR UPDATE
USING (bucket_id = 'sidebar-banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sidebar banners"
ON storage.objects FOR DELETE
USING (bucket_id = 'sidebar-banners' AND has_role(auth.uid(), 'admin'::app_role));