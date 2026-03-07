

## Plan: Deploy og-metadata ke Supabase Eksternal (`zmbawgfnrtspgdiqywzc`)

Supabase eksternal yang Anda berikan **sama** dengan yang sudah dipakai untuk Sportmonks API. Jadi tidak perlu setup project baru — tinggal deploy function tambahan ke project yang sudah ada.

---

### Perubahan yang Dilakukan (3 file saja, minimal impact)

#### 1. Buat `docs/external-edge-functions/og-metadata.ts` (file baru)

File dokumentasi + kode edge function siap deploy, mengikuti pola `sportmonks-api.ts`. Berisi:

- Kode `og-metadata` edge function yang **query ke Lovable Cloud database** menggunakan environment variable:
  - `LOVABLE_SUPABASE_URL` → `https://wqrvguxkanjuorntlmmx.supabase.co`
  - `LOVABLE_SERVICE_ROLE_KEY` → Service Role Key dari Lovable Cloud
- Step-by-step deploy instructions via Supabase CLI

```text
Koneksi data:
  Supabase Eksternal (zmbawgfnrtspgdiqywzc)
       │
       │  og-metadata edge function
       │  query articles menggunakan:
       │  - LOVABLE_SUPABASE_URL
       │  - LOVABLE_SERVICE_ROLE_KEY
       ▼
  Lovable Cloud DB (wqrvguxkanjuorntlmmx)
       │
       ▼
  Tabel articles (data tetap di sini)
```

#### 2. Update `src/pages/ShareRedirect.tsx` (1 baris)

- **Line 13**: Ganti URL dari `wqrvguxkanjuorntlmmx` → `zmbawgfnrtspgdiqywzc`

```
// Sebelum:
https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/og-metadata?slug=...

// Sesudah:
https://zmbawgfnrtspgdiqywzc.supabase.co/functions/v1/og-metadata?slug=...
```

#### 3. Update `src/pages/cms/CMSOGPreview.tsx` (1 baris)

- **Line 78**: Ganti `supabaseUrl` yang dipakai untuk Share URL dari `VITE_SUPABASE_URL` (Lovable Cloud) ke URL Supabase eksternal hardcoded

```
// Sebelum:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Sesudah:
const externalSupabaseUrl = 'https://zmbawgfnrtspgdiqywzc.supabase.co';
```

> Catatan: `supabase.from('articles')` di line 41 **tetap** menggunakan Lovable Cloud client — tidak berubah. Hanya URL untuk Share/Debugger yang diarahkan ke Supabase eksternal.

---

### Yang Perlu Anda Lakukan Setelah Implementasi

Deploy edge function ke Supabase eksternal via CLI:

1. **Set secrets** di Supabase eksternal:
   ```
   supabase secrets set LOVABLE_SUPABASE_URL=https://wqrvguxkanjuorntlmmx.supabase.co
   supabase secrets set LOVABLE_SERVICE_ROLE_KEY=<service_role_key_lovable_cloud>
   ```

2. **Copy** kode dari `docs/external-edge-functions/og-metadata.ts` ke folder lokal project Supabase eksternal

3. **Deploy**:
   ```
   supabase functions deploy og-metadata --project-ref zmbawgfnrtspgdiqywzc
   ```

---

### Yang TIDAK Berubah

- Edge function `og-metadata` di Lovable Cloud tetap ada (tidak dihapus) sebagai backup
- Database articles tetap di Lovable Cloud — tidak ada migrasi data
- Semua halaman lain (Index, Berita, NewsDetail, dll) tidak terpengaruh
- Hanya **2 file frontend** yang diubah, masing-masing 1 baris

