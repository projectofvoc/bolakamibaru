import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface EventItem {
  id: string;
  name: string;
  banner_url: string | null;
  start_date: string;
  end_date: string;
  join_url: string;
  telegram_url: string | null;
  telegram_enabled: boolean;
}

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

const EventCard: React.FC<{ event: EventItem }> = ({ event }) => {
  const { language, t } = useLanguage();
  const showTelegram = event.telegram_enabled && !!event.telegram_url;

  return (
    <article className="bg-card rounded-xl overflow-hidden border border-border flex flex-col">
      <div className="aspect-[16/9] bg-muted overflow-hidden">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt={event.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Calendar className="w-10 h-10" />
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="text-lg font-bold text-foreground line-clamp-2">{event.name}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatRange(event.start_date, event.end_date, language)}</span>
        </div>
        <div className="flex flex-col gap-2 mt-auto pt-2">
          <Button asChild className="w-full">
            <a href={event.join_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('event.join')}
            </a>
          </Button>
          {showTelegram && (
            <Button asChild variant="secondary" className="w-full">
              <a href={event.telegram_url!} target="_blank" rel="noopener noreferrer">
                <Send className="w-4 h-4 mr-2" />
                {t('event.joinTelegram')}
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default EventCard;