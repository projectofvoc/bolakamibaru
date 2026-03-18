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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  ArrowLeft, 
  X, 
  Image as ImageIcon,
  Eye,
  Sparkles,
  Languages,
  Plus,
  Target,
  Code,
  FileText
} from 'lucide-react';
import { 
  generatePredictionTemplate, 
  generatePredictionTitle, 
  generatePredictionExcerpt,
  type PredictionTemplateData 
} from '@/lib/predictionTemplate';
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
    category: 'Trending',
    league: '',
    club: '',
    author_name: '',
    publisher_name: 'Bolakami',
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
  const [isTranslating, setIsTranslating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Modal states
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddLeague, setShowAddLeague] = useState(false);
  const [showAddClub, setShowAddClub] = useState(false);
  const [showAddBadge, setShowAddBadge] = useState(false);
  const [showPredictionTemplate, setShowPredictionTemplate] = useState(false);

  // New item states
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [newLeague, setNewLeague] = useState({ name: '', country: '' });
  const [newClub, setNewClub] = useState({ name: '', league_id: '' });
  const [newBadge, setNewBadge] = useState({ name: '', icon: '' });
  const [predictionData, setPredictionData] = useState<PredictionTemplateData>({
    homeTeam: '',
    awayTeam: '',
    competition: '',
    matchday: '',
    venue: '',
    kickoffDate: '',
    kickoffTime: '',
  });

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

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data;
    },
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

  // Fetch clubs
  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch badges
  const { data: badgesList = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch featured count for validation (max 10)
  const { data: featuredCount = 0 } = useQuery({
    queryKey: ['featured-count-validation'],
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

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string }) => {
      const { error } = await supabase.from('categories').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowAddCategory(false);
      setNewCategory({ name: '', icon: '' });
      toast({ title: 'Kategori berhasil ditambahkan!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Add league mutation
  const addLeagueMutation = useMutation({
    mutationFn: async (data: { name: string; country: string }) => {
      const { error } = await supabase.from('leagues').insert({
        name: data.name,
        name_en: data.name,
        country: data.country || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      setShowAddLeague(false);
      setNewLeague({ name: '', country: '' });
      toast({ title: 'Liga berhasil ditambahkan!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Add club mutation
  const addClubMutation = useMutation({
    mutationFn: async (data: { name: string; league_id: string }) => {
      const { error } = await supabase.from('clubs').insert({
        name: data.name,
        league_id: data.league_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      setShowAddClub(false);
      setNewClub({ name: '', league_id: '' });
      toast({ title: 'Klub berhasil ditambahkan!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Add badge mutation
  const addBadgeMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string }) => {
      const { error } = await supabase.from('badges').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      setShowAddBadge(false);
      setNewBadge({ name: '', icon: '' });
      toast({ title: 'Badge berhasil ditambahkan!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
        category: article.category || 'Trending',
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

  // Convert image to JPEG for better social media compatibility (Telegram, Facebook, etc.)
  const convertToJpeg = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Fill with white background (for images with transparency)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const jpegFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
                type: 'image/jpeg',
              });
              resolve(jpegFile);
            } else {
              reject(new Error('Could not convert to JPEG'));
            }
          },
          'image/jpeg',
          0.9 // Quality 90%
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return form.featured_image;

    try {
      // Convert to JPEG for social media compatibility
      const jpegFile = await convertToJpeg(imageFile);
      const fileName = `articles/${Date.now()}.jpg`;
      
      const { error } = await supabase.storage
        .from('articles-media')
        .upload(fileName, jpegFile, {
          contentType: 'image/jpeg'
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('articles-media')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (conversionError) {
      // Fallback: upload original file if conversion fails
      console.warn('JPEG conversion failed, uploading original:', conversionError);
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
    }
  };

  const translateArticle = async (): Promise<{ title_en: string; excerpt_en: string; content_en: string }> => {
    const { data, error } = await supabase.functions.invoke('translate-article', {
      body: {
        title_id: form.title_id,
        excerpt_id: form.excerpt_id || null,
        content_id: form.content_id,
      }
    });

    if (error) {
      throw new Error(error.message || 'Gagal menerjemahkan artikel');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return {
      title_en: data.title_en || form.title_id,
      excerpt_en: data.excerpt_en || form.excerpt_id || '',
      content_en: data.content_en || form.content_id,
    };
  };

  const handleSubmit = async (status?: string) => {
    // Only validate Indonesian fields now
    if (!form.title_id || !form.content_id) {
      toast({ title: 'Error', description: 'Judul dan konten wajib diisi', variant: 'destructive' });
      return;
    }

    // Validate max 10 featured articles when publishing as featured
    if (form.is_featured && status === 'published') {
      const isAlreadyFeatured = isEditing && article?.is_featured && article?.status === 'published';
      const maxFeatured = 10;
      
      if (!isAlreadyFeatured && featuredCount >= maxFeatured) {
        toast({ 
          title: 'Batas Featured Tercapai', 
          description: `Maksimal ${maxFeatured} artikel yang dapat di-featured. Hapus featured dari artikel lain terlebih dahulu.`, 
          variant: 'destructive' 
        });
        return;
      }
    }

    setIsUploading(true);

    try {
      let imageUrl = form.featured_image;
      let finalForm = { ...form };
      
      // Upload image if new
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // Auto-translate if publishing
      if (status === 'published') {
        setIsTranslating(true);
        toast({ title: 'Menerjemahkan...', description: 'AI sedang menerjemahkan artikel ke Bahasa Inggris' });
        
        try {
          const translated = await translateArticle();
          finalForm = {
            ...finalForm,
            title_en: translated.title_en,
            excerpt_en: translated.excerpt_en,
            content_en: translated.content_en,
          };
          
          // Update local form state too
          setForm(prev => ({
            ...prev,
            title_en: translated.title_en,
            excerpt_en: translated.excerpt_en,
            content_en: translated.content_en,
          }));
        } catch (translateError: any) {
          setIsTranslating(false);
          toast({ 
            title: 'Gagal menerjemahkan', 
            description: translateError.message || 'Silakan coba lagi', 
            variant: 'destructive' 
          });
          setIsUploading(false);
          return;
        }
        setIsTranslating(false);
      } else {
        // For drafts, use title_id as fallback for title_en if empty
        if (!finalForm.title_en) {
          finalForm.title_en = finalForm.title_id;
        }
        if (!finalForm.content_en) {
          finalForm.content_en = finalForm.content_id;
        }
      }

      await saveMutation.mutateAsync({
        ...finalForm,
        featured_image: imageUrl,
        status: status || form.status,
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      setIsTranslating(false);
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

  const handleInsertPredictionTemplate = () => {
    if (!predictionData.homeTeam || !predictionData.awayTeam || !predictionData.competition || !predictionData.venue) {
      toast({ title: 'Error', description: 'Harap isi Tim, Kompetisi, dan Venue', variant: 'destructive' });
      return;
    }
    
    const templateContent = generatePredictionTemplate(predictionData);
    const autoTitle = generatePredictionTitle(predictionData.homeTeam, predictionData.awayTeam, predictionData.kickoffDate);
    const autoExcerpt = generatePredictionExcerpt(predictionData.homeTeam, predictionData.awayTeam, predictionData.competition, predictionData.venue);
    
    setForm(prev => ({ 
      ...prev, 
      title_id: autoTitle,
      excerpt_id: autoExcerpt,
      content_id: templateContent,
    }));
    
    setShowPredictionTemplate(false);
    setPredictionData({
      homeTeam: '',
      awayTeam: '',
      competition: '',
      matchday: '',
      venue: '',
      kickoffDate: '',
      kickoffTime: '',
    });
    toast({ title: 'Template berhasil diterapkan!', description: 'Edit placeholder [...] dengan data aktual' });
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
            disabled={isUploading || isTranslating || saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Simpan Draft
          </Button>
          <Button 
            onClick={() => handleSubmit('published')}
            disabled={isUploading || isTranslating || saveMutation.isPending}
            className="gap-2"
          >
            {isTranslating ? (
              <>
                <Languages className="w-4 h-4 animate-pulse" />
                Menerjemahkan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Main Content - Konten Artikel */}
        <div className="space-y-6">
          {/* Indonesian Content Only */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🇮🇩 Konten Artikel
              </CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Tulis dalam Bahasa Indonesia. Konten akan otomatis diterjemahkan ke Bahasa Inggris saat di-publish.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              {/* Prediction Template Button - Only show for Prediksi category */}
              {form.category === 'Prediksi' && (
                <div className="flex justify-start">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowPredictionTemplate(true)}
                    className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Target className="w-4 h-4" />
                    Gunakan Template Prediksi
                  </Button>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Konten *</Label>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setEditorMode('visual')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                        editorMode === 'visual'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Visual
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('html')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                        editorMode === 'html'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      HTML
                    </button>
                  </div>
                </div>
                {editorMode === 'visual' ? (
                  <RichTextEditor
                    content={form.content_id}
                    onChange={(content) => setForm(prev => ({ ...prev, content_id: content }))}
                    placeholder="Tulis konten berita dalam Bahasa Indonesia..."
                  />
                ) : (
                  <Textarea
                    value={form.content_id}
                    onChange={(e) => setForm(prev => ({ ...prev, content_id: e.target.value }))}
                    placeholder="<p>Tulis HTML di sini...</p>"
                    className="font-mono text-xs min-h-[400px] bg-muted/30 border-border resize-y leading-relaxed"
                    spellCheck={false}
                  />
                )}
              </div>
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
              {/* Category */}
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={form.category} 
                    onValueChange={(v) => setForm(prev => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowAddCategory(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* League */}
              <div className="space-y-2">
                <Label>Liga</Label>
                <div className="flex gap-2">
                  <Select 
                    value={form.league || 'none'} 
                    onValueChange={(v) => setForm(prev => ({ ...prev, league: v === 'none' ? '' : v }))}
                  >
                    <SelectTrigger className="flex-1">
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowAddLeague(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Club */}
              <div className="space-y-2">
                <Label>Klub</Label>
                <div className="flex gap-2">
                  <Select 
                    value={form.club || 'none'} 
                    onValueChange={(v) => setForm(prev => ({ ...prev, club: v === 'none' ? '' : v }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Pilih klub" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada</SelectItem>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.name}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowAddClub(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
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
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Badges
                </span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddBadge(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {badgesList.map((badge) => (
                  <Button
                    key={badge.id}
                    type="button"
                    variant={form.badges.includes(badge.name) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleBadge(badge.name)}
                  >
                    {badge.icon} {badge.name}
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
          title_en: form.title_en || form.title_id,
          excerpt_id: form.excerpt_id,
          excerpt_en: form.excerpt_en || form.excerpt_id,
          content_id: form.content_id,
          content_en: form.content_en || form.content_id,
          featured_image: imagePreview || form.featured_image,
          category: form.category,
          author_name: form.author_name,
          tags: form.tags,
          badges: form.badges,
        }}
      />

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Kategori Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Transfer Market"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon (Emoji)</Label>
              <Input
                value={newCategory.icon}
                onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="Contoh: 💰"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                Batal
              </Button>
              <Button 
                onClick={() => addCategoryMutation.mutate(newCategory)}
                disabled={!newCategory.name || addCategoryMutation.isPending}
              >
                {addCategoryMutation.isPending ? 'Menyimpan...' : 'Tambah'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add League Dialog */}
      <Dialog open={showAddLeague} onOpenChange={setShowAddLeague}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Liga Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Liga</Label>
              <Input
                value={newLeague.name}
                onChange={(e) => setNewLeague(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Eredivisie"
              />
            </div>
            <div className="space-y-2">
              <Label>Negara</Label>
              <Input
                value={newLeague.country}
                onChange={(e) => setNewLeague(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Contoh: Belanda"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddLeague(false)}>
                Batal
              </Button>
              <Button 
                onClick={() => addLeagueMutation.mutate(newLeague)}
                disabled={!newLeague.name || addLeagueMutation.isPending}
              >
                {addLeagueMutation.isPending ? 'Menyimpan...' : 'Tambah'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Club Dialog */}
      <Dialog open={showAddClub} onOpenChange={setShowAddClub}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Klub Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Klub</Label>
              <Input
                value={newClub.name}
                onChange={(e) => setNewClub(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Manchester United"
              />
            </div>
            <div className="space-y-2">
              <Label>Liga (Opsional)</Label>
              <Select 
                value={newClub.league_id || 'none'} 
                onValueChange={(v) => setNewClub(prev => ({ ...prev, league_id: v === 'none' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih liga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada</SelectItem>
                  {leagues.map((league) => (
                    <SelectItem key={league.id} value={league.id}>
                      {league.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddClub(false)}>
                Batal
              </Button>
              <Button 
                onClick={() => addClubMutation.mutate(newClub)}
                disabled={!newClub.name || addClubMutation.isPending}
              >
                {addClubMutation.isPending ? 'Menyimpan...' : 'Tambah'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Badge Dialog */}
      <Dialog open={showAddBadge} onOpenChange={setShowAddBadge}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Badge Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Badge</Label>
              <Input
                value={newBadge.name}
                onChange={(e) => setNewBadge(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Breaking"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon (Emoji)</Label>
              <Input
                value={newBadge.icon}
                onChange={(e) => setNewBadge(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="Contoh: 🚨"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddBadge(false)}>
                Batal
              </Button>
              <Button 
                onClick={() => addBadgeMutation.mutate(newBadge)}
                disabled={!newBadge.name || addBadgeMutation.isPending}
              >
                {addBadgeMutation.isPending ? 'Menyimpan...' : 'Tambah'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prediction Template Dialog */}
      <Dialog open={showPredictionTemplate} onOpenChange={setShowPredictionTemplate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Template Prediksi Pertandingan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tim Tuan Rumah *</Label>
                <Input
                  value={predictionData.homeTeam}
                  onChange={(e) => setPredictionData(prev => ({ ...prev, homeTeam: e.target.value }))}
                  placeholder="Manchester United"
                />
              </div>
              <div className="space-y-2">
                <Label>Tim Tamu *</Label>
                <Input
                  value={predictionData.awayTeam}
                  onChange={(e) => setPredictionData(prev => ({ ...prev, awayTeam: e.target.value }))}
                  placeholder="Chelsea"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kompetisi/Liga *</Label>
                <Input
                  value={predictionData.competition}
                  onChange={(e) => setPredictionData(prev => ({ ...prev, competition: e.target.value }))}
                  placeholder="Premier League"
                />
              </div>
              <div className="space-y-2">
                <Label>Pekan ke-</Label>
                <Input
                  value={predictionData.matchday}
                  onChange={(e) => setPredictionData(prev => ({ ...prev, matchday: e.target.value }))}
                  placeholder="Pekan ke-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Stadion/Venue *</Label>
              <Input
                value={predictionData.venue}
                onChange={(e) => setPredictionData(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Old Trafford, Manchester"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Pertandingan</Label>
                <Input
                  value={predictionData.kickoffDate}
                  onChange={(e) => setPredictionData(prev => ({ ...prev, kickoffDate: e.target.value }))}
                  placeholder="Sabtu, 20 September 2025"
                />
              </div>
              <div className="space-y-2">
                <Label>Waktu Kick-off</Label>
                <Input
                  value={predictionData.kickoffTime}
                  onChange={(e) => setPredictionData(prev => ({ ...prev, kickoffTime: e.target.value }))}
                  placeholder="23:30"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowPredictionTemplate(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleInsertPredictionTemplate}
                disabled={!predictionData.homeTeam || !predictionData.awayTeam || !predictionData.competition || !predictionData.venue}
                className="gap-2"
              >
                <Target className="w-4 h-4" />
                Terapkan Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CMSArticleEditor;
