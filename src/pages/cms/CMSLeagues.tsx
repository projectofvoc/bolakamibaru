import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Trophy, X, Save, GripVertical } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface League {
  id: string;
  name: string;
  name_en: string | null;
  country: string | null;
  icon_url: string | null;
  is_active: boolean;
  is_international: boolean;
  sort_order: number;
}

const CMSLeagues = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [country, setCountry] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [isInternational, setIsInternational] = useState(false);

  const { data: leagues = [], isLoading } = useQuery({
    queryKey: ['cms-leagues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as League[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      nameEn: string;
      country: string;
      iconUrl: string;
      isInternational: boolean;
      id?: string;
    }) => {
      if (data.id) {
        const { error } = await supabase
          .from('leagues')
          .update({
            name: data.name,
            name_en: data.nameEn || null,
            country: data.country || null,
            icon_url: data.iconUrl || null,
            is_international: data.isInternational,
          })
          .eq('id', data.id);
        
        if (error) throw error;
      } else {
        const maxOrder = leagues.length > 0 ? Math.max(...leagues.map(l => l.sort_order ?? 0)) : 0;
        const { error } = await supabase
          .from('leagues')
          .insert({
            name: data.name,
            name_en: data.nameEn || null,
            country: data.country || null,
            icon_url: data.iconUrl || null,
            is_international: data.isInternational,
            sort_order: maxOrder + 1,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-leagues'] });
      toast({ title: editingLeague ? 'Liga diperbarui!' : 'Liga ditambahkan!' });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leagues')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-leagues'] });
      toast({ title: 'Liga dihapus!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('leagues')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-leagues'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedLeagues: League[]) => {
      const updates = reorderedLeagues.map((league, index) => 
        supabase
          .from('leagues')
          .update({ sort_order: index + 1 })
          .eq('id', league.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-leagues'] });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingLeague(null);
    setName('');
    setNameEn('');
    setCountry('');
    setIconUrl('');
    setIsInternational(false);
  };

  const handleEdit = (league: League) => {
    setEditingLeague(league);
    setName(league.name);
    setNameEn(league.name_en || '');
    setCountry(league.country || '');
    setIconUrl(league.icon_url || '');
    setIsInternational(league.is_international ?? false);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({ title: 'Error', description: 'Nama liga wajib diisi', variant: 'destructive' });
      return;
    }

    await saveMutation.mutateAsync({
      name,
      nameEn,
      country,
      iconUrl,
      isInternational,
      id: editingLeague?.id,
    });
  };

  const handleReorder = (newOrder: League[]) => {
    queryClient.setQueryData(['cms-leagues'], newOrder);
    reorderMutation.mutate(newOrder);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Liga</h1>
          <p className="text-muted-foreground">Kelola daftar liga yang ditampilkan</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Liga
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
                <CardTitle>{editingLeague ? 'Edit Liga' : 'Tambah Liga Baru'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Liga *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Liga 1 Indonesia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameEn">Nama (English)</Label>
                      <Input
                        id="nameEn"
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        placeholder="Indonesia League 1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Negara</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Indonesia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iconUrl">URL Ikon</Label>
                      <Input
                        id="iconUrl"
                        value={iconUrl}
                        onChange={(e) => setIconUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id="international"
                      checked={isInternational}
                      onCheckedChange={setIsInternational}
                    />
                    <Label htmlFor="international">Liga Internasional</Label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={saveMutation.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingLeague ? 'Simpan' : 'Tambah'}
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
      ) : leagues.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Belum ada liga</h3>
            <p className="text-muted-foreground mb-4">Tambahkan liga pertama</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Liga
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <Reorder.Group axis="y" values={leagues} onReorder={handleReorder} className="space-y-2">
              {leagues.map((league) => (
                <Reorder.Item
                  key={league.id}
                  value={league}
                  className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg group"
                >
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {league.icon_url ? (
                      <img src={league.icon_url} alt={league.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <Trophy className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{league.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {league.country || 'No country'} 
                      {league.is_international && ' • Internasional'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={league.is_active}
                      onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: league.id, isActive: checked })}
                    />
                    <span className="text-xs text-muted-foreground w-12">
                      {league.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(league)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        if (confirm('Yakin ingin menghapus liga ini?')) {
                          deleteMutation.mutate(league.id);
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

export default CMSLeagues;
