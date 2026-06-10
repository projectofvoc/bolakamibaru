
-- 1. Add column
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug text;

-- 2. Slug generator function
CREATE OR REPLACE FUNCTION public.slugify_event_name(_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT NULLIF(
    trim(both '-' from
      regexp_replace(
        regexp_replace(lower(coalesce(_name, '')), '[^a-z0-9]+', '-', 'g'),
        '-+', '-', 'g'
      )
    ), ''
  );
$$;

-- 3. Backfill existing rows with unique slugs
DO $$
DECLARE
  r RECORD;
  base_slug text;
  candidate text;
  n int;
BEGIN
  FOR r IN SELECT id, name FROM public.events WHERE slug IS NULL OR slug = '' LOOP
    base_slug := COALESCE(public.slugify_event_name(r.name), 'event');
    candidate := base_slug;
    n := 0;
    WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = candidate AND id <> r.id) LOOP
      candidate := base_slug || '-' || substr(replace(r.id::text, '-', ''), 1, 6);
      n := n + 1;
      EXIT WHEN n > 1;
    END LOOP;
    UPDATE public.events SET slug = candidate WHERE id = r.id;
  END LOOP;
END $$;

-- 4. Unique index
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique ON public.events(slug);

-- 5. Trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION public.events_set_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug text;
  candidate text;
  n int := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR (TG_OP = 'UPDATE' AND NEW.name IS DISTINCT FROM OLD.name AND (NEW.slug = OLD.slug)) THEN
    base_slug := COALESCE(public.slugify_event_name(NEW.name), 'event');
    candidate := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = candidate AND id <> NEW.id) LOOP
      n := n + 1;
      candidate := base_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
      EXIT WHEN n > 5;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_events_set_slug ON public.events;
CREATE TRIGGER trg_events_set_slug
BEFORE INSERT OR UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.events_set_slug();
