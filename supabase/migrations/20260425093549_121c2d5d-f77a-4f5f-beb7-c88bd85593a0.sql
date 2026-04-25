-- Enable pg_net for HTTP from Postgres
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function: notify edge function when article is published
CREATE OR REPLACE FUNCTION public.notify_bot_on_publish()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  edge_url text := 'https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/bot-send-article';
  service_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcnZndXhrYW5qdW9ybnRsbW14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE0NDYxMSwiZXhwIjoyMDgzNzIwNjExfQ.ebDizNzXtDAdA-nnutGy6WDm-7QX1SL_N5CFrdJPD4w';
BEGIN
  -- Only fire on transition into 'published' or insert with published, and not yet sent
  IF NEW.status = 'published' AND COALESCE(NEW.is_sent, false) = false THEN
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
      PERFORM extensions.http_post(
        url := edge_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_key
        ),
        body := jsonb_build_object('article_id', NEW.id)
      );
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block article save if HTTP call setup fails
  RAISE WARNING 'notify_bot_on_publish failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop old trigger if exists then create new
DROP TRIGGER IF EXISTS trg_notify_bot_on_publish ON public.articles;

CREATE TRIGGER trg_notify_bot_on_publish
AFTER INSERT OR UPDATE OF status ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.notify_bot_on_publish();