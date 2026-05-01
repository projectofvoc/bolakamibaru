import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Eye, FileText, BarChart3, Newspaper, Link2Off, Users, MousePointerClick,
  Clock, Globe, Smartphone, Loader2, LogOut,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

type Status = { connected: boolean; email: string | null; property_id: string | null };

const RANGES = [7, 30, 90];

const CMSAnalytics: React.FC = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [days, setDays] = useState(30);
  const [propertyInput, setPropertyInput] = useState('');

  // Handle redirect from OAuth callback
  useEffect(() => {
    const url = new URL(window.location.href);
    const connected = url.searchParams.get('ga4_connected');
    const err = url.searchParams.get('ga4_error');
    if (connected) {
      toast({ title: 'Google Analytics terhubung', description: 'Masukkan GA4 Property ID untuk melihat data.' });
      url.searchParams.delete('ga4_connected');
      window.history.replaceState({}, '', url.toString());
      qc.invalidateQueries({ queryKey: ['ga4-status'] });
    }
    if (err) {
      toast({ title: 'Gagal terhubung', description: err, variant: 'destructive' });
      url.searchParams.delete('ga4_error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [toast, qc]);

  // Status
  const { data: status, isLoading: statusLoading } = useQuery<Status>({
    queryKey: ['ga4-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ga4-analytics', { body: { action: 'status' } });
      if (error) throw error;
      return data;
    },
  });

  // Report (only if connected & property set)
  const { data: report, isLoading: reportLoading, error: reportError } = useQuery({
    queryKey: ['ga4-report', days, status?.property_id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ga4-analytics', { body: { action: 'report', days } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    enabled: !!status?.connected && !!status?.property_id,
    refetchInterval: 5 * 60_000,
  });

  // Connect
  const connectMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ga4-oauth-start', {
        body: { return_to: window.location.origin + '/cms/analytics' },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('No URL returned');
      window.location.href = data.url;
    },
    onError: (e: any) => toast({ title: 'Gagal memulai login', description: e.message, variant: 'destructive' }),
  });

  // Set property
  const setPropertyMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ga4-analytics', {
        body: { action: 'set_property', property_id: propertyInput.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast({ title: 'Property ID tersimpan' });
      setPropertyInput('');
      qc.invalidateQueries({ queryKey: ['ga4-status'] });
    },
    onError: (e: any) => toast({ title: 'Gagal menyimpan', description: e.message, variant: 'destructive' }),
  });

  // Disconnect
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('ga4-analytics', { body: { action: 'disconnect' } });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Disconnected' });
      qc.invalidateQueries({ queryKey: ['ga4-status'] });
    },
  });

  // Article publish stats
  const { data: articleStats } = useQuery({
    queryKey: ['cms-article-publish-stats'],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400_000).toISOString();
      const [r30, r7] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published').gte('published_at', thirtyDaysAgo),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published').gte('published_at', sevenDaysAgo),
      ]);
      return { articlesPublished30d: r30.count ?? 0, articlesPublished7d: r7.count ?? 0 };
    },
    refetchInterval: 60_000,
  });

  const { data: topArticles = [] } = useQuery({
    queryKey: ['top-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title_id, featured_image, views, category')
        .order('views', { ascending: false, nullsFirst: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    refetchInterval: 60_000,
  });

  const fmtDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = Math.round(s % 60);
    return `${m}m ${ss}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics
            {status?.connected && status?.property_id && (
              <Badge variant="outline" className="ml-2 text-xs text-emerald-500 border-emerald-500/40">Connected</Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Data pengunjung dari Google Analytics 4
          </p>
        </div>
        {status?.connected && (
          <div className="flex items-center gap-2 flex-wrap">
            {status.property_id && (
              <div className="flex gap-1">
                {RANGES.map((d) => (
                  <Button key={d} size="sm" variant={days === d ? 'default' : 'outline'} onClick={() => setDays(d)}>
                    {d}d
                  </Button>
                ))}
              </div>
            )}
            <Button size="sm" variant="outline" onClick={() => disconnectMutation.mutate()} disabled={disconnectMutation.isPending}>
              <LogOut className="w-4 h-4 mr-1" /> Disconnect
            </Button>
          </div>
        )}
      </div>

      {/* Loading status */}
      {statusLoading && (
        <Card><CardContent className="p-6 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Memuat status koneksi...
        </CardContent></Card>
      )}

      {/* Not connected */}
      {!statusLoading && !status?.connected && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
              <Link2Off className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-3 flex-1">
              <h3 className="font-semibold text-foreground">Hubungkan Google Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Login dengan akun Google yang punya akses ke GA4 property Anda. Hanya scope read-only yang diminta.
              </p>
              <Button onClick={() => connectMutation.mutate()} disabled={connectMutation.isPending}>
                {connectMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Connect Google Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected but no property set */}
      {!statusLoading && status?.connected && !status?.property_id && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Masukkan GA4 Property ID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connected sebagai <strong>{status.email}</strong>. GA4 Admin → Property Settings → Property ID (angka, contoh: <code>123456789</code>).
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="123456789"
                value={propertyInput}
                onChange={(e) => setPropertyInput(e.target.value)}
                inputMode="numeric"
              />
              <Button onClick={() => setPropertyMutation.mutate()} disabled={setPropertyMutation.isPending || !/^\d+$/.test(propertyInput.trim())}>
                Simpan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report */}
      {status?.connected && status?.property_id && (
        <>
          {reportLoading && (
            <Card><CardContent className="p-6 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Mengambil data dari GA4...
            </CardContent></Card>
          )}

          {reportError && (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="p-4 text-sm text-destructive">
                Gagal memuat data: {(reportError as Error).message}
              </CardContent>
            </Card>
          )}

          {report && (
            <>
              {/* Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard icon={<Users className="w-5 h-5 text-emerald-500" />} label="Users" value={report.overview.users.toLocaleString()} />
                <MetricCard icon={<MousePointerClick className="w-5 h-5 text-sky-500" />} label="Sessions" value={report.overview.sessions.toLocaleString()} />
                <MetricCard icon={<Eye className="w-5 h-5 text-violet-500" />} label="Pageviews" value={report.overview.pageviews.toLocaleString()} />
                <MetricCard icon={<Clock className="w-5 h-5 text-amber-500" />} label="Avg Duration" value={fmtDuration(report.overview.avg_session_seconds)} />
              </div>

              {/* Daily chart */}
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

              {/* Top pages + sources */}
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

              {/* Devices + countries */}
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
        </>
      )}

      {/* Internal article stats — always shown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg"><Newspaper className="w-5 h-5 text-emerald-500" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{articleStats?.articlesPublished30d?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Berita Dipublish 30 Hari Terakhir</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 rounded-lg"><Newspaper className="w-5 h-5 text-sky-500" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{articleStats?.articlesPublished7d?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Berita Dipublish 7 Hari Terakhir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Berita Terpopuler
            <Badge variant="secondary" className="ml-2 text-xs">Dari Database</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topArticles.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Belum ada data views artikel</p>
          ) : (
            <div className="space-y-3">
              {topArticles.map((article, index) => (
                <div key={article.id} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                  <span className="text-lg font-bold text-muted-foreground w-6">{index + 1}</span>
                  {article.featured_image && (
                    <img src={article.featured_image} alt={article.title_id} className="w-16 h-10 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{article.title_id}</p>
                    <p className="text-xs text-muted-foreground capitalize">{article.category}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>{article.views || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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

export default CMSAnalytics;
