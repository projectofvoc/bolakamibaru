import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import EventBadge, { BadgeColor, BadgeIcon } from '@/components/EventBadge';

export interface EventItem {
  id: string;
  name: string;
  banner_url: string | null;
  start_date: string;
  end_date: string;
  join_url: string;
  telegram_url: string | null;
  telegram_enabled: boolean;
  description?: string | null;
  join_enabled?: boolean;
  slug?: string | null;
  badge_enabled?: boolean;
  badge_label?: string | null;
  badge_color?: BadgeColor | null;
  badge_icon?: BadgeIcon | null;
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
  const navigate = useNavigate();
  const showTelegram = event.telegram_enabled && !!event.telegram_url;
  const showJoin = event.join_enabled !== false && !!event.join_url;
  const slugOrId = event.slug || event.id;
  const showBadge = !!event.badge_enabled && !!event.badge_label?.trim();

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const goToDetail = () => navigate(`/event/${slugOrId}`);

  return (
    <article
      className="bg-card rounded-xl overflow-hidden border border-border flex flex-col cursor-pointer hover:border-primary/50 transition-colors h-full"
      onClick={goToDetail}
    >
      <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden shrink-0">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt={event.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Calendar className="w-10 h-10" />
          </div>
        )}
        {showBadge && (
          <div className="absolute top-2 right-2 z-10">
            <EventBadge
              label={event.badge_label!.trim()}
              color={(event.badge_color as BadgeColor) || 'primary'}
              icon={(event.badge_icon as BadgeIcon) || 'none'}
            />
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="text-lg font-bold text-foreground line-clamp-2 min-h-[3.5rem]">{event.name}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatRange(event.start_date, event.end_date, language)}</span>
        </div>
        <div className="flex flex-col gap-2 mt-auto pt-2">
          {showJoin && (
            <Button asChild className="w-full" onClick={stop}>
              <a href={event.join_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('event.join')}
              </a>
            </Button>
          )}
          {showTelegram && (
            <Button asChild variant="secondary" className="w-full" onClick={stop}>
              <a href={event.telegram_url!} target="_blank" rel="noopener noreferrer">
                <Send className="w-4 h-4 mr-2" />
                {t('event.joinTelegram')}
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={(e) => { stop(e); goToDetail(); }}
            type="button"
          >
            {t('event.openDetail')}
          </Button>
        </div>
      </div>
    </article>
  );
};

export default EventCard;