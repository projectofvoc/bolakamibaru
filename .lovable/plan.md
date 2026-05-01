# Implementasi GA4 OAuth Integration

## Status Saat Ini
- Tabel `ga4_oauth_tokens` sudah ada di database (dengan RLS admin-only)
- Halaman `/cms/analytics` sudah dibersihkan dari Histats
- Anda sudah punya: Client ID, Client Secret, dan tahu cara dapat GA4 Property ID

## Yang Akan Saya Lakukan (setelah plan disetujui)

### 1. Simpan Secrets
- `GA4_OAUTH_CLIENT_ID` = `288631404038-mda2elpp6ra5angmm2jtpl1f8q7hqkkkk.apps.googleusercontent.com`
- `GA4_OAUTH_CLIENT_SECRET` = `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`

(Anda akan lihat 1 popup approval — klik Approve)

### 2. Bangun 3 Edge Functions

**`ga4-oauth-start`** (verify_jwt, admin-only)
- Generate Google OAuth URL dengan `scope=analytics.readonly`, `access_type=offline`, `prompt=consent`
- State parameter berisi user_id admin (signed)
- Return URL untuk frontend redirect

**`ga4-oauth-callback`** (verify_jwt = false, dipanggil oleh Google)
- Terima `code` dari Google
- Tukar jadi `access_token` + `refresh_token` via `oauth2.googleapis.com/token`
- Ambil email Google user (untuk display)
- Simpan ke tabel `ga4_oauth_tokens` (upsert by user_id)
- Redirect kembali ke `/cms/analytics?connected=1`

**`ga4-analytics`** (verify_jwt, admin-only)
- Baca token dari DB
- Auto-refresh kalau `expires_at < now() + 60s`
- Panggil GA4 Data API: `properties/{id}:runReport`
- Return: total users, sessions, pageviews, avg duration, daily visitors, top pages, traffic sources, devices, countries
- Parameter: `propertyId`, `days` (7/30/90)

### 3. Update UI `/cms/analytics`

**Kalau belum konek**: Card besar dengan tombol "Connect Google Analytics" + input "GA4 Property ID"

**Kalau sudah konek**:
- Header: "Connected as <email>" + tombol Disconnect
- Filter range: 7 / 30 / 90 hari
- 4 card metrik: Users, Sessions, Pageviews, Avg Duration
- Line chart: visitors per hari (Recharts)
- Table: Top 10 pages
- Table: Traffic sources
- Breakdown: device & country

### 4. Cleanup
- Hapus edge function `get-histats-analytics`
- Biarkan secret `HISTATS_*` (tidak mengganggu, bisa dihapus manual nanti)

## Redirect URI yang HARUS Sudah Dipasang di Google Cloud
Pastikan di OAuth Client Anda sudah ada:
```
https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/ga4-oauth-callback
```
Kalau belum → tambahkan di Google Cloud Console → Credentials → OAuth Client → Authorized redirect URIs → Save.

## Setelah Saya Selesai
1. Anda buka `/cms/analytics` → klik **Connect Google Analytics**
2. Login Google (akun yang punya akses GA4 Property)
3. Approve scope `analytics.readonly`
4. Otomatis kembali ke CMS → masukkan **GA4 Property ID** (angka)
5. Data muncul

---

**Setujui plan untuk lanjut?** Setelah disetujui saya langsung minta approval secret + tulis semua kode dalam satu run.