-- Create function to increment article views
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE articles 
  SET views = COALESCE(views, 0) + 1 
  WHERE id = article_id;
END;
$$;