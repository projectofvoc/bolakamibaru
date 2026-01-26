

## Rencana: Perbaiki Season ID Mapping untuk Klasemen

### Masalah yang Ditemukan
Berdasarkan analisa log edge function, **Season ID yang digunakan salah sehingga data klasemen tidak sesuai dengan liga yang dipilih**:

| Liga Dipilih | Season ID Digunakan | Data yang Muncul |
|--------------|---------------------|------------------|
| Liga 1 Indonesia | 23614 | Liverpool (EPL) |
| Premier League | 23744 | Bayern München (Bundesliga) |
| La Liga | 23686 | Tidak ada data |
| Champions League | 23893 | Tidak ada data |

### Akar Masalah
Season ID di kode adalah **estimasi** yang tidak sesuai dengan data aktual dari Sportmonks API. Setiap liga memiliki ID yang berbeda-beda dan berubah setiap musim.

### Solusi: Fetch Season ID Dinamis

Daripada menggunakan hardcoded Season ID yang bisa salah dan perlu diupdate manual setiap musim, saya akan:

1. **Ubah edge function untuk fetch Season ID secara dinamis** menggunakan endpoint `/v3/football/leagues/{league_id}?include=currentSeason`

2. **Gunakan League ID (statis) sebagai mapping** karena League ID tidak berubah, yang berubah adalah Season ID setiap tahun

### Mapping League ID (Statis - tidak berubah)

| Liga | League ID |
|------|-----------|
| Liga 1 Indonesia | 501 |
| Liga 2 Indonesia | 648 |
| Premier League | 8 |
| La Liga | 564 |
| Serie A | 384 |
| Bundesliga | 82 |
| Champions League | 2 |

### Langkah Implementasi

**1. Modifikasi edge function `sportmonks-standings`:**

```text
FLOW BARU:
┌─────────────────────────────────────────────────────────────┐
│  1. Terima request dengan league slug (e.g., "liga-1")      │
│  2. Map ke League ID (e.g., 501)                            │
│  3. Fetch current season: /leagues/501?include=currentSeason│
│  4. Ambil current season ID dari response                   │
│  5. Fetch standings: /standings/seasons/{season_id}         │
│  6. Return data klasemen                                    │
└─────────────────────────────────────────────────────────────┘
```

**2. Kode yang akan diubah:**

```typescript
// supabase/functions/sportmonks-standings/index.ts

// BARU: Mapping ke League ID (statis)
const leagueIdMapping: Record<string, number> = {
  'liga-1': 501,            // Liga 1 Indonesia
  'liga-2': 648,            // Liga 2 Indonesia  
  'premier-league': 8,      // Premier League
  'la-liga': 564,           // La Liga
  'serie-a': 384,           // Serie A
  'bundesliga': 82,         // Bundesliga
  'champions-league': 2,    // Champions League
};

// BARU: Function untuk fetch current season
async function getCurrentSeasonId(leagueId: number, apiKey: string): Promise<number | null> {
  const response = await fetch(
    `https://api.sportmonks.com/v3/football/leagues/${leagueId}?api_token=${apiKey}&include=currentSeason`,
    { method: 'GET', headers: { 'Accept': 'application/json' } }
  );
  
  if (!response.ok) return null;
  
  const data = await response.json();
  return data.data?.currentSeason?.id || null;
}
```

### File yang Akan Dimodifikasi

| File | Perubahan |
|------|-----------|
| `supabase/functions/sportmonks-standings/index.ts` | Ubah dari hardcoded Season ID ke fetch dinamis via League ID |

### Keuntungan Pendekatan Ini

1. **Tidak perlu update manual setiap musim** - Season ID diambil otomatis
2. **Lebih akurat** - Data selalu sesuai dengan musim aktif dari API
3. **Mendukung Liga Indonesia** - Selama tersedia di Sportmonks, akan bisa diambil datanya

### Catatan Penting

Berdasarkan log, beberapa liga menunjukkan error:
```
"No result(s) found matching your request. Either the query did not return 
any results or you don't have access to it via your current subscription."
```

Ini menunjukkan bahwa **subscription Sportmonks saat ini mungkin tidak mencakup semua liga**. Liga yang tersedia tergantung pada paket berlangganan ("Worldwide Plan - Basic"). 

Jika Liga 1 Indonesia tidak tersedia di Sportmonks, akan perlu fallback ke API-Football sebagai alternatif.

