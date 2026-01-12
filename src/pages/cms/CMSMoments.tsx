import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Upload, Video, Image as ImageIcon, GripVertical, X, Save } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface BestMoment {
  id: string;
  title_id: string;
  title_en: string;
  thumbnail_url: string;
  video_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const CMSMoments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingMoment, setEditingMoment] = useState<BestMoment | null>(null);
  
  // Form states
  const [titleId, setTitleId] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch moments
  const { data: moments = [], isLoading: momentsLoading } = useQuery({
    queryKey: ['cms-moments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('best_moments')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as BestMoment[];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { 
      titleId: string; 
      titleEn: string; 
      thumbnailUrl: string; 
      videoUrl: string | null;
      id?: string;
    }) => {
      if (data.id) {
        const { error } = await supabase
          .from('best_moments')
          .update({
            title_id: data.titleId,
            title_en: data.titleEn,
            thumbnail_url: data.thumbnailUrl,
            video_url: data.videoUrl,
          })
          .eq('id', data.id);
        
        if (error) throw error;
      } else {
        const maxOrder = moments.length > 0 ? Math.max(...moments.map(m => m.sort_order)) : 0;
        const { error } = await supabase
          .from('best_moments')
          .insert({
            title_id: data.titleId,
            title_en: data.titleEn,
            thumbnail_url: data.thumbnailUrl,
            video_url: data.videoUrl,
            sort_order: maxOrder + 1,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-moments'] });
      queryClient.invalidateQueries({ queryKey: ['best-moments'] });
      toast({ title: editingMoment ? 'Momen diperbarui!' : 'Momen ditambahkan!' });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('best_moments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-moments'] });
      queryClient.invalidateQueries({ queryKey: ['best-moments'] });
      toast({ title: 'Momen dihapus!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('best_moments')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-moments'] });
      queryClient.invalidateQueries({ queryKey: ['best-moments'] });
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (reorderedMoments: BestMoment[]) => {
      const updates = reorderedMoments.map((moment, index) => 
        supabase
          .from('best_moments')
          .update({ sort_order: index + 1 })
          .eq('id', moment.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-moments'] });
      queryClient.invalidateQueries({ queryKey: ['best-moments'] });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingMoment(null);
    setTitleId('');
    setTitleEn('');
    setThumbnailFile(null);
    setVideoFile(null);
    setThumbnailPreview('');
    setVideoPreview('');
  };

  const handleEdit = (moment: BestMoment) => {
    setEditingMoment(moment);
    setTitleId(moment.title_id);
    setTitleEn(moment.title_en);
    setThumbnailPreview(moment.thumbnail_url);
    setVideoPreview(moment.video_url || '');
    setShowForm(true);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('moments-media')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('moments-media')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titleId || !titleEn) {
      toast({ title: 'Error', description: 'Judul wajib diisi', variant: 'destructive' });
      return;
    }

    if (!editingMoment && !thumbnailFile) {
      toast({ title: 'Error', description: 'Thumbnail wajib diupload', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    try {
      let thumbnailUrl = editingMoment?.thumbnail_url || '';
      let videoUrl = editingMoment?.video_url || null;

      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, 'thumbnails');
      }

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'videos');
      }

      await saveMutation.mutateAsync({
        titleId,
        titleEn,
        thumbnailUrl,
        videoUrl,
        id: editingMoment?.id,
      });
    } catch (error: any) {
      toast({ title: 'Error upload', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReorder = (newOrder: BestMoment[]) => {
    queryClient.setQueryData(['cms-moments'], newOrder);
    reorderMutation.mutate(newOrder);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Momen Terbaik</h1>
          <p className="text-muted-foreground">Kelola video dan gambar momen terbaik</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Momen
        </Button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{editingMoment ? 'Edit Momen' : 'Tambah Momen Baru'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="titleId">Judul (Indonesia) *</Label>
                        <Input
                          id="titleId"
                          value={titleId}
                          onChange={(e) => setTitleId(e.target.value)}
                          placeholder="Gol Spektakuler Ronaldo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="titleEn">Judul (English) *</Label>
                        <Input
                          id="titleEn"
                          value={titleEn}
                          onChange={(e) => setTitleEn(e.target.value)}
                          placeholder="Spectacular Ronaldo Goal"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Thumbnail *</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                          {thumbnailPreview ? (
                            <div className="relative inline-block">
                              <img 
                                src={thumbnailPreview} 
                                alt="Preview" 
                                className="h-32 rounded-lg object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => { setThumbnailFile(null); setThumbnailPreview(''); }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground">Klik untuk upload thumbnail</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Video (opsional)</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                          {videoPreview ? (
                            <div className="relative inline-block">
                              <video 
                                src={videoPreview} 
                                className="h-32 rounded-lg"
                                controls
                              />
                              <button
                                type="button"
                                onClick={() => { setVideoFile(null); setVideoPreview(''); }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <Video className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground">Klik untuk upload video (max 50MB)</span>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={isUploading || saveMutation.isPending}>
                      {isUploading ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Mengupload...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingMoment ? 'Simpan Perubahan' : 'Tambah Momen'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moments List */}
      {momentsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : moments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Belum ada momen</h3>
            <p className="text-muted-foreground mb-4">Tambahkan momen terbaik pertama</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Momen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <Reorder.Group axis="y" values={moments} onReorder={handleReorder} className="space-y-3">
              {moments.map((moment) => (
                <Reorder.Item
                  key={moment.id}
                  value={moment}
                  className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg group"
                >
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={moment.thumbnail_url}
                      alt={moment.title_id}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{moment.title_id}</p>
                    <p className="text-sm text-muted-foreground truncate">{moment.title_en}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={moment.is_active}
                      onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: moment.id, isActive: checked })}
                    />
                    <span className="text-xs text-muted-foreground w-12">
                      {moment.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(moment)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        if (confirm('Yakin ingin menghapus momen ini?')) {
                          deleteMutation.mutate(moment.id);
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CMSMoments;
