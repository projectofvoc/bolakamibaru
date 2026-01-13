-- Create table for tracking article views per session
CREATE TABLE public.article_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(article_id, session_id)
);

-- Enable RLS
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

-- RLS: Allow insert from anyone (for tracking)
CREATE POLICY "Anyone can insert article views" ON public.article_views
  FOR INSERT WITH CHECK (true);

-- RLS: Allow checking if already viewed
CREATE POLICY "Anyone can check if viewed" ON public.article_views
  FOR SELECT USING (true);

-- Create index for faster lookups
CREATE INDEX idx_article_views_article_session ON public.article_views(article_id, session_id);
CREATE INDEX idx_article_views_article_id ON public.article_views(article_id);

-- Create new function with session-based tracking
CREATE OR REPLACE FUNCTION public.increment_article_views_with_session(
  p_article_id uuid,
  p_session_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  already_viewed boolean;
BEGIN
  -- Check if this session already viewed this article
  SELECT EXISTS(
    SELECT 1 FROM article_views 
    WHERE article_id = p_article_id 
    AND session_id = p_session_id
  ) INTO already_viewed;
  
  IF already_viewed THEN
    RETURN FALSE; -- Already counted
  END IF;
  
  -- Record the view
  INSERT INTO article_views (article_id, session_id)
  VALUES (p_article_id, p_session_id)
  ON CONFLICT (article_id, session_id) DO NOTHING;
  
  -- Increment view count
  UPDATE articles 
  SET views = COALESCE(views, 0) + 1 
  WHERE id = p_article_id;
  
  RETURN TRUE; -- New view counted
END;
$$;