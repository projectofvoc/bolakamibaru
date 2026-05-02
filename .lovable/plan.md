# Fix GA4 Analytics 500 Error

## Root cause
Service account lama tidak punya akses ke GA4 Property `534103475`. User sudah generate service account baru dari project Google Cloud `dashboard-bolakami` dengan email:
`google-analytics@dashboard-bolakami.iam.gserviceaccount.com`

## Yang akan saya lakukan (otomatis)

1. **Update secret `GA4_SERVICE_ACCOUNT_JSON`** dengan JSON service account baru yang sudah Anda kirim.
2. **Verifikasi secret `GA4_PROPERTY_ID`** masih bernilai `534103475` (sesuai konfirmasi Anda).
3. **Re-deploy edge function `ga4-analytics`** agar memakai secret terbaru.
4. **Test edge function** via curl untuk konfirmasi response sukses.

## Yang HARUS Anda lakukan manual (tidak bisa via Lovable)

Dua langkah ini di sisi Google — wajib selesai sebelum tes berhasil:

### A. Enable Google Analytics Data API
1. Buka: https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com
2. Pilih project **`dashboard-bolakami`** (di selector atas)
3. Klik **Enable**

### B. Tambahkan service account ke GA4 Property
1. Buka https://analytics.google.com
2. Pastikan Property aktif = **`534103475`**
3. Klik **Admin** (⚙️ kiri bawah)
4. Kolom **Property** → **Property access management**
5. Klik **+** kanan atas → **Add users**
6. Email: `google-analytics@dashboard-bolakami.iam.gserviceaccount.com`
7. Role: **Viewer**
8. Uncheck "Notify new users by email" (service account tidak punya inbox)
9. Klik **Add**

## Urutan eksekusi setelah Anda approve
1. Saya update secret + redeploy (langsung).
2. Anda kerjakan langkah A & B di Google.
3. Anda confirm "sudah", saya jalankan test curl ke edge function.
4. Refresh halaman `/cms/analytics-ga4` — data harus muncul.

## Catatan
- Tidak ada perubahan kode (UI dan edge function sudah benar).
- Hanya update secret + konfigurasi Google.
