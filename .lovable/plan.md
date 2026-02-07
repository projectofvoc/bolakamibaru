
# Plan: Fix Publishing dan Translation Issues

## Masalah yang Ditemukan

### 1. Edge Function `translate-article` Tidak Ter-Deploy
Dari analisis logs dan testing:
- Request ke `/translate-article` mengembalikan **404 Not Found**
- Edge function tidak ter-deploy ke Supabase
- Setelah saya deploy ulang, function sudah berfungsi dengan baik (status 200)

### 2. CORS Headers Belum Lengkap
CORS headers saat ini kurang lengkap yang dapat menyebabkan preflight request gagal di browser:

```text
SEBELUM:
'authorization, x-client-info, apikey, content-type'

SESUDAH:
'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version'
```

---

## Solusi

### File: `supabase/functions/translate-article/index.ts`

**Perubahan baris 3-6:**

```typescript
// SEBELUM
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SESUDAH
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};
```

---

## Status Saat Ini

Saya sudah:
1. **Deploy ulang** edge function `translate-article`
2. **Test** function dengan curl - hasilnya **200 OK** dan terjemahan berhasil

Hasil test:
```json
{
  "content_en": "<p>Test news content regarding a football match</p>",
  "excerpt_en": "News summary test",
  "title_en": "Football news title test"
}
```

---

## Langkah Implementasi

1. Update CORS headers di `supabase/functions/translate-article/index.ts`
2. Re-deploy edge function
3. Test publish artikel dari CMS

---

## Estimasi Waktu
- Implementasi: 1-2 menit
- Testing: 1 menit
