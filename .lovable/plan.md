

# Fix: Sidebar Banners Masih Terpotong di Mac

## Masalah
Meskipun breakpoint sudah dinaikkan ke `min-[1920px]`, banner masih terpotong karena:
- Pada viewport tepat 1920px, posisi left = 960 - 720 - 180 = **60px** -- sangat mepet ke edge
- Dengan scrollbar browser (~15px), ruang efektif menjadi lebih kecil lagi
- Beberapa Mac melaporkan resolusi CSS >= 1920px tapi area tampil efektif lebih kecil

## Solusi
Dua perubahan pada `src/components/SidebarBanners.tsx`:

1. **Clamp posisi dengan CSS `max()`** -- pastikan banner tidak pernah keluar viewport. Gunakan `max(16px, calc(50% - 720px - 180px))` sehingga posisi minimum selalu 16px dari edge layar.

2. **Naikkan breakpoint ke `min-[2100px]`** -- memberikan margin lebih besar. Pada 2100px: posisi = 1050 - 720 - 180 = **150px**, cukup aman untuk semua kasus termasuk scrollbar.

## Perubahan File

### `src/components/SidebarBanners.tsx`
- Ubah breakpoint dari `min-[1920px]:block` menjadi `min-[2100px]:block`
- Ubah style posisi default dari:
  - `left: calc(50% - 720px - 180px)` menjadi `left: max(16px, calc(50% - 720px - 180px))`
  - `right: calc(50% - 720px - 180px)` menjadi `right: max(16px, calc(50% - 720px - 180px))`
- Sama untuk article variant:
  - `left/right: calc(50% - 448px - 180px)` menjadi `left/right: max(16px, calc(50% - 448px - 180px))`

## Dampak
- Banner tidak akan pernah terpotong di layar mana pun
- Hanya tampil di monitor yang benar-benar lebar (2100px+)
- Posisi selalu minimal 16px dari edge viewport
