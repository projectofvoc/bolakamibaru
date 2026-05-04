## Tujuan

Tampilkan ringkasan grafik GA4 untuk **bolakami.news** dan **bolakami.com** secara berdampingan di halaman **Dashboard CMS** (`/cms`), tanpa mengganggu layout existing dan konsisten dengan style kartu yang sudah ada.

## Analisa logic

- Edge function `ga4-analytics` sudah support param `{ days, domain }` dengan `domain: 'news' | 'com'`. Tinggal panggil 2x — satu per domain.
- `CMSDashboard.tsx` sekarang punya 2 baris utama:
  1. 4 stat cards (Total Berita, Published, Total Views, Momen Aktif)
  2. Grid 2 kolom: Berita Terbaru + Ringkasan Status
- Kita tambahkan **section baru di bawah stat cards, di atas grid quick actions** → grid 2 kolom berisi 2 mini-chart card (one per domain). Posisi ini paling natural untuk overview.
- Style ikut komponen `Card` + `recharts LineChart` yang sudah dipakai di `CMSAnalytics.tsx` (warna `hsl(var(--primary))` untuk users, `#a78bfa` untuk pageviews) → konsisten.

## Plan implementasi

### 1. Buat komponen reusable `DomainAnalyticsCard`
File baru: `src/components/cms/DomainAnalyticsCard.tsx`

Props:
- `domain: 'news' | 'com'`
- `days?: number` (default 7 — supaya ringkas di dashboard)

Isi:
- `useQuery` dengan key `['ga4-dashboard-mini', domain, days]`, panggil `supabase.functions.invoke('ga4-analytics', { body: { days, domain }})`.
- Header card: judul `bolakami.{news|com}` + badge total Users (small).
- Body: mini line chart tinggi `h-40` pakai `report.daily` (Users + Pageviews), styling identik dengan chart di `CMSAnalytics`.
- 3 metric kecil di bawah chart: Users / Sessions / Pageviews (inline, text-xs).
- Loading state: `Loader2` spinner di tengah card.
- Error state: pesan kompak `text-destructive text-xs` (mis. "Akses GA4 belum dikonfigurasi" jika error mengandung "permission" atau "not configured"); jangan break dashboard.
- Empty state (jika `report` ada tapi `daily` kosong): teks "Belum ada data".

### 2. Edit `src/pages/cms/CMSDashboard.tsx`
- Import `DomainAnalyticsCard`.
- Tambahkan section setelah grid stat cards:
  ```text
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <DomainAnalyticsCard domain="news" />
    <DomainAnalyticsCard domain="com" />
  </div>
  ```
- Heading kecil di atasnya: `Ringkasan Pengunjung (7 Hari)` dengan `Link` "Lihat detail →" ke `/cms/analytics`.

### 3. Konsistensi style
- Reuse komponen `Card`, `CardHeader`, `CardTitle`, `CardContent`.
- Warna chart sama persis dgn `CMSAnalytics`: primary + violet (`#a78bfa`).
- Grid responsive: 1 kolom mobile, 2 kolom `lg`.
- Tinggi chart `h-40` (lebih kecil dari halaman Analytics yang `h-72`) supaya dashboard tidak terlalu panjang.
- Metric inline pakai `text-xs text-muted-foreground` + value `font-semibold text-foreground`.

### 4. Edge case
- Jika `bolakami.com` belum punya akses service account → card .com tampil error compact, card .news tetap normal.
- Tidak ada perubahan edge function (sudah siap).
- Tidak ada perubahan DB.

## File yang diubah / dibuat

| Aksi | File |
|------|------|
| Create | `src/components/cms/DomainAnalyticsCard.tsx` |
| Edit | `src/pages/cms/CMSDashboard.tsx` |

## Hasil akhir

Dashboard `/cms` punya layout:

```text
[ 4 stat cards ]
[ Ringkasan Pengunjung (7 Hari)              Lihat detail → ]
[ bolakami.news mini chart ] [ bolakami.com mini chart ]
[ Berita Terbaru          ] [ Ringkasan Status         ]
```

Konsisten dengan style existing, tidak berantakan, dan kalau `.com` error tidak mengganggu sisanya.

Konfirmasi untuk lanjut eksekusi.