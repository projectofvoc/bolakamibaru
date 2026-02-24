

## Plan: Ganti `bolakamibaru.lovable.app` → `bolakami.com`

Mengganti semua referensi domain lama ke domain baru `bolakami.com` di seluruh file yang mengandung OG metadata dan URL sharing.

---

### File yang Akan Diubah (8 file, 80 referensi)

#### 1. `supabase/functions/og-metadata/index.ts`
- **Line 44**: `siteUrl` → `https://bolakami.com`
- **Line 25**: default image `og-default.png` → `og-bolakami.png`
- **Line 84**: fallback image `og-default.png` → `og-bolakami.png`

#### 2. `src/pages/NewsDetail.tsx`
- **Line 104**: `ogImage` fallback → `https://bolakami.com/og-bolakami.png`
- **Line 105**: `articleUrl` → `https://bolakami.com/news/...`
- **Line 121**: `shareUrl` → `https://bolakami.com/share/...`

#### 3. `src/pages/Index.tsx`
- **Lines 25-33**: Semua `og:image`, `og:url`, `twitter:image`, `canonical` → `bolakami.com`

#### 4. `src/pages/Berita.tsx`
- **Lines 171-177**: `og:image`, `og:url`, `canonical` → `bolakami.com`

#### 5. `src/pages/BeritaTag.tsx`
- **Lines 90-94**: `og:image`, `og:url`, `canonical` → `bolakami.com`

#### 6. `src/pages/Klasemen.tsx`
- **Lines 74-80**: `og:image`, `og:url`, `canonical` → `bolakami.com`

#### 7. `src/pages/Liga.tsx`
- **Lines 157-163**: `og:image`, `og:url`, `canonical` → `bolakami.com`

#### 8. `src/pages/cms/CMSOGPreview.tsx`
- **Line 28**: `siteUrl` → `https://bolakami.com`
- **Line 169**: display text → `bolakami.com`

#### 9. `index.html`
- `og:image` dan `twitter:image` → `https://bolakami.com/og-bolakami.png`

---

### Prasyarat
Domain `bolakami.com` harus sudah terhubung di Lovable (Settings → Domains) dan statusnya **Active** agar URL berfungsi dengan benar.

### Catatan
Semua perubahan adalah string replacement sederhana — tidak ada perubahan logika. Setelah implementasi, share via tombol WhatsApp/Facebook/Twitter akan menampilkan preview dengan domain `bolakami.com`.

