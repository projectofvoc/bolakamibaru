

## Rencana: Ganti "Analisa Klub" menjadi "Prediksi"

### Ringkasan Perubahan

User ingin mengganti menu "Analisa Klub" di dropdown navigasi menjadi **"Prediksi"** yang akan menampilkan konten berita prediksi pertandingan (seperti contoh dari bola.net).

### Status Saat Ini

| Komponen | Nilai Saat Ini | Nilai Baru |
|----------|---------------|------------|
| Dropdown Menu | "Analisa Klub" / "Club Analysis" | "Prediksi" / "Predictions" |
| Route | `/berita/analisa` | `/berita/prediksi` |
| Kategori DB | "Analisa" (sudah ada) | "Prediksi" (perlu update/tambah) |

### Struktur Konten Prediksi (Berdasarkan Referensi bola.net)

Artikel prediksi biasanya memiliki struktur:
1. **Judul**: "Prediksi [Tim A] vs [Tim B] [Tanggal]"
2. **Intro**: Konteks pertandingan (pekan ke-?, liga apa, venue, waktu kick-off)
3. **Analisa Tim**: Kondisi kedua tim, performa terakhir, tekanan/momentum
4. **Prediksi Starting XI**: Formasi dan lineup kedua tim
5. **Head to Head**: Statistik pertemuan sebelumnya
6. **5 Laga Terakhir**: Form kedua tim
7. **Prediksi Skor**: Perkiraan hasil akhir

### File yang Akan Dimodifikasi

| File | Perubahan |
|------|-----------|
| `src/contexts/LanguageContext.tsx` | Ganti translation `berita.analisa` dari "Analisa Klub" menjadi "Prediksi" |
| `src/components/Header.tsx` | Ganti path `/berita/analisa` menjadi `/berita/prediksi` di beritaSubmenu |
| `src/pages/Berita.tsx` | Update filterTypes: ganti `id: 'analisa'` menjadi `id: 'prediksi'`, update nama dan deskripsi |
| Database `categories` | Update kategori "Analisa" menjadi "Prediksi" atau tambah kategori baru |

### Detail Perubahan

#### 1. LanguageContext.tsx

```typescript
// Ubah dari:
'berita.analisa': { id: 'Analisa Klub', en: 'Club Analysis' },

// Menjadi:
'berita.prediksi': { id: 'Prediksi', en: 'Predictions' },
```

#### 2. Header.tsx - beritaSubmenu

```typescript
const beritaSubmenu = [
  { key: 'berita.trending', path: '/berita/trending' },
  { key: 'berita.daily', path: '/berita/daily' },
  { key: 'berita.prediksi', path: '/berita/prediksi' },  // Ganti dari 'analisa'
  { key: 'berita.klasemen', path: '/klasemen' },
];
```

#### 3. Berita.tsx - filterTypes

```typescript
const filterTypes: FilterInfo[] = [
  { 
    id: 'trending', 
    name: { id: 'Trending', en: 'Trending' }, 
    icon: TrendingUp,
    description: { id: 'Berita paling populer dan viral', en: 'Most popular and viral news' }
  },
  { 
    id: 'daily', 
    name: { id: 'Update Harian', en: 'Daily Updates' }, 
    icon: Calendar,
    description: { id: 'Berita terbaru hari ini', en: 'Today\'s latest news' }
  },
  { 
    id: 'prediksi',  // Ganti dari 'analisa'
    name: { id: 'Prediksi', en: 'Predictions' },  // Ganti nama
    icon: Target,  // Ganti icon dari BarChart3 ke Target (lebih cocok untuk prediksi)
    description: { id: 'Prediksi skor dan analisa pertandingan', en: 'Match predictions and analysis' }
  },
];
```

#### 4. Database - Update Kategori

Opsi A: Update nama kategori yang ada
```sql
UPDATE categories SET name = 'Prediksi', icon = '🎯' WHERE name = 'Analisa';
```

Opsi B: Tambah kategori baru "Prediksi" (jika ingin mempertahankan "Analisa")
```sql
INSERT INTO categories (name, icon, sort_order, is_active) 
VALUES ('Prediksi', '🎯', 3, true);
```

**Rekomendasi**: Opsi A (update) karena lebih clean dan tidak ada duplikasi.

#### 5. Berita.tsx - Filter Logic untuk Prediksi

Tambah logic untuk menampilkan artikel dengan kategori "Prediksi" saat filter aktif:

```typescript
// Di dalam komponen, tambahkan filtering berdasarkan kategori
const getFilteredArticles = () => {
  if (!allArticles) return [];
  
  switch (filter) {
    case 'prediksi':
      return allArticles.filter(a => a.category === 'Prediksi');
    case 'trending':
      // existing logic...
    case 'daily':
      // existing logic...
    default:
      return allArticles;
  }
};
```

### Hasil Akhir

Setelah implementasi:
1. **Dropdown "BERITA"** akan menampilkan:
   - Trending
   - Update Harian
   - **Prediksi** (bukan "Analisa Klub" lagi)
   - Klasemen

2. **Halaman /berita/prediksi** akan menampilkan:
   - Artikel-artikel dengan kategori "Prediksi"
   - Deskripsi: "Prediksi skor dan analisa pertandingan"
   - Icon Target (🎯)

3. **CMS Article Editor** akan memiliki:
   - Kategori "Prediksi" tersedia di dropdown
   - Admin bisa membuat artikel prediksi dengan struktur seperti contoh bola.net

### Technical Notes

- Icon yang cocok untuk "Prediksi": `Target` dari lucide-react (lebih representatif daripada `BarChart3`)
- Route tetap menggunakan pola `/berita/{filter}` yang sudah ada
- Tidak perlu buat halaman baru, cukup update filter dan kategori

