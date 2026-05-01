# Integrasi Google Analytics 4 via OAuth (Login Google Pribadi)

## Kenapa OAuth (bukan Service Account)

Service Account ditolak terus oleh UI GA4 Anda. OAuth lebih simpel:
- Anda login pakai akun Google pribadi yang **sudah punya akses ke GA4 Property**
- Tidak perlu buat service account, tidak perlu invite email apapun ke GA4
- Tidak perlu file JSON key
- Token disimpan aman di backend (Lovable Cloud), hanya admin CMS yang bisa pakai

## Yang Perlu Anda Siapkan (di Google Cloud Console)

Saya akan pandu setelah plan disetujui. Garis besarnya:

1. **OAuth Consent Screen** di project `bolakami-analytics`
   - User type: External
   - Scope: `https://www.googleapis.com/auth/analytics.readonly`
   - Test users: tambahkan email Google Anda sendiri

2. **Buat OAuth Client ID** (type: Web application)
   - Authorized redirect URI: `https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/ga4-oauth-callback`
   - Hasilnya: **Client ID** + **Client Secret** → akan disimpan ke Lovable Cloud sebagai secret

3. **Enable Google Analytics Data API** di project Google Cloud yang sama

## Yang Akan Saya Bangun

### 1. Database
Tabel baru `ga4_oauth_tokens`:
- `user_id` (uuid) — admin yang konek
- `access_token`, `refresh_token`, `expires_at`
- `ga4_property_id` (text) — disimpan setelah Anda pilih property
- RLS: hanya role `admin` yang boleh baca/tulis row miliknya

### 2. Edge Functions (3 buah)
- **`ga4-oauth-start`** — generate URL otorisasi Google, redirect admin ke Google
- **`ga4-oauth-callback`** — terima code dari Google, tukar jadi access + refresh token, simpan ke DB
- **`ga4-analytics`** — pakai refresh token untuk panggil GA4 Data API; auto-refresh access token kalau expired. Return: visitor harian, top pages, traffic source, device, country

### 3. UI di `/cms/analytics`
Hapus implementasi Histats yang lama, ganti dengan:
- **Kalau belum konek**: tombol besar "Connect Google Analytics" + input "GA4 Property ID" (angka, contoh: `123456789`)
- **Kalau sudah konek**:
  - Header: "Connected as <email>" + tombol Disconnect
  - Filter range: 7 / 30 / 90 hari
  - Card: Total Users, Sessions, Pageviews, Avg Session Duration
  - Chart: Visitors per hari (line chart, pakai Recharts yang sudah ada)
  - Table: Top 10 pages (path + views)
  - Table: Traffic sources (source/medium + sessions)
  - Breakdown device & country

### 4. Cleanup
- Hapus edge function `get-histats-analytics`
- Hapus secret `HISTATS_*` (opsional — saya tanya dulu sebelum hapus)

## Detail Teknis

**OAuth flow**: Authorization Code dengan `access_type=offline` + `prompt=consent` supaya dapat refresh_token. State parameter berisi user_id admin (signed) untuk verifikasi di callback.

**Token refresh**: Edge function `ga4-analytics` cek `expires_at`. Kalau < 60 detik dari sekarang, refresh dulu pakai refresh_token, update DB, baru request ke GA4 Data API.

**Endpoint GA4**: `POST https://analyticsdata.googleapis.com/v1beta/properties/{propertyId}:runReport` — body berisi `dateRanges`, `dimensions`, `metrics`.

**Security**: Semua edge function verify JWT + cek role `admin` via `has_role()` sebelum proses apapun.

## Yang Akan Saya Minta Setelah Plan Disetujui

1. Saya beri panduan langkah demi langkah buat OAuth Client di Google Cloud Console (dengan screenshot reference kalau perlu)
2. Anda paste **Client ID** dan **Client Secret** → saya tambahkan sebagai secret `GA4_OAUTH_CLIENT_ID` dan `GA4_OAUTH_CLIENT_SECRET`
3. Saya deploy semua kode → Anda klik "Connect" di `/cms/analytics`
4. Anda paste GA4 Property ID → selesai, data muncul

---

**Setujui plan ini untuk lanjut?** Setelah disetujui, saya mulai dengan panduan setup OAuth Client di Google Cloud (belum tulis kode dulu, supaya Anda bisa siapkan kredensial paralel).