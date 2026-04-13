

## Fix: Cek `auto_send_on_publish` Sebelum Kirim Otomatis

### Problem
Saat artikel dipublish, bot langsung mengirim tanpa mengecek setting `auto_send_on_publish`. Jika admin menonaktifkan auto-send di settings, bot tetap kirim.

### Solution
Tambahkan pengecekan `auto_send_on_publish` di `CMSArticleEditor.tsx` sebelum memanggil edge function. Fetch setting dari `bot_sender_settings` terlebih dahulu.

### Changes (1 file)

**`src/pages/cms/CMSArticleEditor.tsx` (lines 413-424)**

Ubah blok auto-send agar:
1. Query `bot_sender_settings` untuk cek `is_enabled` dan `auto_send_on_publish`
2. Hanya invoke edge function jika kedua setting bernilai `true`

```typescript
// Auto-send to bot if publishing
if (variables.status === 'published' && articleId) {
  // Check bot settings first
  supabase
    .from('bot_sender_settings')
    .select('is_enabled, auto_send_on_publish')
    .limit(1)
    .single()
    .then(({ data: botSettings }) => {
      if (!botSettings?.is_enabled || !botSettings?.auto_send_on_publish) return;
      
      supabase.functions.invoke('bot-send-article', {
        body: { article_id: articleId },
      }).then(({ data }) => {
        if (data?.success) {
          toast({ title: 'Berita dikirim ke bot!' });
        } else if (data?.error && !data?.skipped) {
          toast({ title: 'Bot sender', description: data.error, variant: 'destructive' });
        }
      }).catch(() => {});
    });
}
```

Tidak ada perubahan di edge function atau database. Hanya logic frontend yang diperbaiki.

