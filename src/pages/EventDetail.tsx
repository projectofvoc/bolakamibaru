import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import EventBadge, { BadgeColor, BadgeIcon } from '@/components/EventBadge';
import { downloadEventPdf } from '@/lib/eventPdf';
import { linkifyText } from '@/lib/linkify';
import { Calendar, ExternalLink, Send, Share2, Check, Download, ArrowLeft, Copy } from 'lucide-react';
import type { EventItem } from '@/components/EventCard';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const formatRange = (start: string, end: string, lang: 'id' | 'en') => {
  const s = new Date(start);
  const e = new Date(end);
  const locale = lang === 'id' ? 'id-ID' : 'en-US';
  const opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  };
  return `${s.toLocaleDateString(locale, opts)} – ${e.toLocaleDateString(locale, opts)} WIB`;
};

const EventDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [descCopied, setDescCopied] = useState(false);

  const isUuid = !!slug && UUID_RE.test(slug);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event-detail', slug],
    enabled: !!slug,
    queryFn: async () => {
      const cols = 'id,name,slug,banner_url,start_date,end_date,join_url,telegram_url,telegram_enabled,description,join_enabled,badge_enabled,badge_label,badge_color,badge_icon';
      const q = supabase.from('events').select(cols).eq('is_active', true);
      const { data, error } = isUuid
        ? await q.eq('id', slug!).maybeSingle()
        : await q.eq('slug', slug!).maybeSingle();
      if (error) throw error;
      return (data as unknown as EventItem) || null;
    },
  });

  const canonicalSlug = event?.slug || slug || '';
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/event/${canonicalSlug}`
    : `/event/${canonicalSlug}`;

  const handleShare = async () => {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav && typeof nav.share === 'function') {
      try {
        await nav.share({
          title: event?.name || 'BOLAKAMI Event',
          text: event?.name || '',
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        // fall through to clipboard fallback
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: t('event.linkCopiedFallback') });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleCopyDescription = async () => {
    if (!event?.description) return;
    try {
      await navigator.clipboard.writeText(event.description);
      setDescCopied(true);
      toast({ title: language === 'id' ? 'Detail event disalin' : 'Event details copied' });
      setTimeout(() => setDescCopied(false), 1800);
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const showJoin = !!event && event.join_enabled !== false && !!event.join_url;
  const showTelegram = !!event && event.telegram_enabled && !!event.telegram_url;
  const hasDescription = !!event?.description && event.description.trim().length > 0;
  const showBadge =
    !!event?.badge_enabled &&
    (!!event.badge_label?.trim() || (event.badge_icon && event.badge_icon !== 'none'));

  const pageTitle = event ? `${event.name} - BOLAKAMI` : 'Event - BOLAKAMI';
  const pageDesc = event
    ? (event.description || event.name).replace(/\s+/g, ' ').slice(0, 160)
    : 'Event komunitas BOLAKAMI';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={`https://bolakami.com/event/${canonicalSlug}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={`https://bolakami.com/event/${canonicalSlug}`} />
        <meta property="og:type" content="article" />
        {event?.banner_url && <meta property="og:image" content={event.banner_url} />}
      </Helmet>

      <Header />

      <main className="flex-1 pb-28 md:pb-10">
        <div className="container mx-auto px-4 md:px-8 py-6">
          <Link
            to="/event"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('event.back')}
          </Link>

          {isLoading ? (
            <div className="space-y-6">
              <div className="w-full aspect-[16/9] max-h-[60vh] bg-muted animate-pulse rounded-xl" />
              <div className="h-8 bg-muted rounded animate-pulse w-2/3" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
                <div className="h-3 bg-muted rounded animate-pulse w-4/6" />
              </div>
            </div>
          ) : !event ? (
            <div className="bg-card border border-border rounded-xl py-16 px-6 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-foreground">{t('event.notFound')}</h1>
              <p className="text-sm text-muted-foreground mt-2">{t('event.notFoundDesc')}</p>
              <Button asChild className="mt-6">
                <Link to="/event">{t('event.back')}</Link>
              </Button>
            </div>
          ) : (
            <article className="max-w-4xl mx-auto">
              {/* Hero banner */}
              <div className="relative w-full bg-muted rounded-xl overflow-hidden border border-border">
                {event.banner_url ? (
                  <img
                    src={event.banner_url}
                    alt={event.name}
                    className="w-full h-auto max-h-[60vh] object-cover"
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full aspect-[16/9] flex items-center justify-center text-muted-foreground">
                    <Calendar className="w-12 h-12" />
                  </div>
                )}
                {showBadge && (
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                    <EventBadge
                      label={event.badge_label?.trim() || ''}
                      color={(event.badge_color as BadgeColor) || 'primary'}
                      icon={(event.badge_icon as BadgeIcon) || 'none'}
                      size="md"
                    />
                  </div>
                )}
              </div>

              {/* Title + period */}
              <header className="mt-6">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
                  {event.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                  <Calendar className="w-4 h-4" />
                  <span>{t('event.period')}: {formatRange(event.start_date, event.end_date, language)}</span>
                </div>
              </header>

              {/* Inline actions (desktop) */}
              <div className="hidden md:flex flex-wrap gap-2 mt-6">
                {showJoin && (
                  <Button asChild>
                    <a href={event.join_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('event.join')}
                    </a>
                  </Button>
                )}
                {showTelegram && (
                  <Button asChild variant="secondary">
                    <a href={event.telegram_url!} target="_blank" rel="noopener noreferrer">
                      <Send className="w-4 h-4 mr-2" />
                      {t('event.joinTelegram')}
                    </a>
                  </Button>
                )}
                <Button variant="outline" onClick={handleShare} type="button">
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                  {t('event.share')}
                </Button>
                {hasDescription && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await downloadEventPdf(event);
                      } catch (err) {
                        toast({
                          title: 'Gagal membuat PDF',
                          description: err instanceof Error ? err.message : 'Terjadi kesalahan',
                          variant: 'destructive',
                        });
                      }
                    }}
                    type="button"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('event.downloadPdf')}
                  </Button>
                )}
              </div>

              {/* Description */}
              {hasDescription && (
                <section className="mt-8 bg-card border border-border rounded-xl p-5 md:p-7">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-foreground">{t('event.detailsHeading')}</h2>
                    <button
                      type="button"
                      onClick={handleCopyDescription}
                      aria-label={language === 'id' ? 'Salin detail' : 'Copy details'}
                      title={language === 'id' ? 'Salin detail' : 'Copy details'}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {descCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-sm md:text-base text-foreground/90 whitespace-pre-line leading-relaxed">
                    {linkifyText(event.description)}
                  </div>
                </section>
              )}
            </article>
          )}
        </div>
      </main>

      {/* Sticky action bar (mobile only) */}
      {event && (showJoin || showTelegram) && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border p-3 flex gap-2">
          {showJoin && (
            <Button asChild className="flex-1">
              <a href={event.join_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('event.join')}
              </a>
            </Button>
          )}
          {showTelegram && (
            <Button asChild variant="secondary" className="flex-1">
              <a href={event.telegram_url!} target="_blank" rel="noopener noreferrer">
                <Send className="w-4 h-4 mr-2" />
                Telegram
              </a>
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={handleShare} type="button" aria-label={t('event.share')}>
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventDetail;