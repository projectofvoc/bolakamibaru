import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube, 
  ExternalLink, 
  Save,
  Share2,
  Loader2
} from 'lucide-react';
import { TikTokIcon, ThreadsIcon } from '@/components/icons/SocialIcons';

interface SocialLink {
  id: string;
  platform: string;
  display_name: string;
  url: string;
  icon_name: string;
  is_active: boolean;
  sort_order: number;
}

const CMSSocialMedia: React.FC = () => {
  const queryClient = useQueryClient();
  const [editedLinks, setEditedLinks] = useState<Record<string, { url: string; is_active: boolean }>>({});

  const { data: socialLinks, isLoading } = useQuery({
    queryKey: ['cms-social-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as SocialLink[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, url, is_active }: { id: string; url: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('social_media_links')
        .update({ url, is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-social-links'] });
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
      toast.success('Link berhasil diperbarui!');
    },
    onError: (error) => {
      toast.error('Gagal memperbarui link: ' + error.message);
    },
  });

  const getIcon = (iconName: string) => {
    const iconClass = "w-6 h-6";
    switch (iconName) {
      case 'instagram':
        return <Instagram className={iconClass} />;
      case 'twitter':
        return <Twitter className={iconClass} />;
      case 'facebook':
        return <Facebook className={iconClass} />;
      case 'youtube':
        return <Youtube className={iconClass} />;
      case 'tiktok':
        return <TikTokIcon className={iconClass} />;
      case 'threads':
        return <ThreadsIcon className={iconClass} />;
      default:
        return <Share2 className={iconClass} />;
    }
  };

  const handleUrlChange = (id: string, url: string) => {
    setEditedLinks(prev => ({
      ...prev,
      [id]: { ...prev[id], url, is_active: prev[id]?.is_active ?? socialLinks?.find(l => l.id === id)?.is_active ?? true }
    }));
  };

  const handleActiveChange = (id: string, is_active: boolean) => {
    setEditedLinks(prev => ({
      ...prev,
      [id]: { ...prev[id], is_active, url: prev[id]?.url ?? socialLinks?.find(l => l.id === id)?.url ?? '' }
    }));
  };

  const handleSave = (link: SocialLink) => {
    const edited = editedLinks[link.id];
    const newUrl = edited?.url ?? link.url;
    const newActive = edited?.is_active ?? link.is_active;
    
    updateMutation.mutate({ id: link.id, url: newUrl, is_active: newActive });
    
    // Clear edited state for this link
    setEditedLinks(prev => {
      const newState = { ...prev };
      delete newState[link.id];
      return newState;
    });
  };

  const hasChanges = (link: SocialLink) => {
    const edited = editedLinks[link.id];
    if (!edited) return false;
    return edited.url !== link.url || edited.is_active !== link.is_active;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Social Media Links</h1>
        <p className="text-muted-foreground mt-1">
          Kelola link social media yang tampil di footer. Anda bisa mengganti URL jika terjadi banned.
        </p>
      </div>

      <div className="grid gap-4">
        {socialLinks?.map((link) => {
          const edited = editedLinks[link.id];
          const currentUrl = edited?.url ?? link.url;
          const currentActive = edited?.is_active ?? link.is_active;
          const changed = hasChanges(link);

          return (
            <Card key={link.id} className={!currentActive ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">
                      {getIcon(link.icon_name)}
                    </div>
                    <CardTitle className="text-lg">{link.display_name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${link.id}`} className="text-sm text-muted-foreground">
                      Aktif
                    </Label>
                    <Switch
                      id={`active-${link.id}`}
                      checked={currentActive}
                      onCheckedChange={(checked) => handleActiveChange(link.id, checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={currentUrl}
                    onChange={(e) => handleUrlChange(link.id, e.target.value)}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(currentUrl, '_blank')}
                    title="Test Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleSave(link)}
                    disabled={!changed || updateMutation.isPending}
                    className={changed ? 'bg-primary' : ''}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span className="ml-2">Simpan</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Tips:</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Nonaktifkan link jika akun social media di-banned sementara</li>
            <li>Gunakan tombol test link untuk memastikan URL valid</li>
            <li>Perubahan akan langsung tampil di footer setelah disimpan</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CMSSocialMedia;
