import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Send, Link2, Check, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { downloadEventPdf } from '@/lib/eventPdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
  const { toast } = useToast();
  const showTelegram = event.telegram_enabled && !!event.telegram_url;
  const showJoin = event.join_enabled !== false && !!event.join_url;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasDescription = !!event.description && event.description.trim().length > 0;

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/share/event/${event.id}`
      : `/share/event/${event.id}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: t('event.linkCopied') });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <>
    <article
      className="bg-card rounded-xl overflow-hidden border border-border flex flex-col cursor-pointer hover:border-primary/50 transition-colors h-full"
      onClick={() => setOpen(true)}
    >
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
            onClick={handleCopy}
            type="button"
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Link2 className="w-4 h-4 mr-2" />
            )}
            {t('event.copyLink')}
          </Button>
          {hasDescription && (
            <Button
              variant="outline"
              className="w-full"
              onClick={async (e) => {
                stop(e);
                try {
                  await downloadEventPdf(event);
                } catch (err) {
                  console.error('PDF download failed', err);
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
      </div>
    </article>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95vw] sm:w-full max-w-3xl h-[90vh] sm:h-auto sm:max-h-[92vh] p-0 flex flex-col gap-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {event.banner_url && (
            <div className="w-full bg-black border-b border-border flex items-center justify-center">
              <img
                src={event.banner_url}
                alt={event.name}
                className="w-full h-auto object-contain"
              />
            </div>
          )}
          <DialogHeader className="space-y-2 text-left p-4 sm:p-6 sm:pb-3 border-b border-border">
            <DialogTitle className="text-xl sm:text-2xl font-bold pr-8">{event.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>
                {t('event.period')}: {formatRange(event.start_date, event.end_date, language)}
              </span>
            </DialogDescription>
          </DialogHeader>

          {hasDescription && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-foreground/90 whitespace-pre-line leading-relaxed">
              {event.description}
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row gap-2 p-3 sm:p-4 border-t border-border bg-card">
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
                {t('event.joinTelegram')}
              </a>
            </Button>
          )}
          <Button variant="outline" className="flex-1" onClick={handleCopy} type="button">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
            {t('event.copyLink')}
          </Button>
          {hasDescription && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={async () => {
                try {
                  await downloadEventPdf(event);
                } catch (err) {
                  console.error('PDF download failed', err);
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
      </DialogContent>
    </Dialog>
    </>
  );
};

export default EventCard;