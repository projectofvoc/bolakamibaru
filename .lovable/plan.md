

# Plan: Perbaikan API Football - Data Tidak Tampil

## Ringkasan Masalah

Setelah audit mendalam, ditemukan bahwa data "Jadwal Terdekat", "Klasemen", dan "Liga" tidak tampil karena **API Football key bermasalah** dan **cache menyimpan data error**.

## Temuan Teknis

### Status API Keys

| API | Status Key | Status Endpoint |
|-----|------------|-----------------|
| Sportmonks | Valid | Berfungsi |
| API Football | Valid (test) | Error pada /fixtures |

### Root Cause

1. **API Key Subscription Issue**
   - Test connection (`/status`) berhasil dengan response "Account: Active"
   - Request ke `/fixtures` gagal dengan error: "Missing application key"
   - Kemungkinan: quota habis, subscription expired, atau tier tidak mencakup endpoint fixtures

2. **Caching Data Error**
   - Cache `apifb-livescore:2026-02-01` menyimpan array kosong
   - TTL 30 detik terus di-refresh dengan data kosong
   - Data valid terakhir ada di cache tanggal 2026-01-31

## Solusi yang Direkomendasikan

### Langkah 1: Clear Cache yang Bermasalah

Hapus cache data yang berisi error agar sistem fetch data baru:

```sql
DELETE FROM api_cache 
WHERE cache_key LIKE 'apifb-livescore:2026-02-01%';
```

### Langkah 2: Verifikasi API Football Subscription

Anda perlu login ke dashboard API-Football (api-football.com) dan periksa:
- **Quota harian** - Apakah sudah habis?
- **Subscription status** - Apakah masih aktif?
- **Plan tier** - Apakah mencakup endpoint fixtures?

### Langkah 3: Update API Key (Jika Diperlukan)

Jika key sudah expired atau quota habis:
1. Generate API key baru dari dashboard API-Football
2. Update di tabel `api_configurations`:

```sql
UPDATE api_configurations 
SET api_key = 'NEW_API_KEY_HERE', updated_at = NOW()
WHERE name = 'api_football_indo';
```

### Langkah 4: Perbaikan Kode (Pencegahan)

Tambahkan logic untuk **tidak menyimpan cache jika data kosong/error**:

```text
File: supabase/functions/apifootball-livescore/index.ts

Modifikasi: Jangan cache data jika semua array kosong
- Tambahkan validasi sebelum menyimpan ke cache
- Jika liveMatches, upcomingMatches, dan recentMatches semua kosong,
  skip caching agar request berikutnya fetch ulang dari API
```

## Diagram Alur Masalah

```text
┌─────────────────────────────────────────────────────────────────┐
│                     CURRENT FLOW (BROKEN)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Request → Check Cache → HIT (empty data) → Return Empty  │
│                      ↓                                          │
│              Cache contains:                                    │
│              { liveMatches: [], upcomingMatches: [] }          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     EXPECTED FLOW (FIXED)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Request → Check Cache → MISS → Fetch API → Valid Data    │
│                                           ↓                     │
│                                     Store in Cache              │
│                                           ↓                     │
│                                     Return Data                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Tindakan Segera

Setelah plan ini disetujui, saya akan:

1. **Clear cache** yang bermasalah via SQL
2. **Update edge function** untuk tidak cache data kosong
3. **Test ulang** API Football endpoint
4. **Tambahkan fallback** jika API gagal (tampilkan pesan informatif)

## Catatan Penting

- API Football (api-sports.io) **berbeda** dari Sportmonks
- Liga 1 Indonesia (ID: 274) dan Liga 2 (ID: 275) menggunakan API Football
- Liga internasional (EPL, La Liga, dll) menggunakan Sportmonks
- Anda perlu memastikan subscription API Football masih aktif

