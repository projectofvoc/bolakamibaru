import React, { useState, useEffect } from 'react';
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
  Globe,
  Smartphone,
  Monitor,
  FileText,
  BarChart3,
  RefreshCw,
  Calendar,
  AlertCircle,
  Wifi,
  Newspaper
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

// Color palette for charts
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface AnalyticsData {
  visitors: number;
  pageviews: number;
  pageviewsPerVisit: number;
  sessionDuration: number;
  bounceRate: number;
  visitorsPerDay: { date: string; visitors: number }[];
  topPages: { path: string; pageviews: number }[];
  countries: { country: string; visitors: number; percentage: number }[];
  devices: { device: string; visitors: number; percentage: number }[];
  sources: { source: string; visitors: number }[];
}

// Country code to name mapping
const getCountryName = (code: string): string => {
  const countries: Record<string, string> = {
    'ID': 'Indonesia',
    'TH': 'Thailand',
    'KH': 'Cambodia',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'US': 'United States',
    'GB': 'United Kingdom',
    'AU': 'Australia',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'IN': 'India',
    'PH': 'Philippines',
    'VN': 'Vietnam',
    'DE': 'Germany',
    'FR': 'France',
    'NL': 'Netherlands',
    'BR': 'Brazil',
    'CA': 'Canada',
  };
  return countries[code] || code;
};

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getEmptyAnalyticsData = (): AnalyticsData => ({
  visitors: 0,
  pageviews: 0,
  pageviewsPerVisit: 0,
  sessionDuration: 0,
  bounceRate: 0,
  visitorsPerDay: [],
  topPages: [],
  countries: [],
  devices: [],
  sources: []
});

const CMSAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const getDays = () => {
    switch (dateRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  };

  // Fetch analytics data from edge function (REAL DATA from Lovable Analytics)
  const { data: analyticsData, isLoading: analyticsLoading, refetch, error: analyticsError, dataUpdatedAt } = useQuery({
    queryKey: ['cms-analytics', dateRange],
    queryFn: async (): Promise<AnalyticsData> => {
      const days = getDays();
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');
      
      console.log('Fetching analytics for:', { startDate, endDate });
      
      try {
        const { data, error } = await supabase.functions.invoke('get-analytics', {
          body: { startDate, endDate, granularity: 'daily' }
        });
        
        if (error) {
          console.error('Edge function error:', error);
          throw error;
        }

        console.log('Analytics response:', data);

        if (data.source === 'error' || data.source === 'fallback') {
          console.warn('Analytics fallback/error:', data.error);
          return getEmptyAnalyticsData();
        }

        const apiData = data.data;
        
        // Transform response to match interface
        const totalCountryVisitors = apiData.countries?.reduce((sum: number, c: { count: number }) => sum + c.count, 0) || 1;
        const totalDeviceVisitors = apiData.devices?.reduce((sum: number, d: { count: number }) => sum + d.count, 0) || 1;

        return {
          visitors: apiData.visitors?.total || 0,
          pageviews: apiData.pageviews?.total || 0,
          pageviewsPerVisit: apiData.pageviewsPerVisit?.total || 0,
          sessionDuration: apiData.sessionDuration?.total || 0,
          bounceRate: apiData.bounceRate?.total || 0,
          visitorsPerDay: apiData.visitors?.trend?.map((t: { date: string; value: number }) => ({
            date: format(new Date(t.date), 'dd MMM', { locale: localeID }),
            visitors: t.value
          })) || [],
          topPages: apiData.pages?.map((p: { page: string; count: number }) => ({
            path: p.page,
            pageviews: p.count
          })) || [],
          countries: apiData.countries?.map((c: { country: string; count: number }) => ({
            country: getCountryName(c.country),
            visitors: c.count,
            percentage: Math.round((c.count / totalCountryVisitors) * 100)
          })) || [],
          devices: apiData.devices?.map((d: { device: string; count: number }) => ({
            device: capitalizeFirst(d.device),
            visitors: d.count,
            percentage: Math.round((d.count / totalDeviceVisitors) * 100)
          })) || [],
          sources: apiData.sources?.map((s: { source: string; count: number }) => ({
            source: s.source,
            visitors: s.count
          })) || []
        };
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        return getEmptyAnalyticsData();
      }
    },
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Fetch top articles by views from database
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
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
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
              Real-time
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Data real dari Lovable Analytics - Auto refresh setiap 60 detik
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Terakhir diperbarui: {format(lastUpdated, 'dd MMM yyyy HH:mm:ss', { locale: localeID })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
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

      {/* Error/Warning Alert */}
      {!isLoading && !hasData && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-600">Data analytics sedang dimuat</p>
              <p className="text-sm text-muted-foreground">
                Jika data tidak muncul, pastikan edge function 'get-analytics' sudah ter-deploy dan LOVABLE_API_KEY sudah dikonfigurasi.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Mengambil data analytics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
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

          {/* Visitors Trend Chart */}
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
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
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

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Country Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Distribusi Negara
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData?.countries && analyticsData.countries.length > 0 ? (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.countries}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="visitors"
                          nameKey="country"
                          label={({ country, percentage }) => `${country}: ${percentage}%`}
                        >
                          {analyticsData.countries.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Tidak ada data negara
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Device Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData?.devices && analyticsData.devices.length > 0 ? (
                  <div className="space-y-4">
                    {analyticsData.devices.map((device, index) => (
                      <div key={device.device} className="flex items-center gap-4">
                        <div className="p-2 bg-secondary rounded-lg">
                          {device.device.toLowerCase() === 'mobile' ? (
                            <Smartphone className="w-5 h-5 text-primary" />
                          ) : device.device.toLowerCase() === 'desktop' ? (
                            <Monitor className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Smartphone className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{device.device}</span>
                            <span className="text-sm text-muted-foreground">
                              {device.visitors.toLocaleString()} ({device.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${device.percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Tidak ada data device
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Sumber Traffic
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.sources && analyticsData.sources.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.sources} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis 
                        type="category" 
                        dataKey="source" 
                        width={100}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Tidak ada data sumber traffic
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Berita Terpopuler
                <Badge variant="secondary" className="ml-2 text-xs">
                  Dari Database
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topArticles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Belum ada data views artikel - Views akan tercatat saat pengunjung membuka artikel
                </p>
              ) : (
                <div className="space-y-3">
                  {topArticles.map((article, index) => (
                    <div 
                      key={article.id}
                      className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      {article.featured_image && (
                        <img 
                          src={article.featured_image} 
                          alt={article.title_id}
                          className="w-16 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {article.title_id}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {article.category}
                        </p>
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

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Halaman Terpopuler
                <Badge variant="secondary" className="ml-2 text-xs">
                  Dari Lovable Analytics
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.topPages && analyticsData.topPages.length > 0 ? (
                <div className="space-y-2">
                  {analyticsData.topPages.map((page, index) => (
                    <div 
                      key={page.path}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-6">
                          {index + 1}
                        </span>
                        <code className="text-sm bg-background px-2 py-1 rounded">
                          {page.path}
                        </code>
                      </div>
                      <span className="text-sm font-medium">
                        {page.pageviews.toLocaleString()} views
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Tidak ada data halaman
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
