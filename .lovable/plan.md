
## Rencana: Update Domain dari bolakamibaru.lovable.app ke bolakami.work

### Lokasi Hardcoded URL yang Ditemukan

| File | Line | URL Lama | Perlu Update |
|------|------|----------|--------------|
| `supabase/functions/og-metadata/index.ts` | 44 | `https://bolakamibaru.lovable.app` | Ya |
| `src/pages/NewsDetail.tsx` | 27 | `https://bolakamibaru.lovable.app/og-default.png` | Ya |
| `src/pages/NewsDetail.tsx` | 28 | `https://bolakamibaru.lovable.app/berita/${article.slug}` | Ya |

### Perubahan yang Akan Dilakukan

#### 1. supabase/functions/og-metadata/index.ts (Line 44)

```typescript
// SEBELUM
const siteUrl = 'https://bolakamibaru.lovable.app'

// SESUDAH
const siteUrl = 'https://bolakami.work'
```

Dampak:
- OG meta tags akan mengarah ke domain baru
- Social media crawlers (Facebook, WhatsApp, Twitter) akan mengambil metadata dengan URL yang benar
- Redirect browser setelah crawling akan ke domain baru

#### 2. src/pages/NewsDetail.tsx (Lines 27-28)

```typescript
// SEBELUM
const ogImage = article.featured_image || 'https://bolakamibaru.lovable.app/og-default.png';
const articleUrl = `https://bolakamibaru.lovable.app/berita/${article.slug}`;

// SESUDAH
const ogImage = article.featured_image || 'https://bolakami.work/og-default.png';
const articleUrl = `https://bolakami.work/berita/${article.slug}`;
```

Dampak:
- Client-side meta tags akan menggunakan domain baru
- Canonical URL akan benar untuk SEO
- Default OG image fallback akan ke domain baru

### Ringkasan

| Aspek | Status |
|-------|--------|
| Social Sharing (WhatsApp, Facebook, Twitter) | Akan menggunakan `bolakami.work` |
| SEO Canonical URL | Akan mengarah ke `bolakami.work` |
| OG Image Fallback | Akan ke `bolakami.work/og-default.png` |
| Browser Redirect dari Edge Function | Akan ke `bolakami.work` |

### Catatan Teknis

- Edge function `og-metadata` akan auto-deploy setelah perubahan
- Tidak perlu konfigurasi tambahan karena SSL sudah dihandle otomatis oleh platform
- Pastikan file `og-default.png` tersedia di domain baru (sudah ada di `/public/`)
