

# Fix: Banner Lebih Besar, Container Utama Lebih Sempit di Mac

## Masalah
Banner 80px terlalu kecil dan tidak proporsional. Konten utama (container 1400px) terlalu lebar untuk layar Mac sehingga tidak menyisakan ruang cukup untuk banner berukuran layak.

## Solusi: Banner 140px + Container Lebih Sempit

Pada layar Mac (1440-1799px), container utama dikecilkan lebih agresif agar banner bisa berukuran **140px** (hampir sama dengan 160px di desktop).

### Perhitungan

| Viewport | Container | Ruang/Sisi | Banner | Gap | Sisa Edge |
|----------|-----------|-----------|--------|-----|-----------|
| 1440px (Air) | 1120px | 160px | 140px | 10px | 10px |
| 1512px (Pro 14") | 1192px | 160px | 140px | 10px | 10px |
| 1728px (Pro 16") | 1400px | 164px | 140px | 10px | 14px |
| 1800px+ (Desktop) | 1400px | 200px+ | 160px | 20px | 20px+ |

**Rumus container Mac:** `calc(100vw - 320px)` capped at 1400px

### Article Variant (max-w-4xl = 896px)
Container artikel sudah cukup sempit, tidak perlu di-shrink. Hanya banner yang perlu diperbesar:
- Offset = 448 + 10 + 140 = **598px**
- Pada 1440px: gap 10px dari container (aman)

## Detail Teknis

### 1. `src/index.css` - Container shrink lebih agresif
```css
@media (min-width: 1440px) and (max-width: 1799px) {
  .container {
    max-width: min(1400px, calc(100vw - 320px)) !important;
  }
}
```

### 2. `src/components/SidebarBanners.tsx`

**Banner width:** `w-[80px]` menjadi `w-[140px]`
```
w-[140px] min-[1800px]:w-[160px]
```

**Offset calculation (getPositionStyle):**

Home variant (1440-1799px):
- containerWidth = min(1400, windowWidth - 320)
- offset = containerWidth/2 + 10 + 140

Home variant (1800px+):
- offset = 880 (tidak berubah)

Article variant:
- Small (1440-1799px): offset = 448 + 10 + 140 = **598**
- Large (1800px+): offset = 628 (tidak berubah)

### Verifikasi Matematika

**MacBook Air 1440px (Home):**
- Container: min(1400, 1120) = 1120px
- Half: 560px, offset: 560 + 10 + 140 = 710
- Banner left edge: calc(50% - 710) = 720 - 710 = 10px
- Banner right edge: 150px
- Container left edge: 160px
- Gap: 10px (aman, tidak overlap)

**MacBook Air 1440px (Article):**
- Container: 896px (max-w-4xl)
- Half: 448px, offset: 598
- Banner left edge: 720 - 598 = 122px
- Banner right edge: 262px
- Container left edge: 272px
- Gap: 10px (aman)

**MacBook Pro 16" 1728px (Home):**
- Container: min(1400, 1408) = 1400px
- Half: 700px, offset: 700 + 10 + 140 = 850
- Banner left edge: 864 - 850 = 14px
- Banner right edge: 154px
- Container left edge: 164px
- Gap: 10px (aman)

## Ringkasan Perubahan

| File | Perubahan |
|------|----------|
| `src/index.css` | Container shrink: `vw - 200` menjadi `vw - 320` |
| `src/components/SidebarBanners.tsx` | Banner: `80px` menjadi `140px`, offset home kecil via formula, offset article kecil: 598 |

