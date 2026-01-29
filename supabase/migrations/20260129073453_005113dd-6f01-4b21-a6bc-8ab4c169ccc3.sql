-- Tabel untuk menyimpan cache API responses
CREATE TABLE IF NOT EXISTS public.api_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  cache_value JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index untuk lookup cepat
CREATE INDEX IF NOT EXISTS idx_api_cache_key ON public.api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON public.api_cache(expires_at);

-- RLS: Enable untuk keamanan
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Policy untuk Edge Functions dengan service role (bisa semua operasi)
CREATE POLICY "Service role can manage cache" ON public.api_cache
  FOR ALL USING (true) WITH CHECK (true);

-- Function untuk cleanup expired cache (bisa dipanggil secara periodik)
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.api_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;