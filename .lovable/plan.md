## Goal
Tambah tombol **Download PDF** di action bar popup event. PDF berisi deskripsi event dengan desain warna brand BOLAKAMI (dark + accent hijau).

## Approach

Pakai **jsPDF** (client-side, ringan, tidak perlu edge function). Banner event di-embed sebagai gambar di header PDF.

### 1. Dependency
- `bun add jspdf` (sekitar 150 KB, sudah cukup untuk teks + image).

### 2. Helper baru: `src/lib/eventPdf.ts`
Export `downloadEventPdf(event)` yang:
- Buat A4 portrait, background dark `#0d0f14`.
- Header bar tinggi ~12mm warna primary `#4ade80` dengan teks "BOLAKAMI" putih bold + tagline kecil.
- Banner event (jika ada) di-load via `fetch` → blob → base64, lalu `doc.addImage` rasio 16:9 full-width margin (atau placeholder hijau jika gagal).
- Title event: font bold 18pt putih.
- Period: ikon kalender (text "📅") + range tanggal warna muted `#9ca3af`.
- Garis pemisah hijau tipis.
- Deskripsi: split per baris dengan `doc.splitTextToSize`, warna `#e5e7eb`, line-height nyaman. Auto page-break bila konten panjang — setiap page baru ulang background dark + footer.
- Footer setiap halaman: garis hijau + teks `bolakami.com` kiri, "Halaman X / Y" kanan, warna muted.
- File name: `event-${slugified(event.name)}.pdf`.

### 3. UI: `src/components/EventCard.tsx`
- Import `Download` dari `lucide-react` + helper baru.
- Tambah tombol di dialog action bar (di samping "Salin Link"):
  ```
  <Button variant="outline" className="flex-1" onClick={() => downloadEventPdf(event)}>
    <Download className="w-4 h-4 mr-2" /> {t('event.downloadPdf')}
  </Button>
  ```
- Tombol pakai variant `outline` agar konsisten dengan Salin Link; biar tidak terlalu sempit di mobile, gunakan `flex-col sm:flex-row` (sudah ada) — 4 tombol akan stack di mobile.

### 4. Translation (`src/contexts/LanguageContext.tsx`)
- `event.downloadPdf`: ID `Download PDF`, EN `Download PDF`.

## Files
- `src/lib/eventPdf.ts` — new (helper + brand layout).
- `src/components/EventCard.tsx` — tambah tombol & import.
- `src/contexts/LanguageContext.tsx` — translation key baru.
- `package.json` — `jspdf` dependency.

## Catatan
- Tidak perlu edge function / DB.
- Tombol hanya muncul jika `event.description` ada (untuk event tanpa deskripsi PDF kurang berguna). Jika kosong, tombol disembunyikan.
