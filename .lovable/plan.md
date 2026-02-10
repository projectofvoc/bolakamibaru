
# Fix: Sidebar Banners Tampil di Mac Tanpa Zoom Out

## Masalah
Breakpoint `min-[1800px]` terlalu besar untuk Mac. Layar Mac:
- MacBook Air: 1440px
- MacBook Pro 14": 1512px  
- MacBook Pro 16": 1728px

Dengan container 1400px dan banner 160px, secara matematis **tidak mungkin** menempatkan banner 160px di luar container pada layar 1440-1728px tanpa overlap.

## Solusi: Responsive Banner Size

Gunakan **dua tier ukuran banner**:

| Viewport | Banner Width | Breakpoint | Offset |
|----------|-------------|------------|--------|
| 1536px - 1799px | **120px** (lebih kecil) | `min-[1536px]` | 730px |
| 1800px+ | **160px** (normal) | `min-[1800px]` | 880px |

### Perhitungan Tier Kecil (120px banner)
- Container 1400px, half = 700px
- Gap = 10px, banner = 120px
- Offset = 700 + 10 + 120 = **730px**
- Pada 1536px: 768 - 730 = **38px** dari edge (aman)
- Pada 1728px (Mac Pro 16"): 864 - 730 = **134px** dari edge (aman)

### Perubahan di `src/components/SidebarBanners.tsx`

1. **Breakpoint diturunkan ke `min-[1536px]`** -- mencakup semua Mac kecuali Air 13" (1440px)

2. **Banner div menggunakan responsive width**:
   - `w-[120px] min-[1800px]:w-[160px]`
   - `aspect-[4/15]` tetap sama

3. **Positioning menggunakan CSS variable atau responsive style**:
   - 1536-1799px: `max(16px, calc(50% - 730px))`
   - 1800px+: `max(16px, calc(50% - 880px))`
   - Implementasi via JavaScript: deteksi `window.innerWidth` untuk memilih offset, atau gunakan dua div dengan `hidden`/`block` breakpoint

4. **Pendekatan implementasi**: Gunakan `window.innerWidth` di `getPositionStyle` untuk menentukan offset yang tepat berdasarkan viewport, plus `resize` event listener untuk update saat resize.

### Perubahan Konkret

```tsx
// getPositionStyle updated
const getPositionStyle = (side: 'left' | 'right') => {
  const isLargeScreen = windowWidth >= 1800;
  
  if (variant === 'article') {
    const offset = isLargeScreen ? 628 : 538; // 448+10+80 for small
    return side === 'left' 
      ? { left: `max(16px, calc(50% - ${offset}px))` }
      : { right: `max(16px, calc(50% - ${offset}px))` };
  }
  
  const offset = isLargeScreen ? 880 : 730;
  return side === 'left'
    ? { left: `max(16px, calc(50% - ${offset}px))` }
    : { right: `max(16px, calc(50% - ${offset}px))` };
};
```

- Banner width: `w-[120px] min-[1800px]:w-[160px]`
- Breakpoint visibility: `hidden min-[1536px]:block`
- Tambah `windowWidth` state dengan `resize` listener

### Article Variant (Tier Kecil)
- max-w-4xl = 896px, half = 448px
- Gap 10px + banner 120px = offset **578px**
- Pada 1536px: 768 - 578 = 190px (aman)

## Dampak
- MacBook Pro 14" (1512px): **belum tampil** (breakpoint 1536px)
- MacBook Pro 16" (1728px): **tampil** dengan banner 120px
- Monitor 1920px+: **tampil** dengan banner 120px  
- Monitor 1800px+: **upgrade** ke banner 160px
- Tidak ada overlap karena offset dihitung per tier
