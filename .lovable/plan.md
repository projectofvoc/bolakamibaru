## Tujuan

Mengganti seluruh data 5 metrik + Trend Pengunjung di `/cms/analytics` agar bersumber **realtime dari Histats**, menggantikan data internal (`analytics_sessions` / `analytics_events`).

---

## Rekomendasi Metode (Penting)

Histats **tidak menyediakan REST API resmi** untuk membaca statistik. Yang tersedia hanya:
1. **Counter image publik** (`stat.cgi`) → cuma angka counter total, tidak ada breakdown metrik.
2. **Halaman dashboard internal Histats** → butuh login (username/password), data lengkap (visitors, pageviews, duration, bounce, trend).

**Rekomendasi saya: Opsi 2 — Scrape dashboard Histats via Edge Function**, karena hanya cara ini yang bisa memberikan **5 metrik + trend** sesuai kebutuhan. Risiko: jika Histats mengubah HTML dashboard, parser harus diupdate. Mitigasi: cache 60 detik + fallback ke nilai cache terakhir jika scraping gagal.

Alternatif yang lebih stabil tapi butuh ganti vendor: **Google Analytics 4 Data API** (resmi, gratis, realtime). Saya tetap rekomendasi Histats sesuai permintaan, tapi sebutkan opsi ini sebagai cadangan.

---

## Yang Akan Dibutuhkan dari Anda

Saya akan minta sebagai secrets (aman, tidak di-expose ke browser):
- `HISTATS_SITE_ID` — Site ID Histats untuk bolakami.com
- `HISTATS_USERNAME` — username login Histats
- `HISTATS_PASSWORD` — password login Histats

Akan diminta lewat tool `add_secret` di awal eksekusi.

---

## Arsitektur

```text
┌──────────────────┐    invoke     ┌──────────────────────┐    login+scrape    ┌────────────┐
│ CMSAnalytics.tsx │ ────────────▶ │ get-histats-analytics│ ─────────────────▶ │ histats.com│
│  (React Query    │ ◀──── JSON ── │   (edge function)    │ ◀──── HTML ─────── │  /stats    │
│   refetch 60s)   │               │  + cache 60 detik    │                    └────────────┘
└──────────────────┘               └──────────────────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │ api_cache table │
                                   │ key: histats:*  │
                                   └─────────────────┘
```

---

## Langkah Eksekusi

### 1. Minta Secrets
- Trigger `add_secret` untuk `HISTATS_SITE_ID`, `HISTATS_USERNAME`, `HISTATS_PASSWORD`. Tunggu user input sebelum lanjut.

### 2. Buat Edge Function `get-histats-analytics`
- File: `supabase/functions/get-histats-analytics/index.ts`
- Logic:
  1. Cek cache di `api_cache` (key: `histats:overview:{range}`, TTL 60 detik).
  2. Login ke `https://www.histats.com/?act=2` dengan POST username+password, simpan cookie session.
  3. Fetch halaman statistik utama untuk site ID + range (7d/30d/90d).
  4. Parse HTML pakai regex / `deno-dom` untuk ekstrak:
     - Total Visitors
     - Total Pageviews
     - Pages/Visit (dihitung pageviews/visitors jika tidak tersedia langsung)
     - Avg Duration (dalam detik)
     - Bounce Rate (%)
     - Trend harian (array `{date, visitors}`)
  5. Simpan hasil ke cache, return JSON.
  6. Jika error / Histats down → return cache stale (jika ada) atau 503.
- CORS lengkap, `verify_jwt = false` default, validasi range param dengan zod.

### 3. Update Frontend `src/pages/cms/CMSAnalytics.tsx`
- Hapus `useQuery` ke `get-analytics`.
- Tambah `useQuery` baru ke `get-histats-analytics` dengan `refetchInterval: 60_000`.
- Map response ke 5 stat cards + chart Trend Pengunjung.
- **Pertahankan apa adanya** (tidak ikut diganti):
  - Card "Berita Dipublish 30/7 Hari" → tetap ambil dari tabel `articles`.
  - Distribusi Negara, Device Breakdown, Sources, Top Pages → **dihapus dari UI** karena Histats free tier umumnya tidak expose data ini terstruktur. (Kalau mau dipertahankan, kita bisa tetap pakai data internal untuk section bawah ini — konfirmasi saat implementasi jika perlu.)
- Label "Data real dari Lovable Analytics" diganti "Data realtime dari Histats".
- Loading state + error state ("Gagal memuat data Histats — menampilkan cache terakhir").

### 4. Cleanup
- Tidak menghapus edge function `get-analytics` & `track-analytics` (masih dipakai untuk Read-to-Earn / session tracking internal). Hanya frontend Analytics yang berhenti memanggil `get-analytics`.

### 5. Verifikasi
- Deploy edge function, panggil via `curl_edge_functions` untuk validasi parsing.
- Cek `edge_function_logs` jika ada error login/parsing.
- Buka `/cms/analytics` di preview, pastikan 5 metrik + trend tampil dengan angka Histats real.

---

## Detail Teknis

- **Cache**: 60 detik di `api_cache`. Saat error, return stale data + flag `stale: true` yang ditampilkan sebagai badge "Cached" di UI.
- **Range mapping**: 7 Hari / 30 Hari / 90 Hari → query param ke Histats stats page sesuai parameter range mereka.
- **Security**: kredensial Histats hanya hidup di edge runtime, tidak pernah ke browser.
- **Pages/Visit**: jika Histats tidak expose langsung, hitung `pageviews / visitors` di edge.
- **Avg Duration**: format mm:ss di frontend (utility sudah ada).

---

## Risiko & Catatan

- **HTML scraping rapuh**: jika Histats ganti markup, edge function perlu diupdate. Saya akan tulis parser defensif (multiple selectors fallback).
- **Histats login mungkin pakai CSRF / captcha**: kalau ditemui captcha, scraping tidak akan jalan dan saya akan minta Anda pertimbangkan ganti ke GA4 Data API.
- **Rate limit**: cache 60 detik mencegah hammering Histats.
- Section Distribusi Negara / Device / Sources / Top Pages **akan dihilangkan** dari UI (Histats tidak expose terstruktur di tier gratis). Kalau mau tetap ada, kita bisa biarkan pakai data internal sebagai pelengkap — sebut saat approve.

---

**Approve plan ini untuk lanjut.** Setelah approve, saya akan minta 3 secrets Histats di atas dulu sebelum implementasi.