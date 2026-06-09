import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Trash2,
  Edit,
  Upload,
  ExternalLink,
  Send,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

interface EventRow {
  id: string;
  name: string;
  banner_url: string | null;
  start_date: string;
  end_date: string;
  join_url: string;
  telegram_url: string | null;
  telegram_enabled: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  description: string | null;
  join_enabled: boolean;
}

const toDatetimeLocal = (iso: string) => {
  // Convert ISO -> "YYYY-MM-DDTHH:mm" in local time for input[type=datetime-local]
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CMSEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [joinEnabled, setJoinEnabled] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['cms-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('start_date', { ascending: true });
      if (error) throw error;
      return (data as unknown as EventRow[]) || [];
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setJoinUrl('');
    setTelegramUrl('');
    setTelegramEnabled(false);
    setJoinEnabled(true);
    setIsActive(true);
    setSortOrder(0);
    setBannerFile(null);
    setBannerPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (row: EventRow) => {
    setEditing(row);
    setName(row.name);
    setDescription(row.description || '');
    setStartDate(toDatetimeLocal(row.start_date));
    setEndDate(toDatetimeLocal(row.end_date));
    setJoinUrl(row.join_url);
    setTelegramUrl(row.telegram_url || '');
    setTelegramEnabled(row.telegram_enabled);
    setJoinEnabled(row.join_enabled !== false);
    setIsActive(row.is_active);
    setSortOrder(row.sort_order);
    setBannerFile(null);
    setBannerPreview(row.banner_url || '');
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast({ title: 'Error', description: 'Format harus JPG/PNG/WEBP/GIF', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Ukuran maksimal 5MB', variant: 'destructive' });
      return;
    }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const uploadBanner = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `events/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('articles-media').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('articles-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Nama event wajib diisi');
      if (!startDate || !endDate) throw new Error('Tanggal mulai & berakhir wajib diisi');
      if (new Date(endDate) < new Date(startDate)) throw new Error('Tanggal berakhir harus ≥ tanggal mulai');
      if (!joinUrl.trim()) throw new Error('URL Join wajib diisi');
      if (telegramEnabled && !telegramUrl.trim()) throw new Error('URL Telegram wajib jika tombol diaktifkan');

      let bannerUrl = editing?.banner_url || null;
      if (bannerFile) {
        bannerUrl = await uploadBanner(bannerFile);
      }

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        banner_url: bannerUrl,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        join_url: joinUrl.trim(),
        telegram_url: telegramUrl.trim() || null,
        telegram_enabled: telegramEnabled,
        join_enabled: joinEnabled,
        is_active: isActive,
        sort_order: sortOrder,
      };

      if (editing) {
        const { error } = await supabase.from('events').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('events').insert({ ...payload, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Berhasil', description: 'Event tersimpan' });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('events').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Berhasil', description: 'Event dihapus' });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Gagal menghapus event', variant: 'destructive' });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await saveMutation.mutateAsync();
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">Kelola event yang tampil di homepage & halaman /event</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Event
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Belum ada event</h3>
            <p className="text-muted-foreground text-sm mt-1">Klik "Tambah Event" untuk membuat event pertama</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => (
            <Card key={ev.id} className="overflow-hidden">
              <div className="aspect-[16/9] bg-muted">
                {ev.banner_url ? (
                  <img src={ev.banner_url} alt={ev.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <CalendarIcon className="w-10 h-10" />
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium line-clamp-2">{ev.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded shrink-0 ${ev.is_active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {ev.is_active ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Mulai: {formatDate(ev.start_date)}</div>
                  <div>Berakhir: {formatDate(ev.end_date)}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <a href={ev.join_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    <ExternalLink className="w-3 h-3" /> Join URL
                  </a>
                  {ev.telegram_enabled && ev.telegram_url && (
                    <a href={ev.telegram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <Send className="w-3 h-3" /> Telegram
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <label className="flex items-center gap-2 text-xs">
                    <Switch
                      checked={ev.is_active}
                      onCheckedChange={(v) => toggleActiveMutation.mutate({ id: ev.id, is_active: v })}
                    />
                    Tampil
                  </label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(ev)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDeleteId(ev.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => !o && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Event' : 'Tambah Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nama Event *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} required />
            </div>

            <div>
              <Label>Deskripsi Event (opsional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Syarat & ketentuan, cara ikut, hadiah, dsb. Mendukung baris baru."
                rows={8}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ditampilkan dalam dropdown "Lihat Detail & Syarat" di card event. Gunakan baris baru untuk memisahkan section.
              </p>
            </div>

            <div>
              <Label>Banner Event</Label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Pilih Gambar
                </Button>
                {bannerPreview && (
                  <img src={bannerPreview} alt="preview" className="h-16 rounded border border-border" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Rasio 16:9, max 5MB</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Tanggal Mulai *</Label>
                <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div>
                <Label>Tanggal Berakhir *</Label>
                <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>

            <div>
              <Label>URL Join (tombol utama) *</Label>
              <Input type="url" value={joinUrl} onChange={(e) => setJoinUrl(e.target.value)} placeholder="https://..." required />
            </div>

            <div className="space-y-2 p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <Label>Tombol "Ikut Event"</Label>
                <Switch checked={joinEnabled} onCheckedChange={setJoinEnabled} />
              </div>
              <p className="text-xs text-muted-foreground">
                Jika dimatikan, tombol Ikut Event tidak akan tampil di card event.
              </p>
            </div>

            <div className="space-y-2 p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <Label>Tombol Gabung Grup Telegram</Label>
                <Switch checked={telegramEnabled} onCheckedChange={setTelegramEnabled} />
              </div>
              <p className="text-xs text-muted-foreground">
                Jika dimatikan, tombol Telegram tidak akan tampil di card event.
              </p>
              {telegramEnabled && (
                <Input
                  type="url"
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  placeholder="https://t.me/..."
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <Label>Tampilkan</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div>
                <Label>Urutan</Label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
              <Button type="submit" disabled={isUploading || saveMutation.isPending}>
                {isUploading || saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus event?</AlertDialogTitle>
            <AlertDialogDescription>Aksi ini tidak bisa dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CMSEvents;