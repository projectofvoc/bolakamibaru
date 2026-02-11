

# Perbaiki Edge Function `openai-chat`: Kirim home_team/away_team/league

## Masalah
Edge function `openai-chat` (endpoint bolakami-chat) tidak meng-extract atau meneruskan `fixture_id`, `match_data`, atau `modeSettings` yang berisi `home_team`, `away_team`, `league` dari request body. Akibatnya, Match Guard di backend tidak bisa di-bypass untuk tim yang tidak dikenali.

## Perubahan

### File: `supabase/functions/openai-chat/index.ts`

**1. Extract parameter tambahan dari request body (baris 85)**

Dari:
```typescript
const { message, conversationHistory = [] } = await req.json();
```

Menjadi:
```typescript
const { message, conversationHistory = [], fixture_id, match_data } = await req.json();
```

**2. Tambahkan konteks pertandingan ke system prompt atau user message**

Jika `match_data` tersedia, inject informasi pertandingan ke dalam pesan agar AI memiliki konteks:

```typescript
// Build match context string
let matchContext = '';
if (match_data) {
  matchContext = `\n\n📋 KONTEKS PERTANDINGAN SAAT INI:
- Home Team: ${match_data.homeTeam || 'N/A'}
- Away Team: ${match_data.awayTeam || 'N/A'}
- Liga: ${match_data.league || 'N/A'}
${fixture_id ? `- Fixture ID: ${fixture_id}` : ''}
${match_data.startingAt ? `- Kickoff: ${match_data.startingAt}` : ''}
${match_data.venue ? `- Venue: ${match_data.venue}` : ''}`;
}
```

**3. Sertakan konteks di messages array**

Tambahkan `matchContext` ke system prompt saat memanggil AI:

```typescript
const messages: ChatMessage[] = [
  { role: 'system', content: SYSTEM_PROMPT + matchContext },
  ...conversationHistory.map(...),
  { role: 'user', content: message }
];
```

**4. Tambahkan `modeSettings` di request ke AI gateway (opsional)**

Jika backend Predicto memerlukan `modeSettings` secara eksplisit:

```typescript
body: JSON.stringify({
  model: 'google/gemini-3-flash-preview',
  messages: messages,
  temperature: 0.7,
  max_tokens: 2000,
  ...(match_data && {
    modeSettings: {
      home_team: match_data.homeTeam,
      away_team: match_data.awayTeam,
      league: match_data.league,
    }
  })
})
```

## Ringkasan

| Komponen | Perubahan |
|----------|-----------|
| Request parsing | Extract `fixture_id` dan `match_data` dari body |
| System prompt | Inject konteks pertandingan jika tersedia |
| AI gateway call | Sertakan `modeSettings` dengan `home_team`, `away_team`, `league` |

Hanya satu file yang perlu diubah: `supabase/functions/openai-chat/index.ts`.

