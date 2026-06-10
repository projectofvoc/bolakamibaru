## Perbaikan: TTF font rusak → jsPDF crash

### Akar masalah
`public/fonts/Inter-Regular.ttf` & `Inter-Bold.ttf` saat ini berisi **HTML halaman GitHub**, bukan binary TTF. Verifikasi: 100 byte pertama `<!DOCTYPE html>...`. URL `github.com/.../raw/...` mengembalikan viewer HTML. Akibat: `jsPDF.addFont` gagal parse → `text()` crash → PDF tidak tersimpan.

### Eksekusi
1. **Re-download TTF** dari jsDelivr (CDN raw asli):
   - `https://cdn.jsdelivr.net/gh/rsms/inter@v4.0/docs/font-files/Inter-Regular.ttf`
   - `https://cdn.jsdelivr.net/gh/rsms/inter@v4.0/docs/font-files/Inter-Bold.ttf`
   - Verifikasi magic byte `00 01 00 00` (TrueType). Fallback ke release zip Inter 4.0 jika gagal.

2. **Upload ke Lovable Assets** (font binary tidak masuk repo): `lovable-assets create --file public/fonts/Inter-Regular.ttf > public/fonts/Inter-Regular.ttf.asset.json` (idem bold), lalu `rm` file TTF. `eventPdf.ts` fetch dari `inter[Regular|Bold].url`.

3. **Guard di `src/lib/eventPdf.ts`**:
   - Validasi 4 byte pertama TTF (`00 01 00 00` atau `OTTO`) sebelum register; throw jika invalid.
   - Tangkap error & lempar ke caller dengan pesan jelas.

4. **Guard di `src/components/EventCard.tsx`**:
   - Bungkus `downloadEventPdf(event)` di `try/catch` + `toast` error agar user dapat feedback bila gagal.

### Tidak diubah
Layout PDF, tombol UI, komponen lain.
