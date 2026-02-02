
# Plan: Optimasi Fadeout Sidebar Banners

## Masalah Saat Ini

Banner sidebar saat ini menggunakan threshold statis (`documentHeight - windowHeight - 400`) yang belum optimal untuk mendeteksi area "Berita Terkait". Banner perlu fadeout lebih awal agar tidak menutupi konten di bagian bawah.

## Solusi

### 1. Perubahan di `SidebarBanners.tsx`

Menggunakan pendekatan yang lebih akurat dengan mendeteksi elemen "Berita Terkait" secara langsung:

```text
Logika Baru:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. Hitung posisi bawah banner (fixed top-24 + banner       │
│     height 450px)                                           │
│                                                             │
│  2. Cari elemen "Berita Terkait" section di halaman         │
│                                                             │
│  3. Jika posisi bawah banner >= posisi atas "Berita         │
│     Terkait" → fadeout banner                               │
│                                                             │
│  4. Tambah buffer 100px untuk margin keamanan               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Perubahan Teknis

**File:** `src/components/SidebarBanners.tsx`

```text
Sebelum:
  const hideThreshold = documentHeight - windowHeight - 400;
  setIsVisible(scrollY < hideThreshold);

Sesudah:
  // Posisi bawah banner = scroll + top offset (96px) + banner height (450px)
  const bannerBottom = scrollY + 96 + 450;
  
  // Cari section "Berita Terkait" atau gunakan fallback
  const relatedSection = document.querySelector('[data-section="related-news"]') 
    || document.querySelector('.related-news-section');
  
  if (relatedSection) {
    const sectionTop = relatedSection.getBoundingClientRect().top + scrollY;
    // Hide banner 100px sebelum mencapai section
    setIsVisible(bannerBottom < sectionTop - 100);
  } else {
    // Fallback: hide pada 600px dari bawah
    const hideThreshold = documentHeight - windowHeight - 600;
    setIsVisible(scrollY < hideThreshold);
  }
```

### 3. Penambahan Data Attribute di NewsDetail.tsx

Menambahkan `data-section="related-news"` pada container "Berita Terkait" untuk deteksi yang akurat.

**File:** `src/pages/NewsDetail.tsx` (baris ~407)

```text
Sebelum:
  <div className="mt-16">

Sesudah:
  <div className="mt-16" data-section="related-news">
```

### 4. Konfirmasi Desktop-Only

Sidebar banners sudah menggunakan `hidden min-[1440px]:block` yang memastikan:
- **Mobile & Tablet (< 1440px):** Banner tersembunyi total
- **Desktop Large (>= 1440px):** Banner tampil dengan fadeout behavior

## File yang Akan Diubah

| File | Perubahan |
|------|-----------|
| `src/components/SidebarBanners.tsx` | Optimalkan logika hideThreshold dengan deteksi elemen |
| `src/pages/NewsDetail.tsx` | Tambah data-attribute pada section related news |

## Hasil yang Diharapkan

- Banner fadeout tepat sebelum section "Berita Terkait"
- Tidak ada konten yang tertutupi oleh banner
- Mobile/tablet tetap tidak menampilkan banner
- Transisi smooth dengan opacity animation
