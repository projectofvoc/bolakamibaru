import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Save, TestTube, CheckCircle, XCircle, BarChart3, Search, Info } from 'lucide-react';

interface IntegrationRow {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

const CMSIntegrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [gaId, setGaId] = useState('');
  const [gscMethod, setGscMethod] = useState('meta_tag');
  const [gscCode, setGscCode] = useState('');

  // Test results
  const [gaTestResult, setGaTestResult] = useState<'success' | 'error' | null>(null);
  const [gscTestResult, setGscTestResult] = useState<'success' | 'error' | null>(null);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_integrations')
        .select('*');
      if (error) throw error;
      return data as IntegrationRow[];
    },
  });

  // Populate form from DB
  useEffect(() => {
    if (settings) {
      const ga = settings.find(s => s.key === 'ga_measurement_id');
      const method = settings.find(s => s.key === 'gsc_method');
      const code = settings.find(s => s.key === 'gsc_verification_code');
      if (ga) setGaId(ga.value);
      if (method) setGscMethod(method.value);
      if (code) setGscCode(code.value);
    }
  }, [settings]);

  // Upsert mutation
  const upsertMutation = useMutation({
    mutationFn: async (entries: { key: string; value: string }[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      for (const entry of entries) {
        const { error } = await supabase
          .from('site_integrations')
          .upsert(
            { key: entry.key, value: entry.value, updated_by: user?.id, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-integrations'] });
      toast({ title: 'Berhasil disimpan', description: 'Pengaturan integrasi telah diperbarui.' });
    },
    onError: (error: any) => {
      toast({ title: 'Gagal menyimpan', description: error.message, variant: 'destructive' });
    },
  });

  // Save GA
  const handleSaveGA = () => {
    if (gaId && !gaId.startsWith('G-')) {
      toast({ title: 'Format salah', description: 'Measurement ID harus diawali dengan "G-"', variant: 'destructive' });
      return;
    }
    upsertMutation.mutate([{ key: 'ga_measurement_id', value: gaId }]);
  };

  // Save GSC
  const handleSaveGSC = () => {
    upsertMutation.mutate([
      { key: 'gsc_method', value: gscMethod },
      { key: 'gsc_verification_code', value: gscCode },
    ]);
  };

  // Test GA
  const handleTestGA = () => {
    const gtagExists = typeof (window as any).gtag === 'function';
    const scriptExists = !!document.getElementById('ga-gtag-script');
    setGaTestResult(gtagExists && scriptExists ? 'success' : 'error');
  };

  // Test GSC
  const handleTestGSC = () => {
    const meta = document.querySelector('meta[name="google-site-verification"]');
    setGscTestResult(meta ? 'success' : 'error');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground">Kelola integrasi Google Analytics & Search Console</p>
      </div>

      {/* Google Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle>Google Analytics</CardTitle>
          </div>
          <CardDescription>
            Hubungkan Google Analytics untuk melacak traffic website secara otomatis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ga-id">Measurement ID</Label>
            <Input
              id="ga-id"
              placeholder="G-XXXXXXXXXX"
              value={gaId}
              onChange={e => setGaId(e.target.value.trim())}
            />
            <p className="text-xs text-muted-foreground">
              Temukan di Google Analytics → Admin → Data Streams → Measurement ID
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveGA} disabled={upsertMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Simpan
            </Button>
            <Button variant="outline" onClick={handleTestGA} disabled={!gaId}>
              <TestTube className="w-4 h-4 mr-2" />
              Test Integration
            </Button>
            {gaTestResult === 'success' && (
              <Badge className="bg-primary text-primary-foreground gap-1">
                <CheckCircle className="w-3 h-3" /> Aktif
              </Badge>
            )}
            {gaTestResult === 'error' && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="w-3 h-3" /> Tidak terdeteksi
              </Badge>
            )}
          </div>

          {gaTestResult === 'error' && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Script GA belum terdeteksi. Pastikan Measurement ID sudah disimpan dan refresh halaman.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Google Search Console */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <CardTitle>Google Search Console</CardTitle>
          </div>
          <CardDescription>
            Verifikasi kepemilikan website di Google Search Console.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Metode Verifikasi</Label>
            <Select value={gscMethod} onValueChange={setGscMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meta_tag">HTML Meta Tag (Recommended)</SelectItem>
                <SelectItem value="html_file">HTML File Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {gscMethod === 'meta_tag' && (
            <div className="space-y-2">
              <Label htmlFor="gsc-code">Verification Code</Label>
              <Input
                id="gsc-code"
                placeholder="Contoh: abc123def456..."
                value={gscCode}
                onChange={e => setGscCode(e.target.value.trim())}
              />
              <p className="text-xs text-muted-foreground">
                Copy hanya bagian <code className="bg-muted px-1 rounded">content="..."</code> dari meta tag yang diberikan Google.
              </p>
            </div>
          )}

          {gscMethod === 'html_file' && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                <strong>Metode HTML File</strong> tidak dapat dilakukan secara otomatis pada Single Page Application (SPA).
                Gunakan metode <strong>HTML Meta Tag</strong> sebagai gantinya — lebih mudah dan langsung aktif dari CMS.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveGSC} disabled={upsertMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Simpan
            </Button>
            <Button variant="outline" onClick={handleTestGSC} disabled={!gscCode || gscMethod !== 'meta_tag'}>
              <TestTube className="w-4 h-4 mr-2" />
              Test Integration
            </Button>
            {gscTestResult === 'success' && (
              <Badge className="bg-primary text-primary-foreground gap-1">
                <CheckCircle className="w-3 h-3" /> Terdeteksi
              </Badge>
            )}
            {gscTestResult === 'error' && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="w-3 h-3" /> Tidak terdeteksi
              </Badge>
            )}
          </div>

          {gscTestResult === 'error' && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Meta tag GSC belum terdeteksi. Pastikan verification code sudah disimpan dan refresh halaman.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CMSIntegrations;
