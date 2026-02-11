

# Update Request Body ke Predicto Widget

## Ringkasan
Mengubah format request body yang dikirim ke endpoint Predicto Widget agar menyertakan metadata pertandingan secara eksplisit (`match_data`, `is_live_analysis`, `mode`).

## Perubahan

### File: `src/components/AICompanion.tsx`

**1. Update `findMatchingFixture` -- ubah format output ke snake_case dan tambahkan `is_live`**

Fungsi ini sekarang mengembalikan data dalam format yang sesuai dengan ekspektasi backend Predicto:

- `match_data.home_team` (bukan `homeTeam`)
- `match_data.away_team` (bukan `awayTeam`)  
- `match_data.league`
- `is_live` flag untuk menentukan apakah pertandingan sedang berlangsung

**2. Update `callOpenAI` -- kirim `match_data`, `is_live_analysis`, dan `mode`**

Request body berubah dari:

```json
{
  "message": "...",
  "conversationHistory": [...],
  "fixture_id": "...",
  "match_data": { "homeTeam": "...", "awayTeam": "...", "league": "..." }
}
```

Menjadi:

```json
{
  "message": "...",
  "conversationHistory": [...],
  "fixture_id": "...",
  "match_data": {
    "home_team": "Manila Digger",
    "away_team": "Mendiola",
    "league": "PFL"
  },
  "is_live_analysis": true,
  "mode": "analisa"
}
```

## Detail Teknis

| Field | Sumber | Keterangan |
|-------|--------|------------|
| `match_data.home_team` | `findMatchingFixture` | Snake_case, sesuai format backend |
| `match_data.away_team` | `findMatchingFixture` | Snake_case, sesuai format backend |
| `match_data.league` | `findMatchingFixture` | Nama liga/kompetisi |
| `is_live_analysis` | Cek apakah match ditemukan di `liveMatches` | `true` jika live, `false` jika upcoming |
| `mode` | Hardcode `"analisa"` | Mode analisa pertandingan |

Hanya satu file yang perlu diubah. Tidak ada perubahan edge function atau database.
