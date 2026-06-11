import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ShareEventRedirect: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();

  if (!idOrSlug) {
    return <Navigate to="/event" replace />;
  }

  // UUID lama → /event?id=<uuid> (fallback list). Slug → /event/<slug> (landing page).
  const target = UUID_RE.test(idOrSlug)
    ? `/event?id=${encodeURIComponent(idOrSlug)}`
    : `/event/${encodeURIComponent(idOrSlug)}`;

  return (
    <>
      <Navigate to={target} replace />
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat event...</p>
      </div>
    </>
  );
};

export default ShareEventRedirect;