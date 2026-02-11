

# Update Widget Predicto: Kirim fixture_id & match_data

## Tujuan
Menambahkan parameter `fixture_id` dan `match_data` pada request body widget Predicto agar Match Guard di backend bisa di-bypass untuk tim yang tidak dikenali.

## Cara Kerja

Widget akan mencocokkan pesan pengguna dengan daftar pertandingan yang tersedia (live + upcoming). Jika ditemukan kecocokan nama tim, data pertandingan tersebut akan dikirim bersama request.

## Detail Teknis

### File: `src/components/AICompanion.tsx`

**1. Buat fungsi pencocokan pertandingan**

Fungsi `findMatchingFixture` akan:
- Mengambil pesan pengguna
- Mencocokkan dengan daftar pertandingan dari `liveMatches` dan `upcomingMatches`
- Mengembalikan `fixture_id` dan `match_data` jika ditemukan

```typescript
const findMatchingFixture = (message: string) => {
  const msgLower = message.toLowerCase();
  
  // Cek dari upcoming fixtures
  for (const fixture of (upcomingMatches || [])) {
    const homeName = fixture.homeTeam.name.toLowerCase();
    const awayName = fixture.awayTeam.name.toLowerCase();
    if (msgLower.includes(homeName) || msgLower.includes(awayName)) {
      return {
        fixture_id: fixture.id,
        match_data: {
          homeTeam: fixture.homeTeam.name,
          awayTeam: fixture.awayTeam.name,
          league: fixture.league.name,
          startingAt: fixture.startingAt,
          venue: fixture.venue,
        }
      };
    }
  }
  
  // Cek dari live matches
  for (const match of liveMatches) {
    const homeName = match.homeTeam.toLowerCase();
    const awayName = match.awayTeam.toLowerCase();
    if (msgLower.includes(homeName) || msgLower.includes(awayName)) {
      return {
        fixture_id: match.id,
        match_data: {
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          league: match.league,
        }
      };
    }
  }
  
  return null;
};
```

**2. Update fungsi `callOpenAI`**

- Tambahkan parameter `matchContext` opsional
- Sertakan `fixture_id` dan `match_data` di request body jika tersedia

```typescript
const callOpenAI = useCallback(async (
  message: string, 
  matchContext?: { fixture_id: string | number; match_data: any }
): Promise<string> => {
  // ...existing retry logic...
  body: JSON.stringify({ 
    message,
    conversationHistory: conversationHistory.current,
    ...(matchContext && {
      fixture_id: matchContext.fixture_id,
      match_data: matchContext.match_data,
    })
  }),
  // ...
```

**3. Update `handleSend` dan `handlePromptClick`**

Panggil `findMatchingFixture` sebelum memanggil API:

```typescript
const matchContext = findMatchingFixture(userMessage.content);
const aiResponseText = await callOpenAI(userMessage.content, matchContext);
```

### Ringkasan Perubahan

| Komponen | Perubahan |
|----------|-----------|
| `findMatchingFixture` | Fungsi baru untuk mencocokkan pesan dengan pertandingan |
| `callOpenAI` | Tambah parameter `matchContext`, kirim `fixture_id` & `match_data` di body |
| `handleSend` | Panggil `findMatchingFixture` sebelum API call |
| `handlePromptClick` | Panggil `findMatchingFixture` sebelum API call |

Tidak ada perubahan database atau edge function yang diperlukan -- semua perubahan hanya di frontend.
