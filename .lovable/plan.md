

# Fix: Sidebar Banners Hilang di Desktop

## Masalah
Breakpoint dinaikkan ke `min-[2100px]` yang terlalu tinggi -- hampir tidak ada monitor konsumer yang selebar itu. Akibatnya banner hilang di semua layar termasuk monitor Full HD 1920px.

## Akar Masalah Sebelumnya
Offset positioning menggunakan `720px` (bukan `640px` yang merupakan setengah dari max-w-7xl 1280px), sehingga banner butuh viewport sangat lebar. Perhitungan: `calc(50% - 720px - 180px)` = butuh 1800px+ agar posisi positif.

## Solusi

### `src/components/SidebarBanners.tsx`

1. **Turunkan breakpoint ke `min-[1800px]`** -- cukup untuk menampung banner 160px di sisi kiri/kanan konten 1280px dengan gap wajar.

2. **Perbaiki offset positioning** -- gunakan `640px` (setengah dari 1280px max-w-7xl) + `20px` gap + `160px` banner = `820px` dari center. Formula baru:
   - Home: `calc(50% - 820px)` -- pada 1920px: posisi = 960 - 820 = **140px** dari edge (aman)
   - Home: `calc(50% - 820px)` -- pada 1800px: posisi = 900 - 820 = **80px** dari edge (aman)
   - Article: `calc(50% - 628px)` -- (448px + 20px gap + 160px banner)

3. **Pertahankan `max(16px, ...)` clamping** sebagai safety net.

Perubahan konkret:
- Breakpoint: `min-[2100px]:block` menjadi `min-[1800px]:block`
- Home left: `max(16px, calc(50% - 820px))`
- Home right: `max(16px, calc(50% - 820px))`
- Article left: `max(16px, calc(50% - 628px))`
- Article right: `max(16px, calc(50% - 628px))`

## Perhitungan Verifikasi

| Viewport | Home Position | Article Position | Status |
|----------|--------------|-----------------|--------|
| 1800px   | 80px         | 272px           | Aman   |
| 1920px   | 140px        | 332px           | Aman   |
| 2560px   | 460px        | 652px           | Aman   |

## Dampak
- Banner kembali tampil di monitor 1800px ke atas
- Tidak akan pernah terpotong berkat clamping `max(16px, ...)`
- MacBook standar (1440px-1728px) tetap tidak menampilkan banner (breakpoint 1800px)
