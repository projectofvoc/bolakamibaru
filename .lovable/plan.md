## Plan: Tambah Icon Salin di Detail & Syarat

Tambah tombol icon "Copy" di pojok kanan atas section **Detail & Syarat** pada halaman Event Detail. Tombol ini akan menyalin isi deskripsi event (`event.description`) ke clipboard, dengan feedback toast & icon berubah jadi centang sementara (pola sama seperti tombol "Salin Link" yang sudah ada).

### File yang diubah
- `src/pages/EventDetail.tsx`

### Detail perubahan
1. Tambah state baru `descCopied` (boolean) + handler `handleCopyDescription()` yang:
   - `navigator.clipboard.writeText(event.description)`
   - Tampilkan toast sukses ("Detail event disalin")
   - Set `descCopied=true` lalu reset setelah ~1.8 detik
2. Pada `<section>` Detail & Syarat:
   - Bungkus heading + tombol dalam flex header (`flex items-center justify-between`)
   - Tambah `<button>` ghost di kanan dengan icon `Copy` (atau `Check` saat tersalin) dari lucide-react, ukuran `w-4 h-4`, dengan `aria-label` & `title` "Salin detail"
3. Tidak ada perubahan ke komponen lain, tidak ada perubahan database/skema.

### Catatan
- Berlaku untuk **semua event** karena section ini dirender dari satu komponen `EventDetail.tsx`.
- Tidak mengubah PDF, share link, atau layout lain.
