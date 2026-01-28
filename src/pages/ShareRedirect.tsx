import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ShareRedirect: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    if (slug) {
      // Redirect langsung ke Edge Function untuk OG metadata
      // Edge Function akan generate HTML dengan OG tags yang benar untuk crawler
      // kemudian redirect browser ke halaman artikel sebenarnya
      const edgeFunctionUrl = `https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/og-metadata?slug=${encodeURIComponent(slug)}`;
      window.location.replace(edgeFunctionUrl);
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Memuat berita...</p>
    </div>
  );
};

export default ShareRedirect;
