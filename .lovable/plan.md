
Tujuan perubahan (berdasarkan request terbaru)
- Untuk semua liga di halaman /klasemen, data klasemen harus untuk musim “2025/2026”.
- Khusus Liga 1 & Liga 2 saat ini salah (tidak menampilkan tim Indonesia), jadi harus diperbaiki.

Analisa masalah saat ini (kenapa Liga 1 & Liga 2 tidak tepat)
1) Edge function `sportmonks-standings` saat ini memakai `leagueIdMapping`:
   - `liga-1` -> 501
   - `liga-2` -> 648
2) Hasil real dari backend (sudah saya uji dengan request langsung):
   - `liga-1` mengembalikan tim seperti “Hearts, Rangers, Celtic…” (itu bukan Liga 1 Indonesia)
   - `liga-2` mengembalikan tim seperti “Corinthians, Flamengo…” (bukan Liga 2 Indonesia)
3) Jadi akar masalahnya:
   - ID liga Sportmonks untuk “Liga 1 Indonesia” dan “Liga 2 Indonesia” yang dipakai sekarang memang salah (mengarah ke liga negara lain).
   - Selain itu, di codebase juga ada indikasi kuat bahwa liga Indonesia seharusnya dari API Football (lihat komentar di `supabase/functions/sportmonks-fixtures/index.ts`: “Liga 1 Indonesia is NOT available in Sportmonks - use API-Football instead”).
4) Ada masalah tambahan di UI:
   - `src/pages/Klasemen.tsx` menampilkan label musim “2024/25” secara hardcoded, padahal request sekarang wajib “2025/26”.

Keputusan teknis yang paling aman & sesuai requirement
- Untuk Liga 1 & Liga 2: ambil klasemen dari API Football (karena memang sudah dipakai untuk Liga Indonesia di fitur lain).
- Untuk liga internasional (Premier League, La Liga, Serie A, Bundesliga, Champions League): tetap dari Sportmonks, tetapi dipaksa mengambil musim 2025/2026 (bukan “current season” yang bisa berubah / tidak sesuai).

Rencana implementasi (perubahan kode yang akan dilakukan)

A) Backend: perbaikan `sportmonks-standings` agar:
1) Mendukung “musim target” 2025/2026
   - Tambahkan parameter request (opsional) misalnya:
     - `seasonStartYear: 2025` (untuk 2025/2026)
   - Default-nya tetap 2025 supaya konsisten walau frontend tidak mengirim parameter.

2) Routing data berdasarkan liga:
   - Jika `leagueSlug` adalah `liga-1` atau `liga-2`:
     - Jangan gunakan Sportmonks sama sekali.
     - Panggil API Football endpoint standings:
       - `GET https://v3.football.api-sports.io/standings?league=274&season=2025` (Liga 1)
       - `GET https://v3.football.api-sports.io/standings?league=275&season=2025` (Liga 2)
     - Parse response -> mapping ke format `StandingTeam` yang sama (position, teamName, teamLogo, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points)
     - Pastikan logo club memakai `team.logo` dari API Football.

   - Jika liga selain itu:
     - Tetap pakai Sportmonks, tapi pilih season 2025/2026 secara eksplisit:
       - Ambil daftar season liga dari endpoint league detail (include seasons), lalu pilih season yang:
         - `starting_at` tahun 2025 dan `ending_at` tahun 2026 (paling robust), atau
         - fallback: `name` mengandung “2025/2026” jika field tanggal tidak tersedia
     - Setelah dapat `seasonId` yang benar untuk 2025/2026, baru hit endpoint standings Sportmonks:
       - `/v3/football/standings/seasons/{seasonId}?include=participant;details`

3) Output response dibuat lebih informatif untuk UI:
   - Tambahkan field `seasonLabel` (mis. “2025/26” atau “2025/2026”)
   - Tambahkan field `source` (mis. `sportmonks` / `api_football`)
   - Ini membantu debugging dan UI tidak hardcode musim.

4) Catatan dependency konfigurasi:
   - API Football key sudah digunakan oleh `apifootball-livescore`, jadi kita akan reuse pola yang sama (ambil dari `api_configurations` name `api_football_indo` dan fallback env `API_FOOTBALL_KEY`).
   - Tidak akan meminta secret baru kecuali ternyata key-nya tidak tersedia (yang seharusnya tidak karena fitur livescore sudah berjalan).

B) Frontend: update halaman Klasemen & hook agar sesuai musim 2025/26
1) `src/hooks/useStandings.ts`
   - Tambahkan parameter musim (mis. fixed `seasonStartYear = 2025`) dalam request ke backend:
     - `supabase.functions.invoke('sportmonks-standings', { body: { league: leagueSlug, seasonStartYear: 2025 } })`
   - Ubah `queryKey` menjadi `['standings', leagueSlug, 2025]` supaya cache React Query tidak bentrok bila nanti musim diganti.

2) `src/pages/Klasemen.tsx`
   - Hapus hardcode “2024/25”
   - Tampilkan `data?.seasonLabel` jika ada, fallback ke “2025/26”
   - Opsional (disarankan): tampilkan juga sumber data kecil di UI (misalnya badge “Data: API Football” saat Liga 1/2, “Data: Sportmonks” untuk liga lain), supaya transparan dan mudah cek.

C) Pengujian setelah implementasi
1) Uji backend via request langsung:
   - `league: liga-1, seasonStartYear: 2025` harus mengembalikan tim Indonesia (Persib, Persija, dll sesuai musim 2025/26 jika tersedia di API Football).
   - `league: liga-2, seasonStartYear: 2025` harus mengembalikan tim Liga 2 Indonesia.
   - Liga internasional tetap benar dan season yang dipakai harus mengarah ke 2025/2026 (divalidasi dari `seasonLabel` / `seasonId`).
2) Uji UI:
   - Dropdown liga -> pindah liga tidak membawa data liga lain.
   - Subtitle musim terlihat “2025/26”.
   - Logo klub muncul dan fallback placeholder bekerja jika ada logo error.
3) Edge case:
   - Jika API Football tidak punya standings untuk season=2025 (misalnya kompetisi belum mulai atau API belum menyediakan), UI akan tampil empty-state yang sudah ada (“Belum ada data…”), dan error message tetap rapi.

Daftar file yang akan diubah (perkiraan)
- `supabase/functions/sportmonks-standings/index.ts` (perubahan utama: paksa season 2025/26 + fallback API Football untuk Liga 1/2)
- `src/hooks/useStandings.ts` (kirim seasonStartYear=2025 + queryKey update)
- `src/pages/Klasemen.tsx` (ubah label musim dari hardcoded 2024/25 -> 2025/26 atau dari response)

Kenapa solusi ini menjawab masalah user
- Liga 1 & Liga 2 tidak tepat karena mapping ID Sportmonks salah; menghindari Sportmonks untuk Liga Indonesia menghilangkan sumber kesalahan dan mengikuti pola codebase yang sudah ada (Liga Indonesia dari API Football).
- “Musim 2025/2026” dijadikan parameter eksplisit, bukan “current season” yang bisa berbeda antar liga atau berubah seiring waktu.
- UI ikut konsisten (tidak menampilkan 2024/25 lagi).
