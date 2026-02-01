import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Image as ImageIcon, 
  Upload,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

interface FooterBanner {
  id: string;
  title: string;
  position: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const CMSFooterBanners = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<FooterBanner | null>(null);
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState<'left' | 'right'>('left');
  const [linkUrl, setLinkUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all footer banners
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['cms-footer-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('footer_banners')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      return data as FooterBanner[];
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (formData: {
      title: string;
      position: string;
      image_url: string;
      link_url: string | null;
      id?: string;
    }) => {
      if (formData.id) {
        const { error } = await supabase
          .from('footer_banners')
          .update({
            title: formData.title,
            position: formData.position,
            image_url: formData.image_url,
            link_url: formData.link_url || null,
          })
          .eq('id', formData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('footer_banners')
          .insert({
            title: formData.title,
            position: formData.position,
            image_url: formData.image_url,
            link_url: formData.link_url || null,
            is_active: true,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-footer-banners'] });
      queryClient.invalidateQueries({ queryKey: ['footer-banners'] });
      toast({ title: 'Berhasil', description: 'Banner berhasil disimpan' });
      resetForm();
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({ 
        title: 'Error', 
        description: 'Gagal menyimpan banner', 
        variant: 'destructive' 
      });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('footer_banners')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-footer-banners'] });
      queryClient.invalidateQueries({ queryKey: ['footer-banners'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('footer_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-footer-banners'] });
      queryClient.invalidateQueries({ queryKey: ['footer-banners'] });
      toast({ title: 'Berhasil', description: 'Banner berhasil dihapus' });
      setDeleteBannerId(null);
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Gagal menghapus banner', 
        variant: 'destructive' 
      });
    },
  });

  // Image compression function
  const compressImage = async (file: File, maxSizeMB: number = 2): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (file.size <= maxSizeMB * 1024 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if too large (max 1200px width for banners)
          const maxWidth = 1200;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          let quality = 0.85;
          const compress = () => {
            canvas.toBlob(
              (blob) => {
                if (blob && blob.size <= maxSizeMB * 1024 * 1024) {
                  resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                } else if (quality > 0.1) {
                  quality -= 0.1;
                  compress();
                } else {
                  resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
                }
              },
              'image/jpeg',
              quality
            );
          };
          compress();
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingBanner(null);
    setTitle('');
    setPosition('left');
    setLinkUrl('');
    setMediaFile(null);
    setMediaPreview('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (JPG, PNG, GIF)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({ 
        title: 'Error', 
        description: 'Format file harus JPG, PNG, atau GIF', 
        variant: 'destructive' 
      });
      return;
    }

    // GIF max 5MB, others max 2MB
    const maxSize = file.type === 'image/gif' ? 5 : 2;
    if (file.size > maxSize * 1024 * 1024) {
      if (file.type === 'image/gif') {
        toast({ 
          title: 'Error', 
          description: 'Ukuran GIF maksimal 5MB', 
          variant: 'destructive' 
        });
        return;
      }
      // Compress non-GIF images
      toast({ title: 'Mengompres gambar...', description: 'Mohon tunggu sebentar' });
      try {
        const compressedFile = await compressImage(file, 2);
        setMediaFile(compressedFile);
        setMediaPreview(URL.createObjectURL(compressedFile));
        toast({ 
          title: 'Berhasil', 
          description: `Gambar dikompres ke ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB` 
        });
      } catch (error) {
        console.error('Compression error:', error);
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
      }
    } else {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `footer-banners/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('advertisements')
      .upload(fileName, file);

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('advertisements')
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Judul wajib diisi', 
        variant: 'destructive' 
      });
      return;
    }

    if (!mediaFile && !editingBanner?.image_url) {
      toast({ 
        title: 'Error', 
        description: 'Gambar wajib diupload', 
        variant: 'destructive' 
      });
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = editingBanner?.image_url || '';

      if (mediaFile) {
        imageUrl = await uploadFile(mediaFile);
      }

      await saveMutation.mutateAsync({
        title,
        position,
        image_url: imageUrl,
        link_url: linkUrl || null,
        id: editingBanner?.id,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Error', 
        description: 'Gagal mengupload file', 
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (banner: FooterBanner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setPosition(banner.position as 'left' | 'right');
    setLinkUrl(banner.link_url || '');
    setMediaPreview(banner.image_url);
    setShowForm(true);
  };

  const leftBanner = banners.find(b => b.position === 'left');
  const rightBanner = banners.find(b => b.position === 'right');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Footer Banners</h1>
          <p className="text-muted-foreground">
            Kelola banner yang muncul di atas footer
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Banner
        </Button>
      </div>

      {/* Banner Specification Guide */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Panduan Ukuran Banner</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p><strong>Aspect Ratio:</strong> 3:1 (contoh: 1200×400 px)</p>
          <p><strong>Ukuran Rekomendasi:</strong> 1200 × 400 px (Desktop) atau 600 × 200 px (Single)</p>
          <p><strong>Format:</strong> JPG, PNG, GIF (animasi didukung)</p>
          <p><strong>Max File Size:</strong> 2MB (JPG/PNG) | 5MB (GIF)</p>
          <p><strong>Safe Zone:</strong> Konten penting dalam 90% area tengah</p>
        </AlertDescription>
      </Alert>

      {/* Preview Layout */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Preview Layout</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Banner */}
            <div className="relative">
              <div className="absolute -top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                Kiri (Desktop) / Atas (Mobile)
              </div>
              <div className="aspect-[3/1] rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted/30">
                {leftBanner ? (
                  <img
                    src={leftBanner.image_url}
                    alt={leftBanner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Belum ada banner</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Banner */}
            <div className="relative">
              <div className="absolute -top-2 left-2 px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded">
                Kanan (Desktop) / Bawah (Mobile)
              </div>
              <div className="aspect-[3/1] rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted/30">
                {rightBanner ? (
                  <img
                    src={rightBanner.image_url}
                    alt={rightBanner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Belum ada banner</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List of banners */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Belum ada banner</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Klik tombol "Tambah Banner" untuk membuat banner pertama
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              {/* Media preview */}
              <div className="relative aspect-[3/1] bg-muted">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {banner.position === 'left' ? 'Kiri' : 'Kanan'}
                  </span>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{banner.title}</h3>
                    {banner.link_url && (
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {banner.link_url}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({ id: banner.id, is_active: checked })
                      }
                    />
                    <span className={`text-xs ${banner.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {banner.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(banner)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteBannerId(banner.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Edit Banner' : 'Tambah Banner Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul Banner</Label>
              <Input
                id="title"
                placeholder="Contoh: Promo Spesial Akhir Tahun"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Posisi</Label>
              <Select value={position} onValueChange={(v) => setPosition(v as 'left' | 'right')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Kiri (Desktop) / Atas (Mobile)</SelectItem>
                  <SelectItem value="right">Kanan (Desktop) / Bawah (Mobile)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Link URL */}
            <div className="space-y-2">
              <Label htmlFor="linkUrl">URL Tujuan (Opsional)</Label>
              <Input
                id="linkUrl"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <Label>Gambar Banner (3:1 ratio)</Label>
              
              {mediaPreview ? (
                <div className="relative aspect-[3/1] rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview('');
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="aspect-[3/1] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Klik untuk upload (JPG, PNG, GIF)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Rekomendasi: 1200 × 400 px
                  </span>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Mengupload...' : editingBanner ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteBannerId} onOpenChange={() => setDeleteBannerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Banner akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBannerId && deleteMutation.mutate(deleteBannerId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CMSFooterBanners;
