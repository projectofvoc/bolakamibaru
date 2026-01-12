import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  ArrowLeft, 
  X, 
  Image as ImageIcon,
  Eye,
  Send,
  Sparkles
} from 'lucide-react';
import RichTextEditor from '@/components/cms/RichTextEditor';
import ArticlePreview from '@/components/cms/ArticlePreview';

interface ArticleForm {
  slug: string;
  title_id: string;
  title_en: string;
  excerpt_id: string;
  excerpt_en: string;
  content_id: string;
  content_en: string;
  featured_image: string;
  category: string;
  league: string;
  club: string;
  author_name: string;
  publisher_name: string;
  publisher_icon: string;
  publisher_verified: boolean;
  tags: string[];
  badges: string[];
  status: string;
  is_featured: boolean;
}

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Helper function to ensure content has proper HTML structure
const ensureHtmlContent = (content: string): string => {
  if (!content) return '';
  
  // If content already has HTML tags, return as-is
  if (content.includes('<p>') || content.includes('<h1>') || content.includes('<h2>') || 
      content.includes('<h3>') || content.includes('<ul>') || content.includes('<ol>') ||
      content.includes('<blockquote>')) {
    return content;
  }
  
  // Wrap plain text in paragraphs, split by double newlines
  return content
    .split(/\n\n+/)
    .filter(p => p.trim())
    .map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
    .join('');
};

const CMSArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id && id !== 'new';

  const [form, setForm] = useState<ArticleForm>({
    slug: '',
    title_id: '',
    title_en: '',
    excerpt_id: '',
    excerpt_en: '',
    content_id: '',
    content_en: '',
    featured_image: '',
    category: 'daily',
    league: '',
    club: '',
    author_name: '',
    publisher_name: '',
    publisher_icon: '',
    publisher_verified: false,
    tags: [],
    badges: [],
    status: 'draft',
    is_featured: false,
  });

  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch article if editing
  const { data: article, isLoading } = useQuery({
    queryKey: ['cms-article', id],
    queryFn: async () => {
      if (!isEditing) return null;
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  // Fetch leagues
  const { data: leagues = [] } = useQuery({
    queryKey: ['leagues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leagues')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data;
    },
  });

  // Populate form when article is loaded
  useEffect(() => {
    if (article) {
      setForm({
        slug: article.slug || '',
        title_id: article.title_id || '',
        title_en: article.title_en || '',
        excerpt_id: article.excerpt_id || '',
        excerpt_en: article.excerpt_en || '',
        content_id: ensureHtmlContent(article.content_id || ''),
        content_en: ensureHtmlContent(article.content_en || ''),
        featured_image: article.featured_image || '',
        category: article.category || 'daily',
        league: article.league || '',
        club: article.club || '',
        author_name: article.author_name || '',
        publisher_name: article.publisher_name || '',
        publisher_icon: article.publisher_icon || '',
        publisher_verified: article.publisher_verified || false,
        tags: article.tags || [],
        badges: article.badges || [],
        status: article.status || 'draft',
        is_featured: article.is_featured || false,
      });
      if (article.featured_image) {
        setImagePreview(article.featured_image);
      }
    }
  }, [article]);

  // Auto-generate slug from Indonesian title
  useEffect(() => {
    if (!isEditing && form.title_id) {
      setForm(prev => ({ ...prev, slug: generateSlug(form.title_id) }));
    }
  }, [form.title_id, isEditing]);

  const saveMutation = useMutation({
    mutationFn: async (data: ArticleForm & { id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const articleData = {
        slug: data.slug,
        title_id: data.title_id,
        title_en: data.title_en,
        excerpt_id: data.excerpt_id || null,
        excerpt_en: data.excerpt_en || null,
        content_id: data.content_id,
        content_en: data.content_en,
        featured_image: data.featured_image || null,
        category: data.category,
        league: data.league || null,
        club: data.club || null,
        author_id: user?.id,
        author_name: data.author_name || user?.email?.split('@')[0] || null,
        publisher_name: data.publisher_name || null,
        publisher_icon: data.publisher_icon || null,
        publisher_verified: data.publisher_verified,
        tags: data.tags,
        badges: data.badges,
        status: data.status,
        is_featured: data.is_featured,
        published_at: data.status === 'published' ? new Date().toISOString() : null,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert(articleData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-articles'] });
      toast({ title: isEditing ? 'Berita diperbarui!' : 'Berita ditambahkan!' });
      navigate('/cms/articles');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return form.featured_image;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `articles/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('articles-media')
      .upload(fileName, imageFile);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('articles-media')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleSubmit = async (status?: string) => {
    if (!form.title_id || !form.title_en || !form.content_id || !form.content_en) {
      toast({ title: 'Error', description: 'Judul dan konten wajib diisi (Indonesia & English)', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = form.featured_image;
      
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      await saveMutation.mutateAsync({
        ...form,
        featured_image: imageUrl,
        status: status || form.status,
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const toggleBadge = (badge: string) => {
    setForm(prev => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/cms/articles')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? 'Edit Berita' : 'Tambah Berita Baru'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Perbarui konten berita' : 'Buat artikel atau berita baru'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(true)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSubmit('draft')}
            disabled={isUploading || saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Simpan Draft
          </Button>
          <Button 
            onClick={() => handleSubmit('published')}
            disabled={isUploading || saveMutation.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Main Content - Konten Artikel */}
        <div className="space-y-6">
          {/* Bilingual Content */}
          <Card>
            <CardHeader>
              <CardTitle>Konten Artikel</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="id" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="id">🇮🇩 Indonesia</TabsTrigger>
                  <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                </TabsList>

                <TabsContent value="id" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_id">Judul *</Label>
                    <Input
                      id="title_id"
                      value={form.title_id}
                      onChange={(e) => setForm(prev => ({ ...prev, title_id: e.target.value }))}
                      placeholder="Masukkan judul berita"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt_id">Ringkasan</Label>
                    <Textarea
                      id="excerpt_id"
                      value={form.excerpt_id}
                      onChange={(e) => setForm(prev => ({ ...prev, excerpt_id: e.target.value }))}
                      placeholder="Ringkasan singkat berita..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Konten *</Label>
                    <RichTextEditor
                      content={form.content_id}
                      onChange={(content) => setForm(prev => ({ ...prev, content_id: content }))}
                      placeholder="Tulis konten berita dalam Bahasa Indonesia..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="en" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_en">Title *</Label>
                    <Input
                      id="title_en"
                      value={form.title_en}
                      onChange={(e) => setForm(prev => ({ ...prev, title_en: e.target.value }))}
                      placeholder="Enter news title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt_en">Excerpt</Label>
                    <Textarea
                      id="excerpt_en"
                      value={form.excerpt_en}
                      onChange={(e) => setForm(prev => ({ ...prev, excerpt_en: e.target.value }))}
                      placeholder="Brief summary of the news..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content *</Label>
                    <RichTextEditor
                      content={form.content_en}
                      onChange={(content) => setForm(prev => ({ ...prev, content_en: content }))}
                      placeholder="Write full news content in English..."
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Slug */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/news/</span>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gambar Utama</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(''); setForm(prev => ({ ...prev, featured_image: '' })); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-4">
                    <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Klik untuk upload gambar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category & Meta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kategori & Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select 
                  value={form.category} 
                  onValueChange={(v) => setForm(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">🔥 Trending</SelectItem>
                    <SelectItem value="daily">📰 Update Harian</SelectItem>
                    <SelectItem value="analisa">📊 Analisa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Liga</Label>
                <Select 
                  value={form.league || 'none'} 
                  onValueChange={(v) => setForm(prev => ({ ...prev, league: v === 'none' ? '' : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih liga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {leagues.map((league) => (
                      <SelectItem key={league.id} value={league.name}>
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="club">Klub</Label>
                <Input
                  id="club"
                  value={form.club}
                  onChange={(e) => setForm(prev => ({ ...prev, club: e.target.value }))}
                  placeholder="Nama klub terkait"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author_name">Nama Penulis</Label>
                <Input
                  id="author_name"
                  value={form.author_name}
                  onChange={(e) => setForm(prev => ({ ...prev, author_name: e.target.value }))}
                  placeholder="Nama penulis"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Tambah tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="secondary" onClick={addTag}>+</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {['new', 'viral', 'popular', 'trending'].map((badge) => (
                  <Button
                    key={badge}
                    type="button"
                    variant={form.badges.includes(badge) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleBadge(badge)}
                    className="capitalize"
                  >
                    {badge === 'new' && '🆕'}
                    {badge === 'viral' && '🔥'}
                    {badge === 'popular' && '⭐'}
                    {badge === 'trending' && '📈'}
                    {' '}{badge}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Badge "NEW" akan otomatis dihapus setelah 7 hari
              </p>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured di Hero</Label>
                <Switch
                  id="featured"
                  checked={form.is_featured}
                  onCheckedChange={(v) => setForm(prev => ({ ...prev, is_featured: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={form.status} 
                  onValueChange={(v) => setForm(prev => ({ ...prev, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">📝 Draft</SelectItem>
                    <SelectItem value="pending">⏳ Pending Review</SelectItem>
                    <SelectItem value="published">✅ Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Article Preview Modal */}
      <ArticlePreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        article={{
          title_id: form.title_id,
          title_en: form.title_en,
          excerpt_id: form.excerpt_id,
          excerpt_en: form.excerpt_en,
          content_id: form.content_id,
          content_en: form.content_en,
          featured_image: imagePreview || form.featured_image,
          category: form.category,
          author_name: form.author_name,
          tags: form.tags,
          badges: form.badges,
        }}
      />
    </div>
  );
};

export default CMSArticleEditor;
