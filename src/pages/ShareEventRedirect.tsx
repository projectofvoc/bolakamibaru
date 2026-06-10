import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ShareEventRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      const edgeFunctionUrl = `https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/event-og-metadata?id=${encodeURIComponent(id)}`;
      window.location.replace(edgeFunctionUrl);
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Memuat event...</p>
    </div>
  );
};

export default ShareEventRedirect;