## Tujuan

Hilangkan duplikasi menu "Analytics" dan "Analytics GA4" di sidebar CMS. Sisakan satu menu **Analytics** saja, tapi tambahkan **dropdown switcher domain** di dalamnya:
- **bolakami.news** (data existing — tetap berfungsi seperti sekarang)
- **bolakami.com** (property GA4 baru, akan Anda inject Property ID-nya)

## Analisa logic saat ini

1. Ada 2 file halaman yang hampir identik:
   - `src/pages/cms/CMSAnalytics.tsx` → menu "Analytics"
   - `src/pages/cms/CMSAnalyticsGA4.tsx` → menu "Analytics GA4"
   - Keduanya memanggil edge function yang sama: `ga4-analytics`
   - Bedanya hanya: versi GA4 punya tombol refresh + badge property ID; versi Analytics punya stats artikel internal.
   - **Yang dipertahankan: `CMSAnalytics.tsx`** (lebih lengkap, sudah ada stats artikel + top articles dari DB).

2. Edge function `supabase/functions/ga4-analytics/index.ts` saat ini:
   - Membaca `GA4_PROPERTY_ID` dari env (single property, hardcoded ke 1 domain).
   - Menerima body `{ days }` saja.
   - Belum support pemilihan property per request.

3. Sidebar `CMSLayout.tsx` punya 2 entri menu (baris 54 & 55) — salah satunya akan dihapus.

4. Route di `App.tsx` punya `/cms/analytics` dan `/cms/analytics-ga4` — yang `analytics-ga4` akan dihapus.

5. Index re-export `src/pages/cms/index.ts` punya `CMSAnalyticsGA4` — akan dihapus.

## Plan implementasi

### 1. Hapus halaman duplikat
- **Delete** `src/pages/cms/CMSAnalyticsGA4.tsx`
- **Edit** `src/pages/cms/index.ts` → hapus baris export `CMSAnalyticsGA4`
- **Edit** `src/App.tsx` → hapus import `CMSAnalyticsGA4` dan route `analytics-ga4`
- **Edit** `src/pages/cms/CMSLayout.tsx` → hapus item menu `Analytics GA4` (baris 55), hapus import `Activity` jika sudah tidak dipakai

### 2. Update edge function `ga4-analytics` untuk multi-property
- Tambah secret baru: **`GA4_PROPERTY_ID_COM`** (untuk bolakami.com). `GA4_PROPERTY_ID` existing tetap untuk bolakami.news.
- Edge function terima param body baru: `{ days, domain }` di mana `domain` = `"news"` (default, backward compatible) atau `"com"`.
- Pemilihan property:
  ```
  domain === 'com' → GA4_PROPERTY_ID_COM
  domain === 'news' (default) → GA4_PROPERTY_ID
  ```
- Validasi: kalau property ID untuk domain yang diminta belum di-set → return 400 dengan pesan jelas (`"Property ID untuk bolakami.com belum dikonfigurasi"`).
- Service account yang sama harus diberi akses **Viewer** di GA4 property bolakami.com. Saya akan ingatkan di pesan setelah deploy.

### 3. Tambah dropdown domain di `CMSAnalytics.tsx`
- State baru: `const [domain, setDomain] = useState<'news' | 'com'>('news')`.
- UI dropdown pakai komponen `Select` dari `@/components/ui/select` di header, di sebelah tombol range hari:
  ```text
  [ Domain: bolakami.news ▼ ]   [ 7d ] [ 30d ] [ 90d ]
  ```
- React Query key di-include `domain`: `queryKey: ['ga4-report', days, domain]` supaya ganti domain → fetch ulang.
- Kirim `domain` ke edge function: `body: { days, domain }`.
- Header halaman tampilkan domain aktif di subtitle: `Data pengunjung GA4 untuk {domain === 'com' ? 'bolakami.com' : 'bolakami.news'}`.
- Internal article stats (Berita Dipublish 7/30 hari, Top Articles dari DB) tetap ditampilkan apa adanya — tidak terpengaruh dropdown karena memang dari database internal yang sama.

### 4. Request secret baru
Setelah perubahan kode siap, saya akan minta Anda input secret **`GA4_PROPERTY_ID_COM`** (numeric Property ID GA4 untuk bolakami.com) via tool add_secret.

## File yang akan diubah / dihapus

| Aksi | File |
|------|------|
| Delete | `src/pages/cms/CMSAnalyticsGA4.tsx` |
| Edit | `src/pages/cms/index.ts` |
| Edit | `src/App.tsx` |
| Edit | `src/pages/cms/CMSLayout.tsx` |
| Edit | `src/pages/cms/CMSAnalytics.tsx` |
| Edit | `supabase/functions/ga4-analytics/index.ts` |
| Add secret | `GA4_PROPERTY_ID_COM` (akan diminta setelah konfirmasi) |

## Hasil akhir

- Sidebar hanya punya 1 menu **Analytics**.
- Di halaman Analytics ada dropdown domain → bisa toggle bolakami.news ↔ bolakami.com.
- Data bolakami.news tetap jalan tanpa perubahan (default).
- Data bolakami.com aktif setelah Anda input Property ID baru + beri akses service account ke property tersebut.
- Tidak ada breaking change untuk data existing.

Konfirmasi untuk lanjut eksekusi.