## Goal
Tiga perbaikan pada fitur Event:

1. **Image popup ikut di-scroll** (bukan sticky).
2. **Link share ke FB pakai title pendek** = nama event (bukan deskripsi panjang).
3. **Semua banner event di-convert ke WebP otomatis saat upload** supaya cepat load.

---

## 1. Image popup scroll bareng konten

File: `src/components/EventCard.tsx` — `DialogContent`.

Sekarang banner pakai `shrink-0`, header `shrink-0`, deskripsi `flex-1 overflow-y-auto` (banner tetap, hanya deskripsi yang scroll).

Ubah jadi: **satu container scroll tunggal** yang berisi banner + header + deskripsi. Action buttons tetap sticky di bawah.

Struktur baru:
```
DialogContent (flex flex-col)
 ├─ <div className="flex-1 overflow-y-auto">   ← satu scroll area
 │    ├─ Banner (tidak shrink-0, ikut scroll, max-h-none di mobile)
 │    ├─ Header (padding responsif)
 │    └─ Description
 └─ Action buttons (shrink-0, border-t)        ← tetap di bawah
```

Banner pakai `w-full h-auto object-contain`, hilangkan `max-h-[30vh]/[45vh]`. Biar tinggi natural sesuai aspect, dan saat user scroll, banner naik ke atas.

## 2. Title pendek untuk share link (Facebook OG)

Sekarang `EventCard` copy link `/event?id=...`. FB crawler tidak eksekusi JS, jadi tarik OG dari `index.html` (title generik "BOLAKAMI - Portal Berita Sepak Bola Indonesia"). Tidak sesuai keinginan.

Solusi (mengikuti pattern artikel via `ShareRedirect` + edge function `og-metadata`):

a. **Edge function baru** `supabase/functions/event-og-metadata/index.ts`:
   - Param `?id=<eventId>`.
   - Query `events` table: `name`, `banner_url`, `description`.
   - Return HTML dengan:
     - `<title>{event.name}</title>` (pendek = nama event)
     - `og:title` = `event.name`
     - `og:description` = potong deskripsi 160 char
     - `og:image` = `banner_url`
     - `og:url` = `https://bolakami.com/event?id=<id>`
   - Setelah tag OG, `<meta http-equiv="refresh" content="0;url=https://bolakami.com/event?id=<id>">` + JS `location.replace` agar user langsung redirect ke halaman event.

b. **Route share baru** di `src/App.tsx`: `/share/event/:id` → komponen `ShareEventRedirect` (mirip `ShareRedirect.tsx`) yang redirect browser ke edge function URL.

c. **`EventCard.tsx` `shareUrl`** diubah ke `${origin}/share/event/${event.id}` agar saat dipaste di FB, FB hit edge function dan dapat OG title nama event.

d. **`Event.tsx`** tambahkan dynamic `Helmet` `<title>` ketika `?id=` ada di URL (untuk browser tab — bukan untuk FB). Pakai `useSearchParams`, fetch event by id, set title `{event.name} - BOLAKAMI`.

## 3. Auto-convert banner upload → WebP

File: `src/pages/cms/CMSEvents.tsx`, fungsi `uploadBanner` + `handleFileChange`.

Tambah helper `convertToWebp(file: File, quality = 0.85): Promise<File>` di `src/lib/utils.ts` (atau file baru `src/lib/imageConvert.ts`):
- Buat `Image` dari `URL.createObjectURL(file)`.
- Draw ke `OffscreenCanvas` / `<canvas>` sesuai dimensi asli.
- `canvas.toBlob(blob => ..., 'image/webp', quality)`.
- Return `File` baru dengan extension `.webp` dan `type: 'image/webp'`.
- Fallback: jika file sudah `image/webp` atau browser tidak support, return as-is.

Di `handleFileChange`: setelah validasi, panggil `convertToWebp(file)` → set hasil sebagai `bannerFile`. Update toast info "Dikonversi ke WebP" opsional.

Di `uploadBanner`: pakai ekstensi `webp` saat generate path.

**Scope:** sesuai permintaan "semua image yang diinput" — terapkan juga ke banner uploader lain yang sejenis: `CMSFooterBanners.tsx`, `CMSSidebarBanners.tsx`, `CMSAdvertise.tsx`, `CMSMoments.tsx`. (Artikel/RichTextEditor di-skip karena bisa kompleks; bisa dikerjakan terpisah jika diinginkan.)

---

## Files to change

- `src/components/EventCard.tsx` — restructure dialog jadi single-scroll area.
- `src/pages/Event.tsx` — dynamic Helmet title saat `?id=`.
- `src/pages/ShareEventRedirect.tsx` (baru) — redirect ke edge function.
- `src/App.tsx` — route `/share/event/:id`.
- `supabase/functions/event-og-metadata/index.ts` (baru) — server-side OG.
- `supabase/config.toml` — register function (verify_jwt = false).
- `src/lib/imageConvert.ts` (baru) — helper convert WebP.
- `src/pages/cms/CMSEvents.tsx` — pakai convert WebP.
- `src/pages/cms/CMSFooterBanners.tsx`, `CMSSidebarBanners.tsx`, `CMSAdvertise.tsx`, `CMSMoments.tsx` — pakai convert WebP.

Tidak ada perubahan DB schema.
