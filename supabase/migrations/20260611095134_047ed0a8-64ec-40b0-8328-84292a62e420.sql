ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_badge_icon_check;
ALTER TABLE public.events
  ADD CONSTRAINT events_badge_icon_check
  CHECK (badge_icon IN ('none','web','telegram','whatsapp','facebook','instagram','tiktok','youtube','twitter','threads','discord'));