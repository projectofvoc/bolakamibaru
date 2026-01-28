
## Rencana: Fix OG Metadata untuk Social Share

### Analisis Masalah

Dari screenshot Telegram dan WhatsApp terlihat:
- **URL sudah benar**: `bolakamibaru.lovable.app/share/...` 
- **OG Preview salah**: Menampilkan metadata homepage bukan artikel

Ini terjadi karena:
1. Crawler Telegram/WhatsApp **tidak menjalankan JavaScript**
2. Mereka membaca `index.html` yang berisi meta tags default homepage
3. Komponen `ShareRedirect.tsx` yang mengupdate meta tags berjalan di client-side setelah halaman load - sudah terlambat untuk crawler

### Solusi

Modifikasi `ShareRedirect.tsx` untuk **langsung redirect ke Edge Function** yang sudah ada, sehingga:

1. User tetap melihat URL profesional di chat: `bolakamibaru.lovable.app/share/slug-artikel`
2. Ketika diklik, browser langsung redirect ke Edge Function yang meng-generate HTML dengan OG tags yang benar
3. Edge Function kemudian redirect lagi ke halaman artikel sebenarnya

### Alur Kerja

```text
[User Share]
     ↓
bolakamibaru.lovable.app/share/slug-artikel  ← URL yang terlihat di chat
     ↓
[Redirect ke Edge Function]
     ↓
Edge Function → Generate HTML dengan OG Tags → Crawler baca OG Tags
     ↓
[Browser redirect ke artikel]
     ↓
bolakamibaru.lovable.app/news/slug-artikel  ← Halaman final
```

### File yang Dimodifikasi

| File | Aksi | Deskripsi |
|------|------|-----------|
| `src/pages/ShareRedirect.tsx` | Modify | Ubah dari client-side meta injection ke redirect Edge Function |

### Perubahan Code

**ShareRedirect.tsx** - Akan diubah menjadi sederhana:
- Ambil slug dari URL
- Langsung redirect ke Edge Function URL
- Tidak perlu fetch data atau set meta tags

```typescript
// Redirect langsung ke Edge Function untuk OG metadata
const edgeFunctionUrl = `https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/og-metadata?slug=${slug}`;
window.location.replace(edgeFunctionUrl);
```

### Hasil Akhir

**URL di Chat:**
```
https://bolakamibaru.lovable.app/share/harga-tiket-piala-dunia-2026
```
(Terlihat profesional, tidak ada URL Supabase yang terlihat)

**Saat Diklik:**
1. Browser redirect ke Edge Function
2. Edge Function generate OG HTML dengan judul/gambar artikel yang benar
3. Crawler baca OG tags
4. Browser redirect ke halaman artikel

**OG Preview di Telegram/WhatsApp:**
- Judul: Judul artikel yang benar
- Gambar: Featured image artikel
- Deskripsi: Excerpt artikel

### Catatan Teknis

- Edge Function sudah ada dan berfungsi dengan baik (`supabase/functions/og-metadata/index.ts`)
- Redirect ke Edge Function menggunakan `window.location.replace()` agar tidak menambah history entry
- Untuk optimasi kecepatan, redirect dilakukan seketika tanpa menunggu data apapun
