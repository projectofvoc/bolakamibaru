import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, Search, Image as ImageIcon, Calendar, Tag, Link2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OGPreviewData {
  title: string;
  description: string;
  image: string | null;
  url: string;
  publishedAt: string | null;
  category: string;
  slug: string;
}

const CMSOGPreview = () => {
  const [slug, setSlug] = useState('');
  const [previewData, setPreviewData] = useState<OGPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const supabaseUrl = 'https://zmbawgfnrtspgdiqywzc.supabase.co';
  const siteUrl = 'https://bolakami.com';

  const fetchPreview = async () => {
    if (!slug.trim()) {
      setError('Masukkan slug artikel');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      const { data: article, error: dbError } = await supabase
        .from('articles')
        .select('title_id, title_en, excerpt_id, excerpt_en, featured_image, slug, category, published_at, status')
        .eq('slug', slug.trim())
        .maybeSingle();

      if (dbError) throw dbError;

      if (!article) {
        setError(`Artikel dengan slug "${slug}" tidak ditemukan`);
        return;
      }

      if (article.status !== 'published') {
        setError(`Artikel ditemukan tapi belum dipublish (status: ${article.status})`);
        return;
      }

      setPreviewData({
        title: article.title_id || article.title_en,
        description: (article.excerpt_id || article.excerpt_en || '').substring(0, 200),
        image: article.featured_image,
        url: `${siteUrl}/news/${article.slug}`,
        publishedAt: article.published_at,
        category: article.category,
        slug: article.slug,
      });
    } catch (err: any) {
      console.error('Error fetching article:', err);
      setError('Terjadi kesalahan saat mengambil data artikel');
    } finally {
      setIsLoading(false);
    }
  };

  const getShareUrl = () => {
    if (!previewData) return '';
    return `${supabaseUrl}/functions/v1/og-metadata?slug=${previewData.slug}`;
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: 'Berhasil disalin!',
      description: 'URL telah disalin ke clipboard',
    });
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const getDebuggerUrls = () => {
    const shareUrl = getShareUrl();
    return {
      facebook: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(shareUrl)}`,
      twitter: 'https://cards-dev.twitter.com/validator',
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">OG Metadata Preview</h1>
        <p className="text-muted-foreground mt-1">
          Preview dan validasi Open Graph metadata untuk artikel sebelum dibagikan ke sosial media
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cari Artikel</CardTitle>
          <CardDescription>Masukkan slug artikel untuk melihat preview OG metadata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="contoh: arema-fc-kalahkan-bali-united"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPreview()}
              className="flex-1"
            />
            <Button onClick={fetchPreview} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Mencari...' : 'Preview'}
            </Button>
          </div>
          {error && (
            <p className="text-destructive text-sm mt-3">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Preview Result */}
      {previewData && (
        <>
          {/* Social Media Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Preview Social Media Card
              </CardTitle>
              <CardDescription>Tampilan saat link dibagikan di Facebook, Twitter, WhatsApp, dll.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden max-w-lg bg-card shadow-sm">
                {previewData.image ? (
                  <div className="aspect-[1200/630] bg-muted relative">
                    <img
                      src={previewData.image}
                      alt={previewData.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-[1200/630] bg-muted flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    bolakami.com
                  </p>
                  <h3 className="font-semibold text-foreground line-clamp-2">{previewData.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{previewData.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OG Meta Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">OG Meta Tags</CardTitle>
              <CardDescription>Data yang akan digunakan oleh social media crawlers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">og:title</label>
                  <p className="text-foreground">{previewData.title} | BOLAKAMI</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">og:type</label>
                  <p className="text-foreground">article</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">og:description</label>
                  <p className="text-foreground">{previewData.description || '(tidak ada)'}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Link2 className="w-4 h-4" /> og:url (canonical)
                  </label>
                  <p className="text-foreground text-sm break-all">{previewData.url}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> og:image
                  </label>
                  <p className="text-foreground text-sm break-all">{previewData.image || '(tidak ada)'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">og:image dimensions</label>
                  <p className="text-foreground">1200 x 630</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4" /> category
                  </label>
                  <Badge variant="secondary">{previewData.category}</Badge>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> published_at
                  </label>
                  <p className="text-foreground">
                    {previewData.publishedAt 
                      ? new Date(previewData.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '(tidak ada)'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share URL untuk Crawler</CardTitle>
              <CardDescription>
                URL ini akan digunakan saat membagikan artikel agar OG tags terbaca oleh crawler.
                Browser akan auto-redirect ke halaman SPA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input value={getShareUrl()} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(getShareUrl())}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => openInNewTab(getShareUrl())}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Debugger Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test dengan Debugger Tools</CardTitle>
              <CardDescription>
                Gunakan tools resmi dari platform untuk memvalidasi OG tags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => openInNewTab(getDebuggerUrls().facebook)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Facebook Debugger
                </Button>
                <Button variant="outline" onClick={() => openInNewTab(getDebuggerUrls().linkedin)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  LinkedIn Inspector
                </Button>
                <Button variant="outline" onClick={() => openInNewTab(getDebuggerUrls().twitter)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Twitter Card Validator
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Catatan: Facebook Debugger dan LinkedIn Inspector otomatis menggunakan share URL. 
                Untuk Twitter, paste share URL secara manual di validator.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CMSOGPreview;
