

# Plan: Perbaikan Jadwal Mendatang - Semua Liga

## Ringkasan Masalah

Audit menemukan bahwa "Jadwal Mendatang" tidak muncul karena:

1. **API Key tidak sinkron**: `sportmonks-fixtures` menggunakan environment variable `SPORTMONKS_API_KEY` yang sudah expired, sementara `sportmonks-livescore` sudah diupdate untuk membaca dari database `api_configurations`
2. **Liga Indonesia tidak di-mapping**: Liga 2 return "Invalid league ID" karena tidak ada di mapping function

## Bukti dari Logs

```text
[sportmonks-fixtures]
Sportmonks API error: {"message":"Invalid token provided"}
Error fetching fixtures: Sportmonks API error: 401

[sportmonks-livescore]
Using API key from database for: sportmonks ✅
Sportmonks response: {"data":[...]} ✅
```

## Solusi

### Langkah 1: Update sportmonks-fixtures untuk Baca API Key dari Database

Ubah `supabase/functions/sportmonks-fixtures/index.ts` agar menggunakan pattern yang sama dengan `sportmonks-livescore`:

```text
SEBELUM:
const apiKey = Deno.env.get('SPORTMONKS_API_KEY');

SESUDAH:
// Tambahkan function getApiKey() yang baca dari api_configurations
// dengan fallback ke environment variable
const apiKey = await getApiKey(supabase, 'sportmonks');
```

Perubahan yang diperlukan:
- Tambahkan function `getApiKey()` yang membaca dari tabel `api_configurations`
- Panggil function ini untuk mendapatkan API key yang valid dari database

### Langkah 2: Perbaiki Handling Liga Indonesia

Liga 1 dan Liga 2 Indonesia menggunakan API Football (bukan Sportmonks). Saat ini function return error "Invalid league ID". 

```text
SEBELUM:
return new Response(
  JSON.stringify({ fixtures: [], error: 'Invalid league ID' }),
  ...
);

SESUDAH:
// Return empty array tanpa error untuk Liga Indonesia
// karena data diambil dari API Football terpisah
if (leagueId === 'liga-1' || leagueId === 'liga-2') {
  return new Response(
    JSON.stringify({ fixtures: [], source: 'use-api-football' }),
    ...
  );
}
```

### Langkah 3: Clear Cache yang Bermasalah

Hapus cache yang menyimpan error responses:

```sql
DELETE FROM api_cache 
WHERE cache_key LIKE 'fixtures:%';
```

## Diagram Alur Fix

```text
┌────────────────────────────────────────────────────────────────┐
│                       CURRENT STATE                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  sportmonks-fixtures                                           │
│  └─> Deno.env.get('SPORTMONKS_API_KEY') ─> EXPIRED KEY ❌     │
│                                                                │
│  sportmonks-livescore                                          │
│  └─> api_configurations.sportmonks ─────> VALID KEY ✅        │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                       AFTER FIX                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  sportmonks-fixtures                                           │
│  └─> api_configurations.sportmonks ─────> VALID KEY ✅        │
│                                                                │
│  sportmonks-livescore                                          │
│  └─> api_configurations.sportmonks ─────> VALID KEY ✅        │
│                                                                │
│  [KONSISTEN - Kedua function pakai source yang sama]           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## File yang Akan Diubah

| File | Perubahan |
|------|-----------|
| `supabase/functions/sportmonks-fixtures/index.ts` | Tambah `getApiKey()` function, handle Liga Indonesia |

## Hasil yang Diharapkan

Setelah fix:
- ✅ Premier League: Jadwal muncul (Sportmonks)
- ✅ La Liga: Jadwal muncul (Sportmonks)
- ✅ Serie A: Jadwal muncul (Sportmonks)
- ✅ Bundesliga: Jadwal muncul (Sportmonks)
- ✅ Champions League: Jadwal muncul (Sportmonks)
- ✅ Liga 1 Indonesia: Jadwal dari API Football (sudah terpisah)
- ✅ Liga 2 Indonesia: Jadwal dari API Football (sudah terpisah)

