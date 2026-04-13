

## Fix: Telegram "TOPIC_CLOSED" Error

### Problem
Grup Telegram yang digunakan mengaktifkan fitur **Forum/Topics**. Topic "General" ditutup, sehingga bot tidak bisa mengirim pesan tanpa menentukan topic tujuan. Telegram mengembalikan error `Bad Request: TOPIC_CLOSED`.

### Solution
Tambahkan field `message_thread_id` di settings agar admin bisa menentukan topic tujuan di grup Forum.

### Changes

**1. Database Migration**
- Tambah kolom `message_thread_id` (text, nullable) di `bot_sender_settings`

```sql
ALTER TABLE public.bot_sender_settings
  ADD COLUMN message_thread_id text;
```

**2. Edge Function: `supabase/functions/bot-send-article/index.ts`**
- Tambahkan `message_thread_id` ke semua request `sendMessage` dan `sendPhoto`
- Jika `message_thread_id` ada di settings, sertakan di body request Telegram API

```text
// Di setiap fetch sendMessage/sendPhoto:
body: {
  chat_id: chatId,
  message_thread_id: settings.message_thread_id ? Number(settings.message_thread_id) : undefined,
  ...
}
```

**3. Frontend: `src/pages/cms/CMSBotSender.tsx`**
- Tambah field input "Message Thread ID / Topic ID" di section Provider Configuration
- Tambah keterangan: "Wajib diisi jika grup menggunakan Forum/Topics. Kosongkan jika grup biasa."

### Cara Mendapatkan Topic ID
Admin bisa mendapatkan `message_thread_id` dari URL topic di Telegram Desktop/Web. Contoh URL: `https://t.me/c/1234567890/123` — angka terakhir (`123`) adalah topic ID.

### File Summary

| File | Action |
|------|--------|
| DB migration | Add `message_thread_id` column |
| `bot-send-article/index.ts` | Include `message_thread_id` in all Telegram requests |
| `CMSBotSender.tsx` | Add Topic ID input field |

