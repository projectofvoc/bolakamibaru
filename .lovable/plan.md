## Tujuan

Menambahkan **section/halaman baru** di CMS bernama **"Analytics GA4"** (terpisah dari menu "Analytics" yang sudah ada), yang menampilkan dashboard GA4 secara otomatis menggunakan service account global yang sudah dikonfigurasi (`GA4_SERVICE_ACCOUNT_JSON` + `GA4_PROPERTY_ID`).

Konteks: User sudah punya email service account dan Property ID `534103475`, dan service account sudah ditambahkan sebagai Viewer di GA4 Property.

## Yang akan dibuat

### 1. Halaman baru: `src/pages/cms/CMSAnalyticsGA4.tsx`
Halaman dashboard GA4 yang:
- Auto-load saat halaman dibuka (tidak perlu klik tombol)
- Memanggil edge function `ga4-analytics` (sudah deployed) via `supabase.functions.invoke`
- Menampilkan:
  - Badge status koneksi (Connected/Error) + Property ID
  - Range selector: 7 / 30 / 90 hari
  - 4 metric cards: Users, Sessions, Pageviews, Avg Duration
  - Line chart pengunjung harian (users + pageviews)
  - Tabel Top Pages & Traffic Sources
  - Tabel Devices & Top Countries
  - Tombol Refresh manual
- Refetch otomatis setiap 5 menit
- Error state jelas (mis. PERMISSION_DENIED → instruksi singkat menambahkan service account ke Property)

Catatan: file ini pada dasarnya versi "GA4-only" dari `CMSAnalytics.tsx` saat ini — tapi sebagai halaman terpisah agar menu "Analytics" lama (yang juga punya stats internal artikel) tidak terganggu.

### 2. Registrasi halaman
- `src/pages/cms/index.ts` → export `CMSAnalyticsGA4`
- `src/App.tsx` → tambah route `/cms/analytics-ga4` di dalam `<Route path="/cms">`
- `src/pages/cms/CMSLayout.tsx` → tambah item menu sidebar:
  - Title: **Analytics GA4**
  - URL: `/cms/analytics-ga4`
  - Icon: `LineChart` (atau `Activity`) dari `lucide-react` agar beda dari `BarChart3` milik "Analytics" lama
  - Letakkan tepat di bawah item "Analytics" di grup KONTEN

### 3. Tidak ada perubahan backend
Edge function `ga4-analytics` sudah siap dan secrets sudah ada. Tidak ada migration.

## Yang TIDAK diubah
- Halaman `CMSAnalytics.tsx` lama tetap ada apa adanya (masih bisa diakses di `/cms/analytics`)
- Edge function & secrets tidak disentuh

## Konfirmasi yang dibutuhkan
Sesuai instruksi workspace (NO FIX BEFORE ASK AND FINAL CONFIRMATIONS), mohon konfirmasi:
1. Setuju membuat halaman **baru terpisah** (`/cms/analytics-ga4`), bukan menggantikan menu "Analytics" lama?
2. Setuju label menu sidebar = **"Analytics GA4"**?

Setelah disetujui, saya implementasikan langsung.