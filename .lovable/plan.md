
## Rencana Perbaikan: LazyImage Tidak Memuat Gambar dengan Benar

### Masalah yang Ditemukan

Komponen `LazyImage` memiliki bug pada struktur CSS:

| Masalah | Dampak |
|---------|--------|
| Wrapper `div` tidak memiliki `w-full h-full` | Gambar tidak mengisi container parent |
| Skeleton placeholder tidak sinkron dengan ukuran gambar | Loading skeleton tidak sesuai ukuran |
| Gambar dalam `opacity: 0` tapi parent tidak punya dimensi | Gambar tampak tidak dimuat |

---

### Solusi

#### 1. Perbaiki `LazyImage.tsx`

Tambahkan `w-full h-full` pada wrapper div agar mewarisi dimensi dari parent container:

**Sebelum:**
```tsx
<div className={cn('relative overflow-hidden', wrapperClassName)}>
```

**Sesudah:**
```tsx
<div className={cn('relative overflow-hidden w-full h-full', wrapperClassName)}>
```

---

### File yang Akan Dimodifikasi

| File | Perubahan |
|------|-----------|
| `src/components/ui/LazyImage.tsx` | Tambahkan `w-full h-full` pada wrapper div |

---

### Kode Lengkap Perbaikan

```tsx
// LazyImage.tsx - Perubahan pada line 30
return (
  <div className={cn('relative overflow-hidden w-full h-full', wrapperClassName)}>
    {/* Skeleton placeholder */}
    {!isLoaded && (
      <div className="absolute inset-0 bg-muted animate-pulse" />
    )}
    
    <img
      src={hasError ? fallback : src}
      alt={alt}
      loading="lazy"
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    />
  </div>
);
```

---

### Hasil yang Diharapkan

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| Gambar dalam container `aspect-[4/3]` | Tidak terlihat / partial | Tampil penuh |
| Skeleton loading | Ukuran tidak konsisten | Sesuai container |
| Fade-in effect | Gambar muncul terpotong | Smooth fade-in |

---

### Langkah Verifikasi Setelah Perbaikan

1. Scroll halaman beranda dan pastikan semua gambar artikel tampil penuh
2. Cek section "Berita Populer" di sidebar kanan
3. Cek section "Latest Updates" 
4. Navigasi ke halaman `/berita` dan `/klasemen`

---

### Detail Teknis

Perubahan ini **minimal** (hanya 1 file, 1 baris) tetapi **kritis** karena:
- CSS `w-full h-full` memastikan wrapper mengambil 100% width dan height dari parent
- Skeleton placeholder (`absolute inset-0`) akan bekerja dengan benar karena parent punya dimensi
- Gambar dengan `w-full h-full object-cover` akan mengisi wrapper sepenuhnya

Tidak ada perubahan pada komponen lain yang sudah menggunakan `LazyImage` karena mereka sudah memiliki container dengan dimensi yang benar (seperti `aspect-[4/3]`).
