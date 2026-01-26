

## Rencana: Halaman Klasemen (Standings)

### Tujuan
Membuat halaman Klasemen baru yang dapat diakses melalui navigasi **Berita → Klasemen** dengan fitur pemilihan liga menggunakan dropdown, menampilkan tabel klasemen lengkap dengan logo klub.

---

### Komponen yang Akan Dibuat/Dimodifikasi

#### 1. Edge Function Baru: `sportmonks-standings`
Membuat edge function untuk mengambil data klasemen dari Sportmonks API.

**Endpoint yang digunakan:**
- `GET /v3/football/standings/seasons/{SEASON_ID}?api_token=...&include=participant;details`

**Mapping Liga ke Season ID:**
Liga yang akan didukung (sama dengan yang ada di website):
- Liga 1 Indonesia (catatan: Sportmonks mungkin tidak mendukung, perlu fallback API-Football)
- Premier League
- La Liga  
- Serie A
- Bundesliga
- Champions League

**Data yang dikembalikan:**
```typescript
interface StandingTeam {
  position: number;
  teamId: number;
  teamName: string;
  teamLogo: string;
  played: number;      // Main
  won: number;         // Menang
  drawn: number;       // Seri
  lost: number;        // Kalah
  goalsFor: number;    // Goal
  goalsAgainst: number;
  goalDifference: number; // -/+
  points: number;      // Poin
}
```

#### 2. Page Baru: `src/pages/Klasemen.tsx`
Membuat halaman klasemen dengan UI sesuai screenshot referensi:

**Struktur halaman:**
- Header dengan judul "KLASEMEN [NAMA LIGA]"
- Dropdown pemilih liga (kanan atas)
- Tabel klasemen dengan kolom: Pos, Team (logo + nama), Main, Poin, Menang, Seri, Kalah, Goal, -/+
- Highlight zona Champions League (hijau), zona Europa League (biru), zona degradasi (merah)

**UI Components yang digunakan:**
- `Select` dari Radix UI untuk dropdown liga
- `Table` untuk tabel klasemen
- Logo klub dari API Sportmonks

#### 3. Update Navigasi: `src/components/Header.tsx`
Menambahkan submenu "Klasemen" di dropdown **Berita**:

```typescript
const beritaSubmenu = [
  { key: 'berita.trending', path: '/berita/trending' },
  { key: 'berita.daily', path: '/berita/daily' },
  { key: 'berita.analisa', path: '/berita/analisa' },
  { key: 'berita.klasemen', path: '/klasemen' },  // BARU
];
```

#### 4. Update Routing: `src/App.tsx`
Menambahkan route baru:
```typescript
<Route path="/klasemen" element={<Klasemen />} />
```

#### 5. Update Translations: `src/contexts/LanguageContext.tsx`
Menambahkan terjemahan untuk klasemen:
```typescript
'berita.klasemen': { id: 'Klasemen', en: 'Standings' },
'klasemen.title': { id: 'Klasemen', en: 'Standings' },
'klasemen.position': { id: 'Pos', en: 'Pos' },
'klasemen.team': { id: 'Team', en: 'Team' },
'klasemen.played': { id: 'Main', en: 'P' },
'klasemen.won': { id: 'Menang', en: 'W' },
'klasemen.drawn': { id: 'Seri', en: 'D' },
'klasemen.lost': { id: 'Kalah', en: 'L' },
'klasemen.points': { id: 'Poin', en: 'Pts' },
'klasemen.goals': { id: 'Goal', en: 'GF' },
'klasemen.goalDiff': { id: '-/+', en: 'GD' },
```

#### 6. Hook Baru: `src/hooks/useStandings.ts`
Custom hook untuk fetch data klasemen dengan React Query.

---

### Alur Kerja (Flow)

```text
┌─────────────────────────────────────────────────────────────┐
│  User klik Berita → Klasemen di Navbar                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Halaman /klasemen dibuka                                   │
│  Default: Liga 1 Indonesia (atau liga pertama tersedia)     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  useStandings hook dipanggil dengan leagueId                │
│  → Invoke edge function sportmonks-standings                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Edge Function:                                             │
│  1. Map leagueId ke Sportmonks season ID                    │
│  2. Fetch standings dari Sportmonks API                     │
│  3. Include participant (logo, nama) dan details (stats)    │
│  4. Transform dan return data                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Render tabel klasemen:                                     │
│  - Logo klub dari API                                       │
│  - Highlight zona sesuai posisi                             │
│  - User bisa ganti liga via dropdown                        │
└─────────────────────────────────────────────────────────────┘
```

---

### Detail Teknis

#### Edge Function `sportmonks-standings`

```typescript
// supabase/functions/sportmonks-standings/index.ts

// Season ID mapping (harus diupdate setiap musim)
const leagueSeasonMapping: Record<string, number> = {
  'liga-1': 23614,        // Liga 1 2024/25
  'premier-league': 23614, // EPL 2024/25
  'la-liga': 23615,       // La Liga 2024/25
  'serie-a': 23616,       // Serie A 2024/25
  'bundesliga': 23617,    // Bundesliga 2024/25
  'champions-league': 23618, // UCL 2024/25
};

// Endpoint: /v3/football/standings/seasons/{SEASON_ID}
// Include: participant (untuk logo & nama), details (untuk stats)
```

#### Komponen Klasemen Page

```tsx
// src/pages/Klasemen.tsx

const Klasemen = () => {
  const [selectedLeague, setSelectedLeague] = useState('liga-1');
  const { data: standings, isLoading } = useStandings(selectedLeague);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/20 via-background to-background py-12">
          {/* Title + Dropdown */}
        </section>
        
        {/* Standings Table */}
        <section className="py-8">
          <Table>
            {/* Pos | Team (logo+nama) | Main | Poin | Menang | Seri | Kalah | Goal | -/+ */}
          </Table>
        </section>
      </main>
      <Footer />
    </div>
  );
};
```

#### Styling Sesuai Screenshot

- **Dropdown liga**: Posisi kanan atas, dengan checkmark untuk liga aktif
- **Header tabel**: Background muted, uppercase, font-medium
- **Baris tim**: 
  - Zona Champions League (posisi 1-4): Border-left hijau
  - Zona degradasi (posisi bawah): Border-left merah
  - Logo klub: 32x32px, di samping kiri nama tim
- **Kolom Poin**: Font-bold
- **Hover row**: Background highlight

---

### File yang Akan Dibuat/Dimodifikasi

| File | Aksi | Deskripsi |
|------|------|-----------|
| `supabase/functions/sportmonks-standings/index.ts` | Buat | Edge function untuk fetch klasemen |
| `supabase/config.toml` | Ubah | Tambahkan config untuk function baru |
| `src/pages/Klasemen.tsx` | Buat | Halaman klasemen utama |
| `src/hooks/useStandings.ts` | Buat | Custom hook untuk fetch standings |
| `src/App.tsx` | Ubah | Tambahkan route /klasemen |
| `src/components/Header.tsx` | Ubah | Tambahkan submenu Klasemen di Berita |
| `src/contexts/LanguageContext.tsx` | Ubah | Tambahkan translations |

---

### Pertimbangan

1. **Season ID dinamis**: Sportmonks menggunakan season ID yang berubah setiap musim. Perlu cara untuk update otomatis atau manual via CMS.

2. **Liga 1 Indonesia**: Mungkin tidak tersedia di Sportmonks (berdasarkan catatan di kode fixtures). Jika tidak tersedia, perlu fallback ke API-Football yang sudah ada.

3. **Caching**: Klasemen tidak berubah terlalu sering, bisa cache selama 5-10 menit untuk menghemat API calls.

4. **Responsive**: Tabel perlu scroll horizontal di mobile karena banyak kolom.

