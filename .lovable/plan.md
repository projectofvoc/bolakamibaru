

# Perbaiki URL Prediksi AI

## Perubahan

Kembalikan URL Prediksi AI ke `https://parlay-predictor-pal.lovable.app` di kedua lokasi.

## Detail Teknis

### 1. Footer: `src/components/Footer.tsx`
Ganti `https://preview--parlay-predictor-pal.lovable.app/chat` menjadi `https://parlay-predictor-pal.lovable.app` pada link "Prediksi AI" di baris 75.

### 2. Database: Tabel `nav_items`
Update record navigasi header:

```sql
UPDATE nav_items 
SET path = 'https://parlay-predictor-pal.lovable.app'
WHERE id = '333e5cae-86d2-49af-9697-0f8496305798';
```

| Lokasi | URL Saat Ini | URL Benar |
|--------|-------------|-----------|
| `src/components/Footer.tsx` | `https://preview--parlay-predictor-pal.lovable.app/chat` | `https://parlay-predictor-pal.lovable.app` |
| DB `nav_items` | `https://preview--parlay-predictor-pal.lovable.app/chat` | `https://parlay-predictor-pal.lovable.app` |

