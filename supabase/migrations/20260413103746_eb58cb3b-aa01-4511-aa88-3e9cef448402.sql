
-- 1. Bot Sender Settings table
CREATE TABLE public.bot_sender_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean NOT NULL DEFAULT false,
  auto_send_on_publish boolean NOT NULL DEFAULT true,
  allow_manual_send boolean NOT NULL DEFAULT true,
  provider_name text NOT NULL DEFAULT 'telegram',
  bot_token text,
  api_key text,
  secret_key text,
  endpoint_url text,
  destination_id text,
  default_template text DEFAULT E'📰 {title}\n\n{excerpt}\n\n🔗 Baca selengkapnya:\n{article_url}',
  fallback_image_url text,
  send_mode text NOT NULL DEFAULT 'photo_caption',
  parse_mode text NOT NULL DEFAULT 'HTML',
  use_fallback_image boolean NOT NULL DEFAULT true,
  retry_enabled boolean NOT NULL DEFAULT true,
  max_retry_count integer NOT NULL DEFAULT 3,
  retry_delay_seconds integer NOT NULL DEFAULT 30,
  request_timeout_seconds integer NOT NULL DEFAULT 30,
  send_without_image boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.bot_sender_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bot settings" ON public.bot_sender_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed default row
INSERT INTO public.bot_sender_settings (id) VALUES (gen_random_uuid());

-- 2. Add send tracking columns to articles
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS send_status text DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS is_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS send_error text,
  ADD COLUMN IF NOT EXISTS external_message_id text,
  ADD COLUMN IF NOT EXISTS send_attempt_count integer DEFAULT 0;

-- 3. Article Send Logs table
CREATE TABLE public.article_send_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  send_status text NOT NULL DEFAULT 'pending',
  request_payload jsonb,
  response_payload jsonb,
  error_message text,
  attempt_number integer NOT NULL DEFAULT 1,
  sent_to text,
  provider_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.article_send_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage send logs" ON public.article_send_logs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at on bot_sender_settings
CREATE TRIGGER update_bot_sender_settings_updated_at
  BEFORE UPDATE ON public.bot_sender_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
