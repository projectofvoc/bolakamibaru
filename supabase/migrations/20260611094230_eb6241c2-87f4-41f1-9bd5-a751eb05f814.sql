ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS badge_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS badge_label text,
  ADD COLUMN IF NOT EXISTS badge_color text NOT NULL DEFAULT 'primary',
  ADD COLUMN IF NOT EXISTS badge_icon text NOT NULL DEFAULT 'none';

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_badge_color_check;
ALTER TABLE public.events
  ADD CONSTRAINT events_badge_color_check
  CHECK (badge_color IN ('primary','red','yellow','blue','purple','green'));

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_badge_icon_check;
ALTER TABLE public.events
  ADD CONSTRAINT events_badge_icon_check
  CHECK (badge_icon IN ('none','flame','star','trophy','gift','sparkles','crown','zap'));

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_badge_label_len_check;
ALTER TABLE public.events
  ADD CONSTRAINT events_badge_label_len_check
  CHECK (badge_label IS NULL OR char_length(badge_label) <= 24);