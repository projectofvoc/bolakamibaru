
## Plan: Auto-Linkify URL di Detail & Syarat

Saat ini `event.description` dirender sebagai plain text (`whitespace-pre-line`), sehingga URL seperti `https://mediavault.ink/s/YLu8hR` atau `a.lwn25.com/register?referral=markasbola` tampil sebagai teks biasa (hanya ada highlight visual karena seleksi/format lain). Plan: deteksi otomatis URL pada deskripsi dan render sebagai `<a>` clickable dengan warna hijau brand (`text-primary` = `#4ade80`).

### File yang diubah
- **`src/pages/EventDetail.tsx`** — ganti render `{event.description}` dengan komponen/util yang melakukan linkify.
- **`src/lib/linkify.tsx`** (baru) — util kecil `linkifyText(text)` yang mengembalikan `ReactNode[]`.

### Detail perubahan

1. **Buat `src/lib/linkify.tsx`**
   - Export `linkifyText(text: string): ReactNode[]`.
   - Regex deteksi:
     - URL lengkap: `https?://[^\s]+`
     - URL tanpa skema (mis. `a.lwn25.com/...`, `mediavault.ink/...`): pola domain `([a-z0-9-]+\.)+[a-z]{2,}(/[^\s]*)?` (case-insensitive).
   - Trim trailing punctuation umum (`.,;:!?)]}`) dari match agar tanda baca tidak ikut jadi link.
   - Untuk match tanpa skema, tambahkan `https://` saat membentuk `href`.
   - Kembalikan array bercampur string + `<a key target="_blank" rel="noopener noreferrer nofollow" class="text-primary hover:text-primary/80 underline underline-offset-2 break-all">`.

2. **Update `src/pages/EventDetail.tsx`**
   - Import `linkifyText`.
   - Ganti:
     ```tsx
     <div className="... whitespace-pre-line ...">{event.description}</div>
     ```
     menjadi render hasil `linkifyText(event.description)`. Pertahankan `whitespace-pre-line` agar newline tetap dihormati (linkify hanya mengganti URL, sisa string apa adanya termasuk `\n`).

3. **Warna brand hijau**
   - Gunakan token `text-primary` (sudah = `#4ade80` sesuai core memory). Tidak menambah warna baru, tidak mengubah `index.css`/`tailwind.config.ts`.

### Tidak diubah
- Tidak menyentuh CMS editor, DB, schema, PDF generator, share link, atau komponen lain.
- Tidak mengubah copy/teks event.
- Hanya layer presentasi di halaman EventDetail.

### Catatan teknis
- Pendekatan regex + split lebih ringan daripada menambah dependency (`linkify-react`, dll).
- `break-all` mencegah URL panjang merusak layout mobile.
- Berlaku otomatis untuk **semua event** karena single render path.
