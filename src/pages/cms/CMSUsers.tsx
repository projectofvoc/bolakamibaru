import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, UserCheck, Trash2, Plus, Search } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'author' | 'user';
  created_at: string;
}

const CMSUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'author' | 'user'>('author');
  const [search, setSearch] = useState('');

  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ['cms-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'author' | 'user' }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-user-roles'] });
      toast({ title: 'Role berhasil ditambahkan!' });
      setNewUserId('');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-user-roles'] });
      toast({ title: 'Role dihapus!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'admin' | 'author' | 'user' }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-user-roles'] });
      toast({ title: 'Role diperbarui!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId) {
      toast({ title: 'Error', description: 'User ID wajib diisi', variant: 'destructive' });
      return;
    }
    addRoleMutation.mutate({ userId: newUserId, role: newRole });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500/20 text-red-400 gap-1"><Shield className="w-3 h-3" />Admin</Badge>;
      case 'author':
        return <Badge className="bg-blue-500/20 text-blue-400 gap-1"><UserCheck className="w-3 h-3" />Author</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const filteredRoles = userRoles.filter(r => 
    r.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Kelola role dan akses user</p>
      </div>

      {/* Add New Role */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah Role Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddRole} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="User ID (UUID dari auth.users)"
              />
            </div>
            <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={addRoleMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            User ID dapat ditemukan di backend authentication logs atau dengan melihat session user yang login.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari user ID..."
          className="pl-10"
        />
      </div>

      {/* User Roles List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : filteredRoles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {search ? 'Tidak ditemukan' : 'Belum ada user role'}
            </h3>
            <p className="text-muted-foreground">
              {search ? 'Coba kata kunci lain' : 'Tambahkan role untuk user pertama'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredRoles.map((userRole) => (
                <div key={userRole.id} className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-foreground truncate">
                      {userRole.user_id}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ditambahkan: {new Date(userRole.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Select 
                      value={userRole.role} 
                      onValueChange={(v: any) => updateRoleMutation.mutate({ id: userRole.id, role: v })}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="author">Author</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        if (confirm('Yakin ingin menghapus role ini?')) {
                          deleteRoleMutation.mutate(userRole.id);
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Penjelasan Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Shield className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Admin</p>
              <p className="text-sm text-muted-foreground">
                Akses penuh: kelola semua berita, momen, liga, navigasi, dan user roles.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <UserCheck className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Author</p>
              <p className="text-sm text-muted-foreground">
                Buat dan edit berita sendiri, submit untuk review. Tidak bisa publish langsung atau akses admin menu.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-foreground">User</p>
              <p className="text-sm text-muted-foreground">
                Role default. Hanya bisa membaca konten publik.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CMSUsers;
