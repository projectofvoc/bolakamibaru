import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Eye, Video, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import DomainAnalyticsCard from '@/components/cms/DomainAnalyticsCard';

const CMSDashboard = () => {
  // Fetch articles stats
  const { data: articlesStats } = useQuery({
    queryKey: ['cms-articles-stats'],
    queryFn: async () => {
      const [totalRes, publishedRes, draftsRes, pendingRes, viewsRes, recentRes] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.rpc('get_total_article_views'),
        supabase
          .from('articles')
          .select('id, status, views, published_at, title_id, slug, category')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (totalRes.error) throw totalRes.error;
      if (recentRes.error) throw recentRes.error;

      return {
        total: totalRes.count || 0,
        published: publishedRes.count || 0,
        drafts: draftsRes.count || 0,
        pending: pendingRes.count || 0,
        totalViews: Number(viewsRes.data) || 0,
        recent: recentRes.data || [],
      };
    },
  });

  // Fetch moments stats
  const { data: momentsStats } = useQuery({
    queryKey: ['cms-moments-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('best_moments')
        .select('id, is_active');
      
      if (error) throw error;
      
      const active = data?.filter(m => m.is_active) || [];
      return {
        total: data?.length || 0,
        active: active.length,
      };
    },
  });

  const stats = [
    {
      title: 'Total Berita',
      value: articlesStats?.total || 0,
      icon: FileText,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Published',
      value: articlesStats?.published || 0,
      icon: CheckCircle,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Total Views',
      value: articlesStats?.totalViews || 0,
      icon: Eye,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Momen Aktif',
      value: momentsStats?.active || 0,
      icon: Video,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
  ];

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'trending': return 'Trending';
      case 'daily': return 'Update Harian';
      case 'analisa': return 'Analisa';
      default: return category;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-primary/20 text-primary">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'pending':
        return <Badge className="bg-warning/20 text-warning">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang di CMS BolaKami</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Domain Analytics Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Ringkasan Pengunjung</h2>
            <p className="text-xs text-muted-foreground">Data GA4 — 7 hari terakhir</p>
          </div>
          <Link to="/cms/analytics">
            <Button variant="ghost" size="sm">Lihat detail →</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DomainAnalyticsCard domain="news" />
          <DomainAnalyticsCard domain="com" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Berita Terbaru</CardTitle>
            <Link to="/cms/articles">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {articlesStats?.recent && articlesStats.recent.length > 0 ? (
              <div className="space-y-3">
                {articlesStats.recent.map((article: any) => (
                  <Link 
                    key={article.id} 
                    to={`/cms/articles/${article.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {article.title_id}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {getCategoryLabel(article.category)}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views || 0}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(article.status)}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Belum ada berita</p>
                <Link to="/cms/articles/new">
                  <Button variant="link" className="mt-2">Tambah berita pertama</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ringkasan Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Published</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {articlesStats?.published || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">Draft</span>
                </div>
                <span className="text-2xl font-bold text-muted-foreground">
                  {articlesStats?.drafts || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <TrendingUp className="w-5 h-5 text-warning" />
                  </div>
                  <span className="text-sm font-medium">Pending Review</span>
                </div>
                <span className="text-2xl font-bold text-warning">
                  {articlesStats?.pending || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Video className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-sm font-medium">Momen Aktif</span>
                </div>
                <span className="text-2xl font-bold text-orange-500">
                  {momentsStats?.active || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CMSDashboard;
