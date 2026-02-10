

# Fix: Sidebar Banners Overlap dengan Konten

## Masalah
Container utama menggunakan `max-width: 1400px` (dari Tailwind config), bukan 1280px seperti yang diasumsikan sebelumnya. Akibatnya:

- Setengah konten = **700px** dari center (bukan 640px)
- Offset saat ini `calc(50% - 820px)` menempatkan sisi kanan banner di posisi `calc(50% - 820px + 160px)` = `calc(50% - 660px)`
- Sisi kiri konten dimulai di `calc(50% - 700px)`
- Jadi banner **overlap 40px** ke dalam area konten

## Solusi

### `src/components/SidebarBanners.tsx`

Perbaiki kalkulasi offset berdasarkan container width yang benar (1400px):

- **Home variant**: `700px + 20px gap + 160px banner = 880px`
  - Baru: `max(16px, calc(50% - 880px))`
  - Pada 1920px: posisi = 960 - 880 = 80px (aman, tidak overlap)
  
- **Article variant**: `448px + 20px gap + 160px banner = 628px` (tetap sama, article pakai max-w-4xl = 896px)

Karena offset home sekarang lebih besar (880px), breakpoint `min-[1800px]` masih cukup:
- Pada 1800px: 900 - 880 = 20px, tapi `max(16px, ...)` memastikan minimal 16px

| Viewport | Home Position | Overlap? |
|----------|--------------|----------|
| 1800px   | max(16px, 20px) = 20px | Tidak |
| 1920px   | 80px | Tidak |
| 2560px   | 400px | Tidak |

### Perubahan Konkret
- Home left: `max(16px, calc(50% - 820px))` menjadi `max(16px, calc(50% - 880px))`
- Home right: `max(16px, calc(50% - 820px))` menjadi `max(16px, calc(50% - 880px))`
- Article variant: tidak berubah (sudah benar)
- Breakpoint: tetap `min-[1800px]`
