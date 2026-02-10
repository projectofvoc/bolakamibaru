

# Fix: Akumulasi Waktu Aktif Antar Sesi

## Masalah

Saat ini, `useActivityTracker` membuat `sessionId` baru setiap kali halaman dimuat:
```
const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()...}`)
```

Akibatnya:
- Setiap kali user membuka/refresh halaman, sesi baru dimulai dari 0 menit
- Progress bar selalu reset ke 0%
- Waktu aktif sebelumnya hilang dan tidak terakumulasi

## Solusi: Gunakan Sesi Harian (Bukan Per-Visit)

Ganti session ID acak dengan **session ID berbasis tanggal** (`daily_YYYY-MM-DD`). Dengan ini:
- User yang kembali di hari yang sama akan melanjutkan progress dari sebelumnya
- Progress bar menunjukkan akumulasi waktu aktif hari itu
- Poin tetap dihitung dengan benar karena RPC sudah menghitung `FLOOR(active_minutes / read_time_minutes) - points_awarded`

## Detail Teknis

### Perubahan di `src/hooks/useActivityTracker.ts`

1. **Session ID berbasis tanggal:**
   ```typescript
   const [sessionId] = useState(() => {
     const today = new Date().toISOString().split('T')[0];
     return `daily_${today}`;
   });
   ```

2. **Load akumulasi dari database saat mount:**
   - Query `user_activity` dengan session ID hari ini
   - Set `localActiveMinutes` dari `active_minutes` yang sudah tersimpan di database
   - Ini memastikan progress bar langsung menunjukkan akumulasi waktu yang benar

3. **Sinkronisasi state lokal dengan data database:**
   - Saat `activityState` berhasil di-fetch, update `localActiveMinutes` jika data DB lebih besar dari state lokal
   - Ini menangani kasus user kembali setelah keluar

4. **Perbaikan interval tracking:**
   - `lastUpdateRef` tetap menggunakan `Date.now()` untuk mengukur waktu sejak mount terakhir
   - Increment tetap per menit, tapi sekarang di-add ke akumulasi yang sudah ada

### Alur Kerja

```text
User buka website (09:00)
  -> sessionId = "daily_2026-02-10"
  -> Query DB: tidak ada record -> localActiveMinutes = 0
  -> Mulai tracking

User aktif 5 menit, lalu tutup browser (09:05)
  -> DB: user_activity { session: "daily_2026-02-10", active_minutes: 5 }

User buka lagi (10:00)
  -> sessionId = "daily_2026-02-10" (sama!)
  -> Query DB: active_minutes = 5 -> localActiveMinutes = 5
  -> Progress bar menunjukkan 5/60 menit
  -> Tracking lanjut dari menit ke-5

User aktif 55 menit lagi (10:55)
  -> active_minutes = 60 -> award_read_time_points dipanggil
  -> +1 poin diberikan!
```

### File yang Diubah

| File | Perubahan |
|------|----------|
| `src/hooks/useActivityTracker.ts` | Session ID harian, load akumulasi dari DB, sinkronisasi state |

