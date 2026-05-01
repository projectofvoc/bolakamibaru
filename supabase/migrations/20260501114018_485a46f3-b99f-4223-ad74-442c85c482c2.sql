CREATE TABLE public.ga4_oauth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  google_email text,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  ga4_property_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ga4_oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view own ga4 token"
ON public.ga4_oauth_tokens FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert own ga4 token"
ON public.ga4_oauth_tokens FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update own ga4 token"
ON public.ga4_oauth_tokens FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete own ga4 token"
ON public.ga4_oauth_tokens FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_ga4_oauth_tokens_updated_at
BEFORE UPDATE ON public.ga4_oauth_tokens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();