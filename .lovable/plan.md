
# Plan: Dynamic Placeholder pada AI Companion Widget

## Ringkasan
Mengganti placeholder statis pada input field AI Companion dengan placeholder dinamis yang menampilkan prompt "Analisa pertandingan Club A vs Club B" berdasarkan data pertandingan live atau upcoming secara random.

---

## Analisis Kondisi Saat Ini

### Placeholder Saat Ini (File: `src/components/AICompanion.tsx` baris 243)
```tsx
placeholder={t('ai.placeholder')}
// Menghasilkan: "Contoh: Analisa MU vs Arsenal, fokus head-to-head..."
```

### Sumber Data yang Tersedia
1. **`useLiveScores`** - Menyediakan data pertandingan live dan scheduled
2. **`useUpcomingFixtures`** - Menyediakan data jadwal pertandingan mendatang

---

## Perubahan yang Akan Dilakukan

### 1. Import Hooks (baris 1-8)
Tambahkan import untuk `useLiveScores` dan `useUpcomingFixtures`:
```typescript
import { useLiveScores } from '@/hooks/useLiveScores';
import { useUpcomingFixtures } from '@/hooks/useUpcomingFixtures';
```

### 2. Fetch Data Pertandingan (di dalam komponen)
Tambahkan fetch data dari hooks:
```typescript
const { matches: liveMatches } = useLiveScores();
const { data: upcomingMatches } = useUpcomingFixtures();
```

### 3. Buat Logic untuk Generate Dynamic Placeholder
Tambahkan state dan effect untuk placeholder dinamis:
```typescript
const [dynamicPlaceholder, setDynamicPlaceholder] = useState<string>('');

useEffect(() => {
  // Gabungkan semua pertandingan yang tersedia
  const allMatches: { homeTeam: string; awayTeam: string }[] = [];
  
  // Tambahkan live matches
  liveMatches.forEach(match => {
    allMatches.push({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam
    });
  });
  
  // Tambahkan upcoming matches
  upcomingMatches?.forEach(fixture => {
    allMatches.push({
      homeTeam: fixture.homeTeam.name,
      awayTeam: fixture.awayTeam.name
    });
  });
  
  // Pilih random match
  if (allMatches.length > 0) {
    const randomMatch = allMatches[Math.floor(Math.random() * allMatches.length)];
    const placeholder = language === 'id' 
      ? `Analisa pertandingan ${randomMatch.homeTeam} vs ${randomMatch.awayTeam}`
      : `Analyze ${randomMatch.homeTeam} vs ${randomMatch.awayTeam} match`;
    setDynamicPlaceholder(placeholder);
  } else {
    setDynamicPlaceholder(t('ai.placeholder'));
  }
}, [liveMatches, upcomingMatches, language]);
```

### 4. Update Input Placeholder (baris 243)
```tsx
// SEBELUM
placeholder={t('ai.placeholder')}

// SESUDAH
placeholder={dynamicPlaceholder || t('ai.placeholder')}
```

---

## Flow Logic

```text
┌─────────────────────────────────────────────────────────────┐
│                     Component Mount                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Fetch Live Matches (useLiveScores)                         │
│  Fetch Upcoming Fixtures (useUpcomingFixtures)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Gabungkan semua matches ke dalam satu array                │
│  - Live: match.homeTeam, match.awayTeam                     │
│  - Upcoming: fixture.homeTeam.name, fixture.awayTeam.name   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Random Pick satu pertandingan                              │
│  Math.random() * allMatches.length                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Generate Placeholder:                                       │
│  "Analisa pertandingan {homeTeam} vs {awayTeam}"            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Tampilkan di Input Field                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Contoh Output

Jika ada pertandingan Liverpool vs Manchester City yang sedang live atau upcoming, placeholder akan menampilkan:

**Bahasa Indonesia:**
```
Analisa pertandingan Liverpool vs Manchester City
```

**Bahasa Inggris:**
```
Analyze Liverpool vs Manchester City match
```

---

## File yang Akan Dimodifikasi

| File | Perubahan |
|------|-----------|
| `src/components/AICompanion.tsx` | Tambah import hooks, state, useEffect, dan update placeholder |

---

## Estimasi Waktu
- Implementasi: 3-5 menit
- Testing: 1 menit
