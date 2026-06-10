import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ShareEventRedirect: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();

  useEffect(() => {
    if (!idOrSlug) return;
    const param = UUID_RE.test(idOrSlug) ? 'id' : 'slug';
    const edgeFunctionUrl = `https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/event-og-metadata?${param}=${encodeURIComponent(idOrSlug)}`;
    window.location.replace(edgeFunctionUrl);
  }, [idOrSlug]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Memuat event...</p>
    </div>
  );
};

export default ShareEventRedirect;