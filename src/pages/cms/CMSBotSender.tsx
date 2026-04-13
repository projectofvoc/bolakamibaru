import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, Wifi, WifiOff, Save, Loader2, CheckCircle, XCircle } from 'lucide-react';

const CMSBotSender = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTesting, setIsTesting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [form, setForm] = useState({
    is_enabled: false,
    auto_send_on_publish: true,
    allow_manual_send: true,
    provider_name: 'telegram',
    bot_token: '',
    api_key: '',
    secret_key: '',
    endpoint_url: '',
    destination_id: '',
    message_thread_id: '',
    default_template: '📰 {title}\n\n{excerpt}\n\n🔗 Baca selengkapnya:\n{article_url}',
    fallback_image_url: '',
    send_mode: 'photo_caption',
    parse_mode: 'HTML',
    use_fallback_image: true,
    retry_enabled: true,
    max_retry_count: 3,
    retry_delay_seconds: 30,
    request_timeout_seconds: 30,
    send_without_image: true,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['bot-sender-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bot_sender_settings')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setForm({
        is_enabled: settings.is_enabled,
        auto_send_on_publish: settings.auto_send_on_publish,
        allow_manual_send: settings.allow_manual_send,
        provider_name: settings.provider_name,
        bot_token: settings.bot_token || '',
        api_key: settings.api_key || '',
        secret_key: settings.secret_key || '',
        endpoint_url: settings.endpoint_url || '',
        destination_id: settings.destination_id || '',
        message_thread_id: (settings as any).message_thread_id || '',
        default_template: settings.default_template || '',
        fallback_image_url: settings.fallback_image_url || '',
        send_mode: settings.send_mode,
        parse_mode: settings.parse_mode,
        use_fallback_image: settings.use_fallback_image,
        retry_enabled: settings.retry_enabled,
        max_retry_count: settings.max_retry_count,
        retry_delay_seconds: settings.retry_delay_seconds,
        request_timeout_seconds: settings.request_timeout_seconds,
        send_without_image: settings.send_without_image,
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!settings?.id) throw new Error('No settings found');
      const { error } = await supabase
        .from('bot_sender_settings')
        .update(form)
        .eq('id', settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-sender-settings'] });
      toast({ title: 'Settings berhasil disimpan!' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // Save first so edge function has latest config
      if (settings?.id) {
        await supabase.from('bot_sender_settings').update(form).eq('id', settings.id);
      }
      const { data, error } = await supabase.functions.invoke('bot-send-article', {
        body: { action: 'test_connection' },
      });
      if (error) throw error;
      if (data.success) {
        setTestResult({ success: true, message: `✅ Terhubung ke bot: @${data.bot_username} (${data.bot_name})` });
      } else {
        setTestResult({ success: false, message: `❌ Gagal: ${data.error}` });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `❌ Error: ${err.message}` });
    }
    setIsTesting(false);
  };

  const handleTestMessage = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      if (settings?.id) {
        await supabase.from('bot_sender_settings').update(form).eq('id', settings.id);
      }
      const { data, error } = await supabase.functions.invoke('bot-send-article', {
        body: { action: 'test_message' },
      });
      if (error) throw error;
      if (data.success) {
        setTestResult({ success: true, message: '✅ Test message berhasil dikirim!' });
      } else {
        setTestResult({ success: false, message: `❌ Gagal: ${data.error}` });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `❌ Error: ${err.message}` });
    }
    setIsSendingTest(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="w-6 h-6" /> Bot Sender
          </h1>
          <p className="text-muted-foreground">Kirim berita otomatis ke channel/grup saat publish</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Settings
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Aktifkan atau nonaktifkan fitur bot sender</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Bot Sender</Label>
              <p className="text-sm text-muted-foreground">Aktifkan fitur pengiriman berita via bot</p>
            </div>
            <Switch checked={form.is_enabled} onCheckedChange={(v) => setForm(p => ({ ...p, is_enabled: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Send on Publish</Label>
              <p className="text-sm text-muted-foreground">Kirim otomatis saat artikel dipublish</p>
            </div>
            <Switch checked={form.auto_send_on_publish} onCheckedChange={(v) => setForm(p => ({ ...p, auto_send_on_publish: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Manual Send</Label>
              <p className="text-sm text-muted-foreground">Izinkan pengiriman manual dari daftar artikel</p>
            </div>
            <Switch checked={form.allow_manual_send} onCheckedChange={(v) => setForm(p => ({ ...p, allow_manual_send: v }))} />
          </div>
        </CardContent>
      </Card>

      {/* Provider Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Configuration</CardTitle>
          <CardDescription>Konfigurasi bot dan tujuan pengiriman</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={form.provider_name} onValueChange={(v) => setForm(p => ({ ...p, provider_name: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="custom">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bot Token *</Label>
              <Input type="password" placeholder="123456:ABC-DEF..." value={form.bot_token} onChange={(e) => setForm(p => ({ ...p, bot_token: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Chat ID / Channel ID *</Label>
              <Input placeholder="-1001234567890 atau @channelname" value={form.destination_id} onChange={(e) => setForm(p => ({ ...p, destination_id: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Message Thread ID / Topic ID</Label>
              <Input placeholder="123" value={form.message_thread_id} onChange={(e) => setForm(p => ({ ...p, message_thread_id: e.target.value }))} />
              <p className="text-xs text-muted-foreground">Wajib diisi jika grup menggunakan Forum/Topics. Kosongkan jika grup biasa. Dapatkan dari URL topic: https://t.me/c/.../123 → angka terakhir.</p>
            </div>
            <div className="space-y-2">
              <Label>Endpoint URL (opsional)</Label>
              <Input placeholder="Custom endpoint URL" value={form.endpoint_url} onChange={(e) => setForm(p => ({ ...p, endpoint_url: e.target.value }))} />
              <p className="text-xs text-muted-foreground">Kosongkan untuk Telegram default</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Message Settings</CardTitle>
          <CardDescription>Atur format dan template pesan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Message Template</Label>
            <Textarea
              rows={5}
              value={form.default_template}
              onChange={(e) => setForm(p => ({ ...p, default_template: e.target.value }))}
              placeholder="📰 {title}..."
            />
            <p className="text-xs text-muted-foreground">
              Variabel: {'{title}'}, {'{excerpt}'}, {'{article_url}'}, {'{published_at}'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Send Mode</Label>
              <Select value={form.send_mode} onValueChange={(v) => setForm(p => ({ ...p, send_mode: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo_caption">Gambar + Caption</SelectItem>
                  <SelectItem value="text_only">Text Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Parse Mode</Label>
              <Select value={form.parse_mode} onValueChange={(v) => setForm(p => ({ ...p, parse_mode: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HTML">HTML</SelectItem>
                  <SelectItem value="Markdown">Markdown</SelectItem>
                  <SelectItem value="MarkdownV2">MarkdownV2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fallback Image URL</Label>
            <Input placeholder="https://..." value={form.fallback_image_url} onChange={(e) => setForm(p => ({ ...p, fallback_image_url: e.target.value }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Gunakan Fallback Image</Label>
              <p className="text-sm text-muted-foreground">Pakai fallback jika featured image kosong</p>
            </div>
            <Switch checked={form.use_fallback_image} onCheckedChange={(v) => setForm(p => ({ ...p, use_fallback_image: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Kirim Tanpa Gambar</Label>
              <p className="text-sm text-muted-foreground">Tetap kirim teks jika tidak ada gambar</p>
            </div>
            <Switch checked={form.send_without_image} onCheckedChange={(v) => setForm(p => ({ ...p, send_without_image: v }))} />
          </div>
        </CardContent>
      </Card>

      {/* Retry & Delivery */}
      <Card>
        <CardHeader>
          <CardTitle>Retry & Delivery</CardTitle>
          <CardDescription>Pengaturan retry dan timeout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Retry Otomatis</Label>
              <p className="text-sm text-muted-foreground">Coba ulang otomatis jika gagal</p>
            </div>
            <Switch checked={form.retry_enabled} onCheckedChange={(v) => setForm(p => ({ ...p, retry_enabled: v }))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Max Retry</Label>
              <Input type="number" min={1} max={10} value={form.max_retry_count} onChange={(e) => setForm(p => ({ ...p, max_retry_count: parseInt(e.target.value) || 3 }))} />
            </div>
            <div className="space-y-2">
              <Label>Retry Delay (detik)</Label>
              <Input type="number" min={5} max={600} value={form.retry_delay_seconds} onChange={(e) => setForm(p => ({ ...p, retry_delay_seconds: parseInt(e.target.value) || 30 }))} />
            </div>
            <div className="space-y-2">
              <Label>Request Timeout (detik)</Label>
              <Input type="number" min={5} max={120} value={form.request_timeout_seconds} onChange={(e) => setForm(p => ({ ...p, request_timeout_seconds: parseInt(e.target.value) || 30 }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Tools</CardTitle>
          <CardDescription>Uji koneksi dan kirim pesan test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
              {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wifi className="w-4 h-4 mr-2" />}
              Test Connection
            </Button>
            <Button variant="outline" onClick={handleTestMessage} disabled={isSendingTest}>
              {isSendingTest ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Test Message
            </Button>
          </div>
          {testResult && (
            <div className={`p-3 rounded-lg border ${testResult.success ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'}`}>
              <div className="flex items-center gap-2">
                {testResult.success ? <CheckCircle className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-destructive" />}
                <span className="text-sm">{testResult.message}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CMSBotSender;
