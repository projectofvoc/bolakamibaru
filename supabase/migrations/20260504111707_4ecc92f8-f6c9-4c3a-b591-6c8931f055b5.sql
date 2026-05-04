CREATE OR REPLACE FUNCTION public.get_total_article_views()
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(views), 0)::bigint
  FROM public.articles
  WHERE status = 'published';
$$;