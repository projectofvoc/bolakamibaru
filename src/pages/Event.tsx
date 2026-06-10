import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventCard, { EventItem } from '@/components/EventCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar } from 'lucide-react';

const EventPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const focusEventId = searchParams.get('id');
  const focusEventSlug = searchParams.get('slug');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id,name,slug,banner_url,start_date,end_date,join_url,telegram_url,telegram_enabled,description,join_enabled')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('start_date', { ascending: true });
      if (error) throw error;
      return (data as unknown as EventItem[]) || [];
    },
  });

  const focusEvent = focusEventSlug
    ? events.find((e) => e.slug === focusEventSlug)
    : focusEventId
      ? events.find((e) => e.id === focusEventId)
      : null;

  useEffect(() => {
    const targetId = focusEvent?.id || focusEventId;
    if (!targetId) return;
    const el = document.getElementById(`event-${targetId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focusEventId, focusEvent, events]);

  const pageTitle = focusEvent
    ? `${focusEvent.name} - BOLAKAMI`
    : 'Event BOLAKAMI - Event & Komunitas Sepak Bola';
  const pageDesc = focusEvent
    ? (focusEvent.description || 'Ikuti event komunitas BOLAKAMI').replace(/\s+/g, ' ').slice(0, 160)
    : 'Daftar event terbaru BOLAKAMI. Ikuti event komunitas sepak bola, promo, dan gabung grup Telegram resmi.';
  const canonicalParam = focusEvent?.slug
    ? `?slug=${focusEvent.slug}`
    : focusEventId
      ? `?id=${focusEventId}`
      : '';

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link
          rel="canonical"
          href={`https://bolakami.com/event${canonicalParam}`}
        />
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t('event.pageTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('event.pageSubtitle')}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border border-border">
                <div className="aspect-[16/9] bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-card rounded-xl border border-border py-16 flex flex-col items-center justify-center text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground">{t('event.empty')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('event.emptyDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div key={event.id} id={`event-${event.id}`} className="h-full">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EventPage;