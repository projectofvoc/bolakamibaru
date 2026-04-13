import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Eye,
  ExternalLink,
  CheckCircle,
  Clock,
  FileText,
  Star,
  Send,
  RefreshCw,
  AlertCircle,
  ScrollText,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Article {
  id: string;
  slug: string;
  title_id: string;
  title_en: string;
  category: string;
  status: string;
  views: number;
  is_featured: boolean;
  badges: string[];
  published_at: string | null;
  created_at: string;
  author_name: string | null;
  send_status: string | null;
  is_sent: boolean | null;
}

const CMSArticles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  // Fetch featured count for published articles
  const { data: featuredCount = 0 } = useQuery({
    queryKey: ['featured-articles-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true)
        .eq('status', 'published');
      
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['cms-articles', statusFilter, categoryFilter, featuredFilter],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select('id, slug, title_id, title_en, category, status, views, is_featured, badges, published_at, created_at, author_name')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      if (featuredFilter === 'featured') {
        query = query.eq('is_featured', true);
      } else if (featuredFilter === 'not-featured') {
        query = query.eq('is_featured', false);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Article[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-articles'] });
      toast({ title: 'Berita berhasil dihapus' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const filteredArticles = articles.filter(article =>
    article.title_id.toLowerCase().includes(search.toLowerCase()) ||
    article.title_en.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'trending': return 'Trending';
      case 'daily': return 'Update Harian';
      case 'analisa': return 'Analisa';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trending': return 'bg-red-500/20 text-red-400';
      case 'daily': return 'bg-blue-500/20 text-blue-400';
      case 'analisa': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-primary/20 text-primary gap-1"><CheckCircle className="w-3 h-3" />Published</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="gap-1"><FileText className="w-3 h-3" />Draft</Badge>;
      case 'pending':
        return <Badge className="bg-warning/20 text-warning gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Semua Berita</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground">Kelola semua artikel dan berita</p>
            <Badge variant="outline" className="text-amber-400 border-amber-500/50">
              <Star className="w-3 h-3 mr-1 fill-amber-400" />
              {featuredCount}/10 Featured
            </Badge>
          </div>
        </div>
        <Link to="/cms/articles/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Berita
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berita..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="daily">Update Harian</SelectItem>
                <SelectItem value="analisa">Analisa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="not-featured">Non-Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Belum ada berita</p>
              <p className="text-sm">Mulai dengan menambahkan berita pertama</p>
              <Link to="/cms/articles/new">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Berita
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px]">Judul</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">
                            {article.title_id}
                          </p>
                        <div className="flex items-center gap-2 mt-1">
                            {article.is_featured && (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs gap-1">
                                <Star className="w-3 h-3 fill-amber-400" />
                                Featured
                              </Badge>
                            )}
                            {article.badges?.map((badge) => (
                              <Badge key={badge} variant="outline" className="text-xs capitalize">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(article.category)}>
                          {getCategoryLabel(article.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          {article.views || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(article.created_at), 'dd MMM yyyy', { locale: idLocale })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/cms/articles/${article.id}`)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {article.status === 'published' && (
                              <DropdownMenuItem onClick={() => window.open(`/news/${article.slug}`, '_blank')}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Lihat
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => {
                                if (confirm('Yakin ingin menghapus berita ini?')) {
                                  deleteMutation.mutate(article.id);
                                }
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CMSArticles;
