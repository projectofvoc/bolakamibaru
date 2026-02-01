-- Create footer_banners table
CREATE TABLE public.footer_banners (
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
ALTER TABLE public.footer_banners ENABLE ROW LEVEL SECURITY;

-- Public read access for all users
CREATE POLICY "Anyone can view active footer banners"
ON public.footer_banners
FOR SELECT
USING (is_active = true);

-- Admin write access
CREATE POLICY "Admins can manage footer banners"
ON public.footer_banners
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_footer_banners_updated_at
BEFORE UPDATE ON public.footer_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.footer_banners IS 'Banner images displayed above footer - Aspect Ratio: 3:1 (1200x400px recommended)';