# Penyebab Klasemen Tampil 2024/25

Setelah saya telusuri, sumber masalah ada di **`src/hooks/useStandings.ts`** baris 31:

```ts
export const useStandings = (leagueSlug: string, seasonStartYear: number = 2024) => {
```

Default parameter `seasonStartYear` masih `2024`. Halaman `src/pages/Klasemen.tsx` memanggil `useStandings(selectedLeague)` tanpa argumen kedua, sehingga selalu mengirim `2024` ke edge function `sportmonks-standings`. Edge function kemudian menghasilkan label `"2024/25"` dan mem-fetch musim 2024/25.

Catatan tambahan: edge function (`supabase/functions/sportmonks-standings/index.ts`) sebenarnya **sudah** memakai default `2025` jika body kosong (baris 370), dan punya logika fallback ke musim sebelumnya bila musim baru masih kosong (baris 433–435). Jadi cukup memperbaiki default di sisi client.

# Rencana Perubahan

Hanya 1 file yang diubah:

**`src/hooks/useStandings.ts`**
- Ganti default `seasonStartYear: number = 2024` menjadi `seasonStartYear: number = 2025`.
- (Opsional, lebih aman jangka panjang) Hitung otomatis berdasarkan bulan: bulan Jan–Jun → tahun lalu, Jul–Des → tahun ini. Logika ini sama dengan `getCurrentSeason()` di `apifootball-livescore`. Tapi karena liga Eropa & Indonesia sudah berjalan di musim 2025/26 sekarang (Mei 2026), set hardcoded ke `2025` sudah cukup dan paling aman.

# Verifikasi Setelah Implementasi

1. Buka halaman `/klasemen`, pilih Premier League / La Liga / Serie A / Bundesliga / Liga 1 — header dan subtitle harus menampilkan **"2025/26"**.
2. Tabel klasemen menampilkan data musim berjalan.
3. Jika untuk liga tertentu API mengembalikan kosong, fallback bawaan edge function akan otomatis memakai musim sebelumnya (2024/25) — ini perilaku yang benar agar UI tidak kosong.

# Pertanyaan Konfirmasi

Mau saya pakai **opsi A: hardcode `2025`** (cepat & cukup), atau **opsi B: deteksi otomatis berdasarkan bulan** (lebih tahan lama untuk pergantian musim berikutnya)?
