

# Fix: Sidebar Banners Terpotong di Mac

## Akar Masalah

Perhitungan sebelumnya salah. Pada layar Mac, ruang di sisi konten sangat terbatas:

| Layar | Viewport | Ruang per sisi | Banner 120px | Hasil |
|-------|----------|----------------|-------------|-------|
| MacBook Pro 14" | 1512px | 56px | 120px | OVERLAP 64px |
| MacBook Pro 16" | 1728px | 164px | 120px | Muat (sisa 44px) |
| Desktop | 1920px | 260px | 160px | Muat (sisa 100px) |

Rumus: `(viewport - 1400px container) / 2 = ruang per sisi`

Banner 120px + 10px gap = **130px minimum** per sisi. Jadi viewport minimum = 1400 + 260 = **1660px**.

## Solusi: Naikkan Breakpoint + Sesuaikan Ukuran

### Perubahan di `src/components/SidebarBanners.tsx`

**Dua tier yang benar:**

| Tier | Breakpoint | Banner Width | Offset | Gap | Viewport Min |
|------|-----------|-------------|--------|-----|-------------|
| Kecil | `min-[1700px]` | 100px | 810px | 10px | 1700px |
| Besar | `min-[1800px]` | 160px | 880px | 20px | 1800px |

### Verifikasi Matematika

**Tier Kecil (100px banner, offset 810):**
- `left = max(16px, calc(50% - 810px))`
- Banner right edge = `calc(50% - 810px + 100px)` = `calc(50% - 710px)`
- Container left edge = `calc(50% - 700px)`
- Gap = 10px (aman)

| Viewport | Banner Left | Banner Right | Container Left | Gap |
|----------|------------|-------------|---------------|-----|
| 1700px | 40px | 140px | 150px | 10px |
| 1728px (Mac 16") | 54px | 154px | 164px | 10px |
| 1799px | 89.5px | 189.5px | 199.5px | 10px |

**Tier Besar (160px banner, offset 880):**

| Viewport | Banner Left | Banner Right | Container Left | Gap |
|----------|------------|-------------|---------------|-----|
| 1800px | 20px | 180px | 200px | 20px |
| 1920px | 80px | 240px | 260px | 20px |

**Article Variant (max-w-4xl = 896px, half = 448px):**
- Tier kecil: offset = 448 + 10 + 100 = 558px
- Tier besar: offset = 448 + 20 + 160 = 628px (tidak berubah)

### Perubahan Konkret

1. Breakpoint visibility: `hidden min-[1536px]:block` menjadi `hidden min-[1700px]:block`

2. Banner width: `w-[120px] min-[1800px]:w-[160px]` menjadi `w-[100px] min-[1800px]:w-[160px]`

3. `getPositionStyle` offset:
   - Home kecil: 730 menjadi **810**
   - Home besar: 880 (tetap)
   - Article kecil: 578 menjadi **558**
   - Article besar: 628 (tetap)

## Dampak

- MacBook Pro 14" (1512px): tidak tampil (ruang tidak cukup, ini benar)
- MacBook Pro 16" (1728px): **tampil** dengan banner 100px, gap 10px, tidak terpotong
- Desktop 1800px+: tampil dengan banner 160px penuh
- Tidak ada overlap karena offset dihitung dengan benar dari container width

