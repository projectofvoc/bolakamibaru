import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import EventCard, { EventItem } from './EventCard';
import { ChevronRight } from 'lucide-react';

const EventsSection: React.FC = () => {
  const { t } = useLanguage();
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', 'home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id,name,banner_url,start_date,end_date,join_url,telegram_url,telegram_enabled,description')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('start_date', { ascending: true })
        .limit(3);
      if (error) throw error;
      return (data as unknown as EventItem[]) || [];
    },
  });

  if (!isLoading && events.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('event.sectionTitle')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('event.sectionSubtitle')}</p>
        </div>
        <Link
          to="/event"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
        >
          {t('event.viewAll')}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-card rounded-xl overflow-hidden border border-border">
              <div className="aspect-[16/9] bg-muted animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
};

export default EventsSection;