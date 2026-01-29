
## Rencana Implementasi: Lazy Loading untuk Semua Images

### Analisis Temuan

Terdapat **25 file** dengan total **~160 penggunaan `<img>`** yang perlu dioptimasi. Saya mengidentifikasi 3 kategori:

| Kategori | Jumlah File | Prioritas |
|----------|-------------|-----------|
| **Halaman Publik** (User-facing) | 15 | Tinggi |
| **CMS/Admin** | 6 | Rendah |
| **Modal/Dialog** | 4 | Sedang |

---

### Pendekatan Implementasi

#### Opsi 1: Komponen `LazyImage` Reusable (Direkomendasikan)

Membuat komponen universal yang menggantikan semua `<img>` dengan fitur:
- Native `loading="lazy"` (didukung 95%+ browser)
- Skeleton placeholder saat loading
- Fade-in animation setelah loaded
- Error fallback dengan placeholder

```typescript
// src/components/ui/LazyImage.tsx
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  aspectRatio?: string; // e.g., "16/9", "4/3", "3/4"
}
```

#### Opsi 2: Native `loading="lazy"` Saja (Lebih Cepat)

Menambahkan `loading="lazy"` ke semua existing `<img>` tags tanpa wrapper component.

---

### Rencana Perubahan (Opsi 1 - Komponen LazyImage)

#### File Baru: `src/components/ui/LazyImage.tsx`

```typescript
const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className, 
  fallback = '/placeholder.svg',
  aspectRatio,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative ${aspectRatio ? `aspect-[${aspectRatio}]` : ''}`}>
      {/* Skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      
      <img 
        src={hasError ? fallback : src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    </div>
  );
};
```

---

### Daftar File yang Akan Dimodifikasi

#### Prioritas Tinggi (Halaman Publik)

| File | Jumlah `<img>` | Perubahan |
|------|----------------|-----------|
| `src/components/NewsGrid.tsx` | 1 | Ganti dengan `LazyImage` |
| `src/components/MoreNewsGrid.tsx` | 1 | Ganti dengan `LazyImage` |
| `src/components/PopularNewsSidebar.tsx` | 1 | Ganti dengan `LazyImage` |
| `src/components/LatestUpdates.tsx` | 1 | Ganti dengan `LazyImage` |
| `src/components/HeroDashboard.tsx` | 0 (background-image) | Tidak perlu diubah |
| `src/pages/NewsDetail.tsx` | 1 | Ganti dengan `LazyImage` |
| `src/pages/Berita.tsx` | 1 | Ganti dengan `LazyImage` |
| `src/pages/BeritaTag.tsx` | 1 | Ganti dengan `LazyImage` |
| `src/pages/Liga.tsx` | 3 | Ganti dengan `LazyImage` |
| `src/pages/Klasemen.tsx` | 1 | Ganti dengan `LazyImage` |
| `src/components/BestMomentsCarousel.tsx` | 2 | Sudah ada `LazyThumbnail` |
| `src/components/Header.tsx` | 1 (logo) | Tambah `loading="lazy"` |
| `src/components/Footer.tsx` | 0 | Tidak ada img |
| `src/components/AdvertisementPopup.tsx` | 1 | Ganti dengan `LazyImage` |

#### Prioritas Rendah (CMS - Optional)

| File | Jumlah `<img>` | Catatan |
|------|----------------|---------|
| `src/pages/cms/CMSAnalytics.tsx` | 1 | Admin only |
| `src/pages/cms/CMSArticleEditor.tsx` | 1 | Preview only |
| `src/pages/cms/CMSLeagues.tsx` | 1 | Admin only |
| `src/pages/cms/CMSOGPreview.tsx` | 1 | Preview only |

---

### Implementasi Detail

#### 1. Buat komponen `LazyImage.tsx`

Komponen universal dengan skeleton, fade-in, dan error handling.

#### 2. Update komponen publik

Contoh perubahan di `NewsGrid.tsx`:

```typescript
// SEBELUM
<img
  src={article.featured_image || 'placeholder.jpg'}
  alt={title}
  className="w-full h-full object-cover"
/>

// SESUDAH
<LazyImage
  src={article.featured_image || 'placeholder.jpg'}
  alt={title}
  className="w-full h-full object-cover"
  fallback="/placeholder.svg"
/>
```

#### 3. Logo dan gambar kecil

Untuk logo di Header (selalu terlihat di viewport), gunakan `loading="eager"` atau biarkan default.

---

### Estimasi Hasil

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| Initial page load | Semua gambar diload | Hanya above-fold |
| LCP (Largest Contentful Paint) | Lambat | Lebih cepat |
| Data usage (mobile) | Tinggi | Berkurang 40-60% |
| UX saat scroll | Langsung tampil | Skeleton → fade-in |

---

### Catatan Penting

1. **BestMomentsCarousel sudah optimal** - Sudah memiliki `LazyThumbnail` component
2. **Logo Header tidak perlu lazy** - Selalu visible di viewport atas
3. **Background images (HeroDashboard)** - CSS background-image tidak support native lazy loading, tetapi sudah optimal karena hero
4. **CMS pages optional** - Admin pages tidak perlu prioritas tinggi

---

### Total Perubahan

- **1 file baru**: `src/components/ui/LazyImage.tsx`
- **~12 file dimodifikasi**: Mengganti `<img>` dengan `<LazyImage>`
- **Tidak ada perubahan database**
- **Tidak ada perubahan Edge Functions**
