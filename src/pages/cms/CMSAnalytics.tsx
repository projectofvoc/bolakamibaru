import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  FileText,
  BarChart3,
  Newspaper,
  Link2Off,
} from 'lucide-react';

const CMSAnalytics: React.FC = () => {
  // Article publish counts (internal DB)
  const { data: articleStats } = useQuery({
    queryKey: ['cms-article-publish-stats'],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
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
        articlesPublished30d: r30.count ?? 0,
        articlesPublished7d: r7.count ?? 0,
      };
    },
    refetchInterval: 60_000,
  });

  // Top articles from DB
  const { data: topArticles = [] } = useQuery({
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Analytics
          <Badge variant="outline" className="ml-2 text-xs">Setup pending</Badge>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sedang migrasi ke Google Analytics 4 — menunggu kredensial OAuth
        </p>
      </div>

      {/* Setup notice */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
            <Link2Off className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Belum terhubung ke Google Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Integrasi Histats sudah dihentikan. Sedang menunggu Anda menyelesaikan setup OAuth Client di Google Cloud Console
              dan mengirimkan <strong>Client ID</strong> &amp; <strong>Client Secret</strong>. Setelah itu, dashboard akan menampilkan
              data pengunjung, pageviews, sumber traffic, dan top pages langsung dari GA4.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Sementara ini, statistik internal (jumlah artikel published &amp; views per artikel) tetap tersedia di bawah.
            </p>
          </div>
        </CardContent>
      </Card>

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
                  {articleStats?.articlesPublished30d?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground">Berita Dipublish 30 Hari Terakhir</p>
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
                  {articleStats?.articlesPublished7d?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground">Berita Dipublish 7 Hari Terakhir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <p className="text-muted-foreground text-center py-8">Belum ada data views artikel</p>
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
    </div>
  );
};

export default CMSAnalytics;