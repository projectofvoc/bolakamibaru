import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Calendar
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
  Legend
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

const CMSAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  const getDays = () => {
    switch (dateRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  };

  // Fetch analytics data (simulated - in production this would come from a real analytics service)
  const { data: analyticsData, isLoading: analyticsLoading, refetch } = useQuery({
    queryKey: ['cms-analytics', dateRange],
    queryFn: async (): Promise<AnalyticsData> => {
      // Generate sample data based on date range
      const days = getDays();
      const visitorsPerDay = Array.from({ length: days }, (_, i) => ({
        date: format(subDays(new Date(), days - 1 - i), 'dd MMM', { locale: localeID }),
        visitors: Math.floor(Math.random() * 50) + 10
      }));

      const totalVisitors = visitorsPerDay.reduce((sum, day) => sum + day.visitors, 0);
      
      return {
        visitors: totalVisitors,
        pageviews: Math.floor(totalVisitors * 4.5),
        pageviewsPerVisit: 4.5,
        sessionDuration: 186, // seconds
        bounceRate: 36,
        visitorsPerDay,
        topPages: [
          { path: '/', pageviews: Math.floor(totalVisitors * 0.4) },
          { path: '/berita/trending', pageviews: Math.floor(totalVisitors * 0.2) },
          { path: '/liga/premier-league', pageviews: Math.floor(totalVisitors * 0.15) },
          { path: '/prediksi-ai', pageviews: Math.floor(totalVisitors * 0.1) },
          { path: '/live', pageviews: Math.floor(totalVisitors * 0.08) },
        ],
        countries: [
          { country: 'Indonesia', visitors: Math.floor(totalVisitors * 0.65), percentage: 65 },
          { country: 'Malaysia', visitors: Math.floor(totalVisitors * 0.15), percentage: 15 },
          { country: 'Singapore', visitors: Math.floor(totalVisitors * 0.1), percentage: 10 },
          { country: 'Thailand', visitors: Math.floor(totalVisitors * 0.05), percentage: 5 },
          { country: 'Lainnya', visitors: Math.floor(totalVisitors * 0.05), percentage: 5 },
        ],
        devices: [
          { device: 'Mobile', visitors: Math.floor(totalVisitors * 0.68), percentage: 68 },
          { device: 'Desktop', visitors: Math.floor(totalVisitors * 0.28), percentage: 28 },
          { device: 'Tablet', visitors: Math.floor(totalVisitors * 0.04), percentage: 4 },
        ],
        sources: [
          { source: 'Direct', visitors: Math.floor(totalVisitors * 0.4) },
          { source: 'Google', visitors: Math.floor(totalVisitors * 0.3) },
          { source: 'Social Media', visitors: Math.floor(totalVisitors * 0.2) },
          { source: 'Referral', visitors: Math.floor(totalVisitors * 0.1) },
        ]
      };
    },
  });

  // Fetch top articles by views
  const { data: topArticles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['top-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title_id, title_en, featured_image, views, category, slug')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLoading = analyticsLoading || articlesLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Statistik pengunjung dan performa website Bolakami
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
          
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
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
                      {analyticsData?.visitors.toLocaleString()}
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
                      {analyticsData?.pageviews.toLocaleString()}
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
                      {analyticsData?.pageviewsPerVisit.toFixed(1)}
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
                      {analyticsData?.bounceRate}%
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData?.visitorsPerDay}>
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
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData?.countries}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="visitors"
                        nameKey="country"
                        label={({ country, percentage }) => `${country}: ${percentage}%`}
                      >
                        {analyticsData?.countries.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
                <div className="space-y-4">
                  {analyticsData?.devices.map((device, index) => (
                    <div key={device.device} className="flex items-center gap-4">
                      <div className="p-2 bg-secondary rounded-lg">
                        {device.device === 'Mobile' ? (
                          <Smartphone className="w-5 h-5 text-primary" />
                        ) : device.device === 'Desktop' ? (
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
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.sources} layout="vertical">
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
            </CardContent>
          </Card>

          {/* Top Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Berita Terpopuler
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsData?.topPages.map((page, index) => (
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CMSAnalytics;