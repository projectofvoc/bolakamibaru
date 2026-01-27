
## Rencana: Implementasi Open Graph (OG) Metadata yang Benar untuk Bolakami

### Status Saat Ini

Sebagian besar infrastruktur OG sudah ada dan berfungsi dengan baik:

| Komponen | Status | Catatan |
|----------|--------|---------|
| Data Model Article | Tersedia | `slug`, `title`, `excerpt`, `featured_image`, `published_at`, `category`, `author_name` |
| Edge Function `og-metadata` | Tersedia | Sudah generate HTML dengan semua OG tags + Twitter Cards |
| NewsDetail Sharing | Tersedia | Sudah menggunakan URL edge function untuk share |
| QA/Validation Page | Belum ada | Perlu dibuat |

### Masalah yang Perlu Diperbaiki

1. **Domain URL Tidak Konsisten**
   - Edge function menggunakan `bolakamibaru.lovable.app` sebagai site URL
   - User ingin menggunakan domain `bolakami.work`

2. **Share URL Terekspos**
   - URL share saat ini: `https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/og-metadata?slug=...`
   - Ini mengekspos Supabase project ID (tidak ideal tapi tidak berbahaya)
   - Solusi alternatif: buat route `/share/news/{slug}` yang lebih bersih (opsional)

3. **Tidak Ada QA/Validation Page**
   - Admin tidak punya cara mudah untuk test OG tags sebelum share
   - Perlu utility page untuk preview dan validasi

### Rencana Implementasi

#### A. Update Edge Function `og-metadata` - Domain & Image Dimensions

**File:** `supabase/functions/og-metadata/index.ts`

Perubahan:
1. Ubah `siteUrl` dari `bolakamibaru.lovable.app` ke domain yang konsisten
2. Pastikan `og:image:width` dan `og:image:height` selalu ada (1200x630)
3. Tambahkan `article:published_time` untuk SEO
4. Tambahkan `og:site_name` dengan nilai "Bolakami"

```typescript
// Perubahan utama:
const siteUrl = 'https://bolakamibaru.lovable.app' // atau domain custom jika ada

// Tambahan meta tags:
<meta property="article:published_time" content="${article.published_at || ''}">
<meta property="article:section" content="${article.category}">
```

#### B. Buat QA/Validation Page di CMS

**File Baru:** `src/pages/cms/CMSOGPreview.tsx`

Fitur:
1. Input field untuk slug artikel
2. Preview computed OG values:
   - Title
   - Description/Excerpt  
   - Cover Image (dengan preview visual)
   - URL
   - Published Date
3. Link langsung ke debugger tools:
   - Facebook Sharing Debugger
   - LinkedIn Post Inspector
   - Twitter Card Validator
4. Button untuk test langsung ke edge function

**UI Mockup:**

```text
┌─────────────────────────────────────────────────────────────┐
│  OG Metadata Preview Tool                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Slug: [____arema-fc-kalahkan-bali-united____]  [Preview]   │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Preview Card                                         │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │            [Featured Image]                     │ │  │
│  │  │              1200 x 630                         │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  Title: Arema FC Kalahkan Bali United...              │  │
│  │  Description: Pertandingan sengit...                  │  │
│  │  URL: https://bolakamibaru.lovable.app/news/arema... │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Test dengan Debugger:                                       │
│  [Facebook Debugger] [LinkedIn Inspector] [Twitter Cards]   │
│                                                              │
│  Share URL untuk crawler:                                    │
│  https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/... │
│  [Copy URL]                                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### C. Update Routing untuk CMS OG Preview

**File:** `src/App.tsx`

Tambah route baru di CMS:
```typescript
<Route path="og-preview" element={<CMSOGPreview />} />
```

**File:** `src/pages/cms/index.ts`

Export komponen baru:
```typescript
export { default as CMSOGPreview } from './CMSOGPreview';
```

#### D. (Opsional) Buat Route Share yang Lebih Bersih

Jika diinginkan URL share yang lebih bersih (tanpa ekspos Supabase URL), bisa tambahkan:

**File Baru:** `supabase/functions/share-news/index.ts`

Route: `/share/news/{slug}` 

Ini akan menjadi alias untuk `og-metadata?slug={slug}` dengan URL yang lebih friendly.

Namun ini opsional karena URL saat ini sudah berfungsi dengan baik untuk social media crawlers.

### File yang Akan Dimodifikasi/Dibuat

| File | Aksi | Deskripsi |
|------|------|-----------|
| `supabase/functions/og-metadata/index.ts` | Modify | Tambah meta tags dan perbaiki format |
| `src/pages/cms/CMSOGPreview.tsx` | Create | Halaman QA/validation untuk OG metadata |
| `src/pages/cms/index.ts` | Modify | Export CMSOGPreview |
| `src/App.tsx` | Modify | Tambah route /cms/og-preview |
| `src/pages/cms/CMSLayout.tsx` | Modify | Tambah link ke OG Preview di sidebar |

### Catatan Penting

1. **Mengenai Domain `bolakami.work`**
   - Jika domain custom sudah di-setup, site URL di edge function harus diupdate
   - Saat ini menggunakan `bolakamibaru.lovable.app` (published URL)

2. **Image Requirements**
   - `featured_image` sudah tersimpan sebagai absolute URL di Supabase Storage
   - Semua gambar public dan accessible tanpa auth
   - Ukuran bervariasi, tapi OG tags akan tetap set 1200x630 (browser akan scale)

3. **SSR Sudah Dihandle**
   - Edge function `og-metadata` sudah menghasilkan static HTML dengan OG tags
   - Social crawlers akan mendapat HTML lengkap, bukan JavaScript
   - Browser redirect otomatis ke SPA via meta refresh

### Hasil yang Diharapkan

Setelah implementasi:
1. Semua artikel memiliki OG metadata yang benar untuk social sharing
2. Admin CMS bisa preview dan test OG tags sebelum publish
3. Link debugger tersedia untuk validasi di Facebook, LinkedIn, Twitter
4. Share URL menghasilkan preview card yang proper di semua platform

### Technical Details untuk Developer

**CMSOGPreview Component Structure:**
```typescript
// State
const [slug, setSlug] = useState('');
const [previewData, setPreviewData] = useState<OGPreviewData | null>(null);
const [isLoading, setIsLoading] = useState(false);

// Fetch preview data
const fetchPreview = async () => {
  // Query article from database
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();
  
  // Compute OG values
  setPreviewData({
    title: article.title_id,
    description: article.excerpt_id || '',
    image: article.featured_image,
    url: `https://bolakamibaru.lovable.app/news/${article.slug}`,
    publishedAt: article.published_at,
  });
};

// Debugger URLs
const facebookDebuggerUrl = `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(shareUrl)}`;
const linkedinInspectorUrl = `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(shareUrl)}`;
const twitterCardsUrl = `https://cards-dev.twitter.com/validator`;
```
