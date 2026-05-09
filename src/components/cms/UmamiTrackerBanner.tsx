import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Eye, Users, MousePointerClick, TrendingDown, Clock, Loader2, Play, SkipForward, MousePointer, Megaphone, X as XIcon, ExternalLink } from 'lucide-react';

const RANGES: { label: string; hours: number }[] = [
  { label: '24j', hours: 24 },
  { label: '7h', hours: 24 * 7 },
  { label: '30h', hours: 24 * 30 },
];

const EVENT_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  preroll_view: { label: 'Preroll View', icon: <Play className="w-4 h-4" />, color: 'text-violet-400' },
  preroll_skip: { label: 'Preroll Skip', icon: <SkipForward className="w-4 h-4" />, color: 'text-amber-400' },
  preroll_click: { label: 'Preroll Click', icon: <MousePointer className="w-4 h-4" />, color: 'text-emerald-400' },
  popup_banner_view: { label: 'Popup View', icon: <Megaphone className="w-4 h-4" />, color: 'text-sky-400' },
  popup_banner_close: { label: 'Popup Close', icon: <XIcon className="w-4 h-4" />, color: 'text-rose-400' },
  popup_banner_click: { label: 'Popup Click', icon: <ExternalLink className="w-4 h-4" />, color: 'text-pink-400' },
};
const EVENT_ORDER = ['preroll_view', 'preroll_skip', 'preroll_click', 'popup_banner_view', 'popup_banner_close', 'popup_banner_click'];

const fmtDuration = (sec: number) => {
  if (!sec) return '0s';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  if (h) return `${h}j ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
};

const pct = (cur: number, prev: number) => {
  if (!prev) return null;
  return ((cur - prev) / prev) * 100;
};

const UmamiTrackerBanner: React.FC = () => {
  const [hours, setHours] = useState(24);

  const { data: stats, isLoading: loading, error: err } = useQuery({
    queryKey: ['umami-stats-direct', hours],
    queryFn: async () => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/umami-stats?hours=${hours}`;
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(url, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
      return json;
    },
    refetchInterval: 5 * 60_000,
  });

  const bounceRate = stats && stats.visits ? (stats.bounces / stats.visits) * 100 : 0;
  const avgDuration = stats && stats.visits ? stats.totaltime / stats.visits : 0;

  const cmp = stats?.comparison;
  const dPV = cmp ? pct(stats.pageviews, cmp.pageviews) : null;
  const dV = cmp ? pct(stats.visitors, cmp.visitors) : null;
  const dS = cmp ? pct(stats.visits, cmp.visits) : null;

  const eventMap: Record<string, number> = {};
  (stats?.events || []).forEach((e: { x: string; y: number }) => { eventMap[e.x] = e.y; });

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/15">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Umami Tracker
                <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/40">Live</Badge>
              </h3>
              <p className="text-[11px] text-muted-foreground">Realtime tracker bolakami.com</p>
            </div>
          </div>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <Button
                key={r.hours}
                size="sm"
                variant={hours === r.hours ? 'default' : 'outline'}
                className="h-7 px-2.5 text-xs"
                onClick={() => setHours(r.hours)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Memuat data Umami...
          </div>
        )}

        {err && (
          <p className="text-xs text-destructive py-3">Gagal memuat: {(err as Error).message}</p>
        )}

        {stats && !loading && (
          <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Metric icon={<Eye className="w-4 h-4 text-violet-400" />} label="Pageviews" value={stats.pageviews} delta={dPV} />
            <Metric icon={<Users className="w-4 h-4 text-emerald-400" />} label="Visitors" value={stats.visitors} delta={dV} />
            <Metric icon={<MousePointerClick className="w-4 h-4 text-sky-400" />} label="Visits" value={stats.visits} delta={dS} />
            <Metric icon={<TrendingDown className="w-4 h-4 text-amber-400" />} label="Bounce" value={`${bounceRate.toFixed(1)}%`} />
            <Metric icon={<Clock className="w-4 h-4 text-pink-400" />} label="Avg Time" value={fmtDuration(avgDuration)} />
          </div>
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-2">Event Tracking</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {EVENT_ORDER.map((key) => {
                const meta = EVENT_META[key];
                return (
                  <Metric
                    key={key}
                    icon={<span className={meta.color}>{meta.icon}</span>}
                    label={meta.label}
                    value={eventMap[key] || 0}
                  />
                );
              })}
            </div>
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Metric: React.FC<{ icon: React.ReactNode; label: string; value: string | number; delta?: number | null }> = ({ icon, label, value, delta }) => (
  <div className="bg-secondary/40 rounded-lg p-3 border border-border/40">
    <div className="flex items-center gap-1.5 mb-1.5">
      {icon}
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
    </div>
    <p className="text-xl font-bold text-foreground tabular-nums">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
    {delta !== null && delta !== undefined && (
      <p className={`text-[10px] mt-0.5 tabular-nums ${delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
        {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}% vs prev
      </p>
    )}
  </div>
);

export default UmamiTrackerBanner;