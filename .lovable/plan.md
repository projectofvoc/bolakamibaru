## Problem
Pada popup event, section deskripsi belum responsif di layar kecil (mobile). Banner mengambil porsi terlalu besar dan deskripsi sulit dibaca / area scroll-nya sempit.

## Fix
Edit `src/components/EventCard.tsx` pada `DialogContent`:

1. **DialogContent**
   - Ubah ukuran: `w-[95vw] sm:w-full max-w-3xl` + `h-[90vh] sm:max-h-[92vh] sm:h-auto` agar dialog penuh di mobile dan terbatas di desktop.

2. **Banner**
   - Mobile: `max-h-[30vh]`; desktop (sm:): `max-h-[45vh]`.
   - Tambahkan `object-contain` tetap, namun batasi tinggi agar deskripsi dapat porsi cukup.

3. **Header**
   - Padding responsif: `p-4 sm:p-6 sm:pb-3`.
   - Title: `text-xl sm:text-2xl`.

4. **Description**
   - Padding responsif: `px-4 sm:px-6 py-3 sm:py-4`.
   - Font: `text-sm sm:text-base`.
   - Tetap `flex-1 overflow-y-auto` agar deskripsi yang panjang scroll independen.

5. **Action buttons**
   - Padding: `p-3 sm:p-4`.
   - Sudah `flex-col sm:flex-row`, pertahankan.
   - Pastikan tombol `flex-1` di desktop, full-width di mobile.

Tidak ada perubahan DB, CMS, atau translation. Hanya tweak class Tailwind di satu file.

## Files
- `src/components/EventCard.tsx` (edit DialogContent saja)
