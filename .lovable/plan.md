## Tujuan
1. Tambah tombol **Download PDF** langsung di card event (selain di popup).
2. Perbaiki PDF yang berantakan (emoji & karakter Unicode jadi `Ø<ßÆ`, `%P%P%`, spasi aneh).

## Akar masalah PDF
`jsPDF` saat ini pakai font core **Helvetica** yang hanya Latin-1. Emoji `📅`, em-dash `—`, smart quotes, bullet `•`, dan karakter non-ASCII pada deskripsi event jadi glyph rusak.

## Perubahan

### 1. `public/fonts/Inter-Regular.ttf` & `Inter-Bold.ttf` (file baru)
Static TTF Inter (OFL) di-download ke `public/fonts/`. Di-fetch on-demand saat user klik tombol PDF (tidak masuk bundle JS).

### 2. `src/lib/eventPdf.ts` (rewrite font handling)
- `ensureFonts()`: fetch kedua TTF → base64 (cached module-level).
- `registerFonts(doc)`: `addFileToVFS` + `addFont('Inter', 'normal' | 'bold')`.
- Ganti semua `setFont('helvetica', …)` → `setFont('Inter', …)`.
- `sanitize(text)`: NFC normalize + strip emoji/pictograph range (`U+1F300–1FAFF`, `U+2600–27BF`, VS16, ZWJ) sebagai safety net. Em-dash, smart quotes, bullet dipertahankan karena Inter mendukungnya.
- Layout dipoles: line-height deskripsi 5.6mm, label "Periode:" tanpa emoji 📅 (sudah jelas), background dark & header repaint tiap halaman baru, footer `bolakami.com` + `Halaman x / y`.

### 3. `src/components/EventCard.tsx`
Tambah tombol "Download PDF" di action area card (di bawah "Salin Link"), kondisi `hasDescription`, dengan `stopPropagation` agar tidak membuka popup. Tombol di popup tetap ada.

## Tidak diubah
DB, edge function, CMS, design tokens, copy.
