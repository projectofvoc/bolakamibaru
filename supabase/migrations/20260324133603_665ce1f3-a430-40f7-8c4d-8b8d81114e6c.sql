CREATE TABLE public.site_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.site_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage integrations" ON public.site_integrations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read integrations" ON public.site_integrations
  FOR SELECT TO public USING (true);