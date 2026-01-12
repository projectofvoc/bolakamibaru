import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Link2, X, Save, GripVertical, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface NavItem {
  id: string;
  label_id: string;
  label_en: string;
  path: string;
  icon: string | null;
  parent_id: string | null;
  is_external: boolean;
  is_active: boolean;
  sort_order: number;
}

const CMSNavigation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  
  const [labelId, setLabelId] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('');
  const [isExternal, setIsExternal] = useState(false);

  const { data: navItems = [], isLoading } = useQuery({
    queryKey: ['cms-nav-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nav_items')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as NavItem[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { 
      labelId: string; 
      labelEn: string;
      path: string;
      icon: string;
      isExternal: boolean;
      id?: string;
    }) => {
      if (data.id) {
        const { error } = await supabase
          .from('nav_items')
          .update({
            label_id: data.labelId,
            label_en: data.labelEn,
            path: data.path,
            icon: data.icon || null,
            is_external: data.isExternal,
          })
          .eq('id', data.id);
        
        if (error) throw error;
      } else {
        const maxOrder = navItems.length > 0 ? Math.max(...navItems.map(n => n.sort_order ?? 0)) : 0;
        const { error } = await supabase
          .from('nav_items')
          .insert({
            label_id: data.labelId,
            label_en: data.labelEn,
            path: data.path,
            icon: data.icon || null,
            is_external: data.isExternal,
            sort_order: maxOrder + 1,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-nav-items'] });
      toast({ title: editingItem ? 'Menu diperbarui!' : 'Menu ditambahkan!' });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('nav_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-nav-items'] });
      toast({ title: 'Menu dihapus!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('nav_items')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-nav-items'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedItems: NavItem[]) => {
      const updates = reorderedItems.map((item, index) => 
        supabase
          .from('nav_items')
          .update({ sort_order: index + 1 })
          .eq('id', item.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-nav-items'] });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setLabelId('');
    setLabelEn('');
    setPath('');
    setIcon('');
    setIsExternal(false);
  };

  const handleEdit = (item: NavItem) => {
    setEditingItem(item);
    setLabelId(item.label_id);
    setLabelEn(item.label_en);
    setPath(item.path);
    setIcon(item.icon || '');
    setIsExternal(item.is_external ?? false);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!labelId || !labelEn || !path) {
      toast({ title: 'Error', description: 'Label dan path wajib diisi', variant: 'destructive' });
      return;
    }

    await saveMutation.mutateAsync({
      labelId,
      labelEn,
      path,
      icon,
      isExternal,
      id: editingItem?.id,
    });
  };

  const handleReorder = (newOrder: NavItem[]) => {
    queryClient.setQueryData(['cms-nav-items'], newOrder);
    reorderMutation.mutate(newOrder);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Navigation</h1>
          <p className="text-muted-foreground">Kelola menu navigasi website</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Menu
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="labelId">Label (Indonesia) *</Label>
                      <Input
                        id="labelId"
                        value={labelId}
                        onChange={(e) => setLabelId(e.target.value)}
                        placeholder="Beranda"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="labelEn">Label (English) *</Label>
                      <Input
                        id="labelEn"
                        value={labelEn}
                        onChange={(e) => setLabelEn(e.target.value)}
                        placeholder="Home"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="path">Path / URL *</Label>
                      <Input
                        id="path"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        placeholder="/berita atau https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="icon">Ikon (lucide icon name)</Label>
                      <Input
                        id="icon"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="newspaper"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id="external"
                      checked={isExternal}
                      onCheckedChange={setIsExternal}
                    />
                    <Label htmlFor="external">Link External (buka di tab baru)</Label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={saveMutation.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingItem ? 'Simpan' : 'Tambah'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : navItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Link2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Belum ada menu</h3>
            <p className="text-muted-foreground mb-4">Tambahkan menu navigasi pertama</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Menu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <Reorder.Group axis="y" values={navItems} onReorder={handleReorder} className="space-y-2">
              {navItems.map((item) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg group"
                >
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{item.label_id}</p>
                      {item.is_external && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{item.path}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: item.id, isActive: checked })}
                    />
                    <span className="text-xs text-muted-foreground w-12">
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        if (confirm('Yakin ingin menghapus menu ini?')) {
                          deleteMutation.mutate(item.id);
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

export default CMSNavigation;
