import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Gift,
  Users,
  Settings,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Package,
  Clock,
  Save,
  Search,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRewardsAdmin } from '@/hooks/useRewards';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RewardFormData {
  name: string;
  description: string;
  image_url: string;
  points_required: number;
  stock: number;
  is_active: boolean;
  sort_order: number;
}

const initialFormData: RewardFormData = {
  name: '',
  description: '',
  image_url: '',
  points_required: 100,
  stock: 10,
  is_active: true,
  sort_order: 0,
};

const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB

const CMSReadToEarn: React.FC = () => {
  const {
    allRewards,
    allRedemptions,
    allUserPoints,
    analytics,
    rteSettings,
    createReward,
    updateReward,
    deleteReward,
    updateRedemptionStatus,
    updateSetting,
    isCreating,
    isUpdating,
    isDeleting,
  } = useRewardsAdmin();

  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [formData, setFormData] = useState<RewardFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImageAspectRatio = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        // Allow 1:1 with a small tolerance (0.95 to 1.05)
        const isSquare = aspectRatio >= 0.95 && aspectRatio <= 1.05;
        URL.revokeObjectURL(img.src);
        resolve(isSquare);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Ukuran gambar maksimal 1.5 MB');
      return;
    }

    // Validate aspect ratio
    const isSquare = await validateImageAspectRatio(file);
    if (!isSquare) {
      toast.error('Gambar harus memiliki rasio 1:1 (persegi)');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `rewards/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('rewards')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Gagal mengupload gambar');
    }

    const { data } = supabase.storage
      .from('rewards')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image_url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateReward = () => {
    setEditingReward(null);
    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview(null);
    setShowRewardDialog(true);
  };

  const handleEditReward = (reward: any) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description || '',
      image_url: reward.image_url || '',
      points_required: reward.points_required,
      stock: reward.stock,
      is_active: reward.is_active,
      sort_order: reward.sort_order,
    });
    setImageFile(null);
    setImagePreview(reward.image_url || null);
    setShowRewardDialog(true);
  };

  const handleSaveReward = async () => {
    try {
      setIsUploading(true);
      let imageUrl = formData.image_url;

      // Upload image if new file is selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const dataToSave = { ...formData, image_url: imageUrl };

      if (editingReward) {
        await updateReward({ id: editingReward.id, ...dataToSave });
        toast.success('Reward berhasil diupdate');
      } else {
        await createReward(dataToSave);
        toast.success('Reward berhasil dibuat');
      }
      setShowRewardDialog(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      toast.error('Gagal menyimpan reward');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (confirm('Yakin ingin menghapus reward ini?')) {
      try {
        await deleteReward(id);
        toast.success('Reward berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus reward');
      }
    }
  };

  const handleUpdateRedemptionStatus = async (id: string, status: string) => {
    try {
      await updateRedemptionStatus({ id, status });
      toast.success('Status berhasil diupdate');
    } catch (error) {
      toast.error('Gagal mengupdate status');
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await updateSetting({ key, value });
      toast.success('Setting berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan setting');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-500/10 text-yellow-500', label: 'Menunggu' },
      approved: { color: 'bg-blue-500/10 text-blue-500', label: 'Disetujui' },
      shipped: { color: 'bg-purple-500/10 text-purple-500', label: 'Dikirim' },
      completed: { color: 'bg-primary/10 text-primary', label: 'Selesai' },
      rejected: { color: 'bg-destructive/10 text-destructive', label: 'Ditolak' },
    };
    const c = config[status] || config.pending;
    return <Badge variant="outline" className={`${c.color} border-0`}>{c.label}</Badge>;
  };

  const filteredRedemptions = allRedemptions.filter((r: any) => {
    const matchesSearch = 
      r.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rewards?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Read to Earn</h1>
        <p className="text-muted-foreground">Kelola sistem gamifikasi dan rewards</p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="text-xs sm:text-sm">
            <Gift className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">
            <Users className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="redemptions" className="text-xs sm:text-sm">
            <Package className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Penukaran</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">
            <Settings className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Total Poin</span>
                </div>
                <p className="text-2xl font-bold">{analytics?.totalPointsDistributed || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Penukaran</span>
                </div>
                <p className="text-2xl font-bold">{analytics?.totalRedemptions || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">User Aktif</span>
                </div>
                <p className="text-2xl font-bold">{analytics?.activeUsers || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Check-in Hari Ini</span>
                </div>
                <p className="text-2xl font-bold">{analytics?.todayCheckins || 0}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Users by Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allUserPoints.slice(0, 10).map((user: any, index: number) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="text-sm text-foreground truncate max-w-[200px]">
                          {user.user_id.slice(0, 8)}...
                        </span>
                      </div>
                      <Badge variant="outline">{user.total_points} pts</Badge>
                    </div>
                  ))}
                  {allUserPoints.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Belum ada data user
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Redemptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allRedemptions.slice(0, 5).map((redemption: any) => (
                    <div key={redemption.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{redemption.rewards?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(redemption.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      {getStatusBadge(redemption.status)}
                    </div>
                  ))}
                  {allRedemptions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Belum ada penukaran
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Daftar Rewards</h2>
            <Button onClick={handleCreateReward}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Reward
            </Button>
          </div>

          <div className="grid gap-4">
            {allRewards.map((reward: any) => (
              <Card key={reward.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {reward.image_url && (
                    <div className="w-full sm:w-20 h-32 sm:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={reward.image_url} 
                        alt={reward.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{reward.name}</h3>
                      {!reward.is_active && (
                        <Badge variant="outline" className="text-muted-foreground">Nonaktif</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{reward.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-primary font-medium">{reward.points_required} poin</span>
                      <span className="text-muted-foreground">Stok: {reward.stock}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => handleEditReward(reward)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 sm:flex-none text-destructive hover:text-destructive"
                      onClick={() => handleDeleteReward(reward.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {allRewards.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada reward. Klik "Tambah Reward" untuk mulai.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Points Monitor</CardTitle>
              <CardDescription>Lihat progress poin semua user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead className="text-right">Total Poin</TableHead>
                      <TableHead className="text-right">Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUserPoints.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">
                          {user.user_id.slice(0, 16)}...
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {user.total_points}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {new Date(user.updated_at).toLocaleDateString('id-ID')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {allUserPoints.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          Belum ada data user
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redemptions Tab */}
        <TabsContent value="redemptions">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <CardTitle>Pengajuan Penukaran</CardTitle>
                  <CardDescription>Kelola status penukaran reward</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-[200px]"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="approved">Disetujui</SelectItem>
                      <SelectItem value="shipped">Dikirim</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="rejected">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRedemptions.map((redemption: any) => (
                  <Card key={redemption.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex gap-3">
                          {redemption.rewards?.image_url && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img 
                                src={redemption.rewards.image_url} 
                                alt={redemption.rewards?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{redemption.rewards?.name}</p>
                            <p className="text-sm text-muted-foreground">{redemption.user_email}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(redemption.created_at).toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm mt-1">-{redemption.points_spent} poin</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                          {getStatusBadge(redemption.status)}
                          <Select
                            value={redemption.status}
                            onValueChange={(value) => handleUpdateRedemptionStatus(redemption.id, value)}
                          >
                            <SelectTrigger className="w-full sm:w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Menunggu</SelectItem>
                              <SelectItem value="approved">Disetujui</SelectItem>
                              <SelectItem value="shipped">Dikirim</SelectItem>
                              <SelectItem value="completed">Selesai</SelectItem>
                              <SelectItem value="rejected">Ditolak</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredRedemptions.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada penukaran ditemukan</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi Read to Earn</CardTitle>
              <CardDescription>Atur nilai poin dan threshold sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {rteSettings.map((setting: any) => (
                <div key={setting.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1">
                    <Label className="font-medium">{setting.key.replace(/_/g, ' ').toUpperCase()}</Label>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      defaultValue={setting.value}
                      className="w-24"
                      onBlur={(e) => {
                        if (e.target.value !== setting.value) {
                          handleUpdateSetting(setting.key, e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
              {rteSettings.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Loading settings...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reward Dialog */}
      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReward ? 'Edit Reward' : 'Tambah Reward Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nama Reward *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama reward"
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi reward"
                rows={3}
              />
            </div>
            <div>
              <Label>Gambar Reward (1:1, max 1.5MB)</Label>
              <div className="mt-2">
                {(imagePreview || formData.image_url) ? (
                  <div className="relative w-32 h-32 mx-auto">
                    <img 
                      src={imagePreview || formData.image_url} 
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                      onClick={removeImage}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="w-32 h-32 mx-auto border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground text-center px-2">
                      Klik untuk upload
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                {(imagePreview || formData.image_url) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Ganti Gambar
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Poin Dibutuhkan *</Label>
                <Input
                  type="number"
                  value={formData.points_required}
                  onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Stok *</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Urutan</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Aktif</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRewardDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleSaveReward} 
              disabled={isCreating || isUpdating || isUploading || !formData.name}
            >
              {(isCreating || isUpdating || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {isUploading ? 'Mengupload...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CMSReadToEarn;
