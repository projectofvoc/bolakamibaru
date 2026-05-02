import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye, FileText, Activity, Users, MousePointerClick,
  Clock, Globe, Smartphone, Loader2, RefreshCw,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const RANGES = [7, 30, 90];

const CMSAnalyticsGA4: React.FC = () => {
  const [days, setDays] = useState(30);

  const { data: report, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['ga4-ga4page-report', days],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ga4-analytics', { body: { days } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    refetchInterval: 5 * 60_000,
  });

  const fmtDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = Math.round(s % 60);
    return `${m}m ${ss}s`;
  };

  const errMsg = (error as Error | null)?.message || '';
  const isPermErr = /permission/i.test(errMsg);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Analytics GA4
            {report && (
              <Badge variant="outline" className="ml-2 text-xs text-emerald-500 border-emerald-500/40">
                Connected · {report.property_id}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Data realtime dari Google Analytics 4 (auto-refresh tiap 5 menit)
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            {RANGES.map((d) => (
              <Button key={d} size="sm" variant={days === d ? 'default' : 'outline'} onClick={() => setDays(d)}>
                {d}d
              </Button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {isLoading && (
        <Card><CardContent className="p-6 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Mengambil data dari GA4...
        </CardContent></Card>
      )}

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive space-y-2">
            <p className="font-medium">Gagal memuat data: {errMsg}</p>
            {isPermErr && (
              <p className="text-xs text-muted-foreground">
                Pastikan email service account sudah ditambahkan sebagai <strong>Viewer</strong> di
                GA4 → Admin → Property access management untuk Property ID yang dikonfigurasi.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard icon={<Users className="w-5 h-5 text-emerald-500" />} label="Users" value={report.overview.users.toLocaleString()} />
            <MetricCard icon={<MousePointerClick className="w-5 h-5 text-sky-500" />} label="Sessions" value={report.overview.sessions.toLocaleString()} />
            <MetricCard icon={<Eye className="w-5 h-5 text-violet-500" />} label="Pageviews" value={report.overview.pageviews.toLocaleString()} />
            <MetricCard icon={<Clock className="w-5 h-5 text-amber-500" />} label="Avg Duration" value={fmtDuration(report.overview.avg_session_seconds)} />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Pengunjung Harian</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report.daily}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v.slice(4,6)}/${v.slice(6,8)}`} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Users" />
                    <Line type="monotone" dataKey="pageviews" stroke="#a78bfa" strokeWidth={2} dot={false} name="Pageviews" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-primary" />Top Pages</CardTitle></CardHeader>
              <CardContent>
                <SimpleTable
                  rows={report.top_pages}
                  cols={[
                    { key: 'path', label: 'Path', className: 'truncate max-w-[260px]' },
                    { key: 'views', label: 'Views', align: 'right', format: (v: number) => v.toLocaleString() },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />Traffic Sources</CardTitle></CardHeader>
              <CardContent>
                <SimpleTable
                  rows={report.sources}
                  cols={[
                    { key: 'source', label: 'Source' },
                    { key: 'medium', label: 'Medium' },
                    { key: 'sessions', label: 'Sessions', align: 'right', format: (v: number) => v.toLocaleString() },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Smartphone className="w-5 h-5 text-primary" />Devices</CardTitle></CardHeader>
              <CardContent>
                <SimpleTable
                  rows={report.devices}
                  cols={[
                    { key: 'device', label: 'Device' },
                    { key: 'sessions', label: 'Sessions', align: 'right', format: (v: number) => v.toLocaleString() },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />Top Countries</CardTitle></CardHeader>
              <CardContent>
                <SimpleTable
                  rows={report.countries}
                  cols={[
                    { key: 'country', label: 'Country' },
                    { key: 'sessions', label: 'Sessions', align: 'right', format: (v: number) => v.toLocaleString() },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-secondary rounded-lg">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

type Col = { key: string; label: string; align?: 'left' | 'right'; className?: string; format?: (v: any) => string };
const SimpleTable: React.FC<{ rows: any[]; cols: Col[] }> = ({ rows, cols }) => {
  if (!rows?.length) return <p className="text-sm text-muted-foreground text-center py-6">No data</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground border-b border-border">
            {cols.map((c) => (
              <th key={c.key} className={`py-2 px-2 font-medium ${c.align === 'right' ? 'text-right' : 'text-left'}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/40 last:border-0">
              {cols.map((c) => (
                <td key={c.key} className={`py-2 px-2 ${c.align === 'right' ? 'text-right tabular-nums' : ''} ${c.className || ''}`}>
                  {c.format ? c.format(r[c.key]) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CMSAnalyticsGA4;