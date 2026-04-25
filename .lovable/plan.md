## Auto-Send Bot via Database Trigger (pg_net)

### Tujuan
Memastikan bot Telegram **selalu** terpicu setiap artikel berubah ke status `published`, dari mana pun (editor, list action, API, bulk). Solusi DB-level supaya tidak ada jalur publish yang lolos.

### Eksekusi (semua otomatis tanpa konfirmasi lagi)

| # | Aksi | Detail |
|---|---|---|
| 1 | **Migration**: enable `pg_net` | `CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;` |
| 2 | **Migration**: function `notify_bot_on_publish()` | `SECURITY DEFINER`, panggil edge function `bot-send-article` via `net.http_post` dengan body `{article_id: NEW.id}` dan header Authorization Bearer service-role key (di-hardcode di function body — function ini SECURITY DEFINER & hanya bisa di-execute oleh trigger, jadi aman) |
| 3 | **Migration**: trigger `trg_notify_bot_on_publish` | `AFTER INSERT OR UPDATE OF status ON public.articles` — fire saat `NEW.status='published'` AND `NEW.is_sent IS NOT TRUE` AND (TG_OP='INSERT' OR `OLD.status IS DISTINCT FROM NEW.status`) |
| 4 | **Edit** `supabase/functions/bot-send-article/index.ts` | Tambah pengecekan `settings.auto_send_on_publish` sebelum SEND ARTICLE — skip jika false **kecuali** `force=true` (manual send tetap jalan) |
| 5 | **Edit** `src/pages/cms/CMSArticleEditor.tsx` | Hapus blok `supabase.functions.invoke('bot-send-article', ...)` di onSuccess saveMutation supaya tidak dobel kirim |
| 6 | **Deploy** edge function `bot-send-article` | otomatis |
| 7 | **Verifikasi** | Query `article_send_logs` untuk pastikan trigger jalan |

### Cara Kerja Final
```
Publish artikel (mana pun jalurnya)
  → DB trigger fire (status=published & is_sent=false)
  → notify_bot_on_publish() → net.http_post
  → edge function bot-send-article
  → cek is_enabled & auto_send_on_publish
  → kirim Telegram → update is_sent=true, sent_at=now()
  → log ke article_send_logs
```

### Backfill
**Tidak dilakukan otomatis**. Admin kirim manual via tombol Send di CMS Articles untuk 10+ artikel lama.

### Mitigasi Risiko
- Double-send dicegah: filter `is_sent=false` di trigger + cek di edge function
- Manual send bypass: `force=true` melewati cek `auto_send_on_publish`
- Trigger gagal: cek `net._http_response` table