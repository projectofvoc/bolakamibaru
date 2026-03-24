import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function GoogleIntegrations() {
  const { data: settings } = useQuery({
    queryKey: ['site-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_integrations')
        .select('key, value');
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach(r => { map[r.key] = r.value; });
      return map;
    },
    staleTime: 5 * 60 * 1000, // cache 5 min
  });

  // Inject Google Analytics
  useEffect(() => {
    const gaId = settings?.ga_measurement_id;
    if (!gaId || !gaId.startsWith('G-')) return;

    // Prevent duplicate
    if (document.getElementById('ga-gtag-script')) return;

    // gtag.js loader
    const script = document.createElement('script');
    script.id = 'ga-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // gtag init
    const initScript = document.createElement('script');
    initScript.id = 'ga-gtag-init';
    initScript.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(initScript);

    return () => {
      document.getElementById('ga-gtag-script')?.remove();
      document.getElementById('ga-gtag-init')?.remove();
    };
  }, [settings?.ga_measurement_id]);

  // Inject Google Search Console meta tag
  useEffect(() => {
    const code = settings?.gsc_verification_code;
    const method = settings?.gsc_method;
    if (!code || method !== 'meta_tag') return;

    // Prevent duplicate
    if (document.getElementById('gsc-meta-tag')) return;

    const meta = document.createElement('meta');
    meta.id = 'gsc-meta-tag';
    meta.name = 'google-site-verification';
    meta.content = code;
    document.head.appendChild(meta);

    return () => {
      document.getElementById('gsc-meta-tag')?.remove();
    };
  }, [settings?.gsc_verification_code, settings?.gsc_method]);

  return null;
}
