import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Image as ImageIcon, 
  Video, 
  Upload,
  ExternalLink,
  X
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

interface Advertisement {
  id: string;
  title: string;
  media_type: string;
  media_url: string;
  link_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CMSAdvertise = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [deleteAdId, setDeleteAdId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [linkUrl, setLinkUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all advertisements
  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['advertisements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Advertisement[];
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (formData: {
      title: string;
      media_type: string;
      media_url: string;
      link_url: string | null;
      id?: string;
    }) => {
      if (formData.id) {
        // Update existing
        const { error } = await supabase
          .from('advertisements')
          .update({
            title: formData.title,
            media_type: formData.media_type,
            media_url: formData.media_url,
            link_url: formData.link_url || null,
          })
          .eq('id', formData.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('advertisements')
          .insert({
            title: formData.title,
            media_type: formData.media_type,
            media_url: formData.media_url,
            link_url: formData.link_url || null,
            is_active: true,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      toast({ title: 'Berhasil', description: 'Iklan berhasil disimpan' });
      resetForm();
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({ 
        title: 'Error', 
        description: 'Gagal menyimpan iklan', 
        variant: 'destructive' 
      });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['active-advertisement'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      toast({ title: 'Berhasil', description: 'Iklan berhasil dihapus' });
      setDeleteAdId(null);
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Gagal menghapus iklan', 
        variant: 'destructive' 
      });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingAd(null);
    setTitle('');
    setMediaType('image');
    setLinkUrl('');
    setMediaFile(null);
    setMediaPreview('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast({ 
        title: 'Error', 
        description: 'File harus berupa gambar atau video', 
        variant: 'destructive' 
      });
      return;
    }

    setMediaType(isVideo ? 'video' : 'image');
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `ads/${fileName}`;

    const { error } = await supabase.storage
      .from('advertisements')
      .upload(filePath, file);

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('advertisements')
      .getPublicUrl(filePath);

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

    if (!mediaFile && !editingAd?.media_url) {
      toast({ 
        title: 'Error', 
        description: 'File media wajib diupload', 
        variant: 'destructive' 
      });
      return;
    }

    setIsUploading(true);

    try {
      let mediaUrl = editingAd?.media_url || '';

      if (mediaFile) {
        mediaUrl = await uploadFile(mediaFile);
      }

      await saveMutation.mutateAsync({
        title,
        media_type: mediaType,
        media_url: mediaUrl,
        link_url: linkUrl || null,
        id: editingAd?.id,
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

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setMediaType(ad.media_type as 'image' | 'video');
    setLinkUrl(ad.link_url || '');
    setMediaPreview(ad.media_url);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Iklan</h1>
          <p className="text-muted-foreground">
            Atur iklan pop-up yang tampil di halaman utama
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Iklan
        </Button>
      </div>

      {/* List of advertisements */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : ads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Belum ada iklan</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Klik tombol "Tambah Iklan" untuk membuat iklan pertama
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <Card key={ad.id} className="overflow-hidden">
              {/* Media preview */}
              <div className="relative aspect-video bg-muted">
                {ad.media_type === 'image' ? (
                  <img
                    src={ad.media_url}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={ad.media_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                )}
                <div className="absolute top-2 left-2">
                  {ad.media_type === 'video' ? (
                    <span className="bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Video className="w-3 h-3" /> Video
                    </span>
                  ) : (
                    <span className="bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Gambar
                    </span>
                  )}
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{ad.title}</h3>
                    {ad.link_url && (
                      <a
                        href={ad.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {ad.link_url}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={ad.is_active}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({ id: ad.id, is_active: checked })
                      }
                    />
                    <span className={`text-xs ${ad.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {ad.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(ad)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteAdId(ad.id)}
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
              {editingAd ? 'Edit Iklan' : 'Tambah Iklan Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul Iklan</Label>
              <Input
                id="title"
                placeholder="Contoh: Promo Spesial Akhir Tahun"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Media Type */}
            <div className="space-y-2">
              <Label>Tipe Media</Label>
              <Select
                value={mediaType}
                onValueChange={(value) => setMediaType(value as 'image' | 'video')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Gambar
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" /> Video
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>File Media</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
                className="hidden"
              />
              
              {mediaPreview ? (
                <div className="relative border rounded-lg overflow-hidden">
                  {mediaType === 'image' || (editingAd && !mediaFile) ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      className="w-full h-48 object-cover"
                      controls
                      muted
                    />
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Ganti File
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Klik untuk upload {mediaType === 'image' ? 'gambar' : 'video'}
                  </p>
                </button>
              )}
            </div>

            {/* Link URL */}
            <div className="space-y-2">
              <Label htmlFor="linkUrl">Link Tujuan (Opsional)</Label>
              <Input
                id="linkUrl"
                placeholder="https://example.com/promo"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                User akan diarahkan ke link ini saat mengklik iklan
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
              <Button type="submit" disabled={isUploading || saveMutation.isPending}>
                {isUploading ? 'Mengupload...' : saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteAdId} onOpenChange={() => setDeleteAdId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Iklan?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Iklan akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteAdId && deleteMutation.mutate(deleteAdId)}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CMSAdvertise;
