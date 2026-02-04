
# Plan: Ganti Endpoint AI ke Predicto Widget

## Ringkasan
Mengganti endpoint AI Companion dari edge function lokal (`openai-chat`) ke endpoint eksternal Predicto di `https://jfzjqdxqpqiayckjolpr.supabase.co/functions/v1/predicto-widget`.

---

## Perubahan yang Dilakukan

### File: `src/components/AICompanion.tsx`

**Lokasi perubahan:** Baris 9-10

**Sebelum:**
```typescript
// Use Lovable Cloud edge function URL
const OPENAI_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-chat`;
```

**Sesudah:**
```typescript
// Use external Predicto Widget endpoint
const PREDICTO_API_URL = 'https://jfzjqdxqpqiayckjolpr.supabase.co/functions/v1/predicto-widget';
```

### Perubahan Tambahan
1. Update nama variabel dari `OPENAI_CHAT_URL` ke `PREDICTO_API_URL` agar lebih deskriptif
2. Update referensi di function `callOpenAI` (baris 70) untuk menggunakan `PREDICTO_API_URL`
3. Hapus Authorization header karena endpoint eksternal mungkin tidak memerlukan token lokal

---

## Catatan Teknis

- Endpoint baru adalah server eksternal terpisah dari project ini
- Request format tetap sama (message + conversationHistory)
- Response diharapkan memiliki format yang sama ({ response: string } atau { success: boolean, error: string })
- Retry logic tetap dipertahankan untuk handle intermittent failures

---

## Estimasi Waktu
- Implementasi: 2-3 menit
- Testing: 2 menit
