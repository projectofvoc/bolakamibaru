
# Update URL Prediksi AI

## Perubahan

Ganti semua URL Prediksi AI ke `https://preview--parlay-predictor-pal.lovable.app/chat`.

## Detail Teknis

### 1. Database: Tabel `nav_items`
Record dengan label "Prediksi AI" saat ini mengarah ke `https://parlay-predictor-pal.lovable.app`. Update path-nya via SQL migration:

```sql
UPDATE nav_items 
SET path = 'https://preview--parlay-predictor-pal.lovable.app/chat'
WHERE id = '333e5cae-86d2-49af-9697-0f8496305798';
```

### 2. Footer: `src/components/Footer.tsx`
Ganti `https://vocparlay.com/` menjadi `https://preview--parlay-predictor-pal.lovable.app/chat` pada link "Prediksi AI" di bagian Tautan Cepat.

| File / Lokasi | URL Lama | URL Baru |
|---------------|----------|----------|
| DB `nav_items` (Header navigasi) | `https://parlay-predictor-pal.lovable.app` | `https://preview--parlay-predictor-pal.lovable.app/chat` |
| `src/components/Footer.tsx` (Tautan Cepat) | `https://vocparlay.com/` | `https://preview--parlay-predictor-pal.lovable.app/chat` |
