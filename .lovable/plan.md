

# Fix: Sidebar Banners Terpotong di Mac

## Masalah
Sidebar banners (iklan kiri/kanan) muncul terpotong di layar Mac karena:

1. **Breakpoint terlalu kecil**: Banners muncul mulai dari `min-[1440px]`, tapi pada ukuran itu posisi banner masih di luar viewport
2. **Perhitungan posisi**: `calc(50% - 720px - 180px)` membutuhkan minimal ~1800px viewport agar banner tampil penuh
3. Pada MacBook Pro 14" (1512px) atau 16" (1728px), banner sebagian terlihat tapi terpotong di tepi layar

### Contoh perhitungan:
- MacBook 14" (1512px): posisi left = 756 - 720 - 180 = **-144px** (terpotong 144px)
- MacBook 16" (1728px): posisi left = 864 - 720 - 180 = **-36px** (terpotong 36px)
- Monitor 1920px: posisi left = 960 - 720 - 180 = **60px** (tampil penuh)

## Solusi
Naikkan breakpoint minimum dari `min-[1440px]` ke `min-[1920px]` agar sidebar banners hanya tampil di layar yang cukup lebar. Juga tambahkan `overflow-x: hidden` pada body/main sebagai safety net.

## Perubahan File

### 1. `src/components/SidebarBanners.tsx`
- Ubah breakpoint `min-[1440px]:block` menjadi `min-[1920px]:block` pada kedua banner (kiri dan kanan)
- Ini memastikan banner hanya tampil ketika viewport cukup lebar (1920px+)

### 2. `src/index.css` (optional safety)
- Tambahkan `overflow-x: hidden` pada `body` untuk mencegah horizontal scroll jika ada edge case

## Dampak
- Mac 14"/16" dan laptop standar: sidebar banners tersembunyi, layout bersih tanpa terpotong
- Monitor Full HD (1920px)+: sidebar banners tampil penuh seperti seharusnya
- Tidak ada perubahan pada konten utama atau layout lainnya

