import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  FileText,
  BarChart3,
  RefreshCw,
  Calendar,
  AlertCircle,
  Wifi,
  Newspaper,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

interface HistatsAnalytics {
  visitors: number;
  pageviews: number;
  pageviewsPerVisit: number;
  sessionDuration: number;
  bounceRate: number;
  trend: { date: string; visitors: number }[];
}

interface AnalyticsViewModel {
  visitors: number;
  pageviews: number;
  pageviewsPerVisit: number;
  sessionDuration: number;
  bounceRate: number;
  visitorsPerDay: { date: string; visitors: number }[];
  articlesPublished30d: number;
  articlesPublished7d: number;
  stale: boolean;
  source: string;
}

const emptyVm: AnalyticsViewModel = {
  visitors: 0,
  pageviews: 0,
  pageviewsPerVisit: 0,
  sessionDuration: 0,
  bounceRate: 0,
  visitorsPerDay: [],
  articlesPublished30d: 0,
  articlesPublished7d: 0,
  stale: false,
  source: 'empty',
};

const CMSAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch Histats analytics via edge function
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['cms-histats-analytics', dateRange],
    queryFn: async (): Promise<AnalyticsViewModel> => {
      const { data, error } = await supabase.functions.invoke(
        'get-histats-analytics',
        { body: { range: dateRange } },
      );
      if (error) {
        console.error('Histats edge fn error:', error);
        return emptyVm;
      }
      const stats: HistatsAnalytics | null = data?.data ?? null;
      if (!stats) return { ...emptyVm, source: data?.source ?? 'error' };

      // Article publish counts (30d / 7d) — kept from internal DB
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString();
      const [r30, r7] = await Promise.all([
        supabase
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')
          .gte('published_at', thirtyDaysAgo),
        supabase
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')
          .gte('published_at', sevenDaysAgo),
      ]);

      return {
        visitors: stats.visitors || 0,
        pageviews: stats.pageviews || 0,
        pageviewsPerVisit: stats.pageviewsPerVisit || 0,
        sessionDuration: stats.sessionDuration || 0,
        bounceRate: stats.bounceRate || 0,
        visitorsPerDay: (stats.trend || []).map((t) => {
          let label = t.date;
          try {
            label = format(parseISO(t.date), 'dd MMM', { locale: localeID });
          } catch (_) { /* ignore */ }
          return { date: label, visitors: t.visitors };
        }),
        articlesPublished30d: r30.count ?? 0,
        articlesPublished7d: r7.count ?? 0,
        stale: !!data?.stale,
        source: data?.source ?? 'live',
      };
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // Top articles from DB
  const { data: topArticles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['top-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title_id, title_en, featured_image, views, category, slug')
        .order('views', { ascending: false, nullsFirst: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLoading = analyticsLoading || articlesLoading;
  const hasData = analyticsData && (analyticsData.visitors > 0 || analyticsData.pageviews > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics
            <Badge variant="outline" className="ml-2 text-xs">
              <Wifi className="w-3 h-3 mr-1" />
              Histats Realtime
            </Badge>
            {analyticsData?.stale && (
              <Badge variant="secondary" className="ml-1 text-xs">Cached</Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Data realtime dari Histats — Auto refresh setiap 60 detik
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Terakhir diperbarui: {format(lastUpdated, 'dd MMM yyyy HH:mm:ss', { locale: localeID })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-secondary rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDateRange(range)}
                className="px-3"
              >
                {range === '7d' ? '7 Hari' : range === '30d' ? '30 Hari' : '90 Hari'}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {!isLoading && !hasData && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-600">Data Histats belum tersedia</p>
              <p className="text-sm text-muted-foreground">
                Pastikan kredensial Histats benar dan site ID terdaftar. Cek log edge function `get-histats-analytics` untuk detail error.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Mengambil data dari Histats...</p>
          </div>
        </div>
      ) : (
        <>
          {/* 5 Stat Cards (Histats) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {analyticsData?.visitors.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Visitors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {analyticsData?.pageviews.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Pageviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {analyticsData?.pageviewsPerVisit?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-xs text-muted-foreground">Pages/Visit</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {formatDuration(analyticsData?.sessionDuration || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg. Duration</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {analyticsData?.bounceRate?.toFixed(0) || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Bounce Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Article publish stats — internal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Newspaper className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {analyticsData?.articlesPublished30d?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Berita Dipublish 30 Hari Terakhir</p>
                    <p className="text-[10px] text-muted-foreground/70">Last 30 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-500/10 rounded-lg">
                    <Newspaper className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {analyticsData?.articlesPublished7d?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Berita Dipublish 7 Hari Terakhir</p>
                    <p className="text-[10px] text-muted-foreground/70">Last 7 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Trend Pengunjung
                {analyticsData?.visitorsPerDay && analyticsData.visitorsPerDay.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {analyticsData.visitorsPerDay.length} hari
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.visitorsPerDay && analyticsData.visitorsPerDay.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.visitorsPerDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="visitors"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Tidak ada data trend untuk periode ini
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top articles — DB */}
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
                <p className="text-muted-foreground text-center py-8">
                  Belum ada data views artikel
                </p>
              ) : (
                <div className="space-y-3">
                  {topArticles.map((article, index) => (
                    <div
                      key={article.id}
                      className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <span className="text-lg font-bold text-muted-foreground w-6">{index + 1}</span>
                      {article.featured_image && (
                        <img
                          src={article.featured_image}
                          alt={article.title_id}
                          className="w-16 h-10 object-cover rounded"
                        />
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
        </>
      )}
    </div>
  );
};

export default CMSAnalytics;