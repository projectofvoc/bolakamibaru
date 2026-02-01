
# Plan: Implementasi Banner Section di Atas Footer

## Ringkasan

Membuat section banner yang dapat dikelola melalui CMS, ditempatkan di atas footer pada semua halaman. Banner mendukung format JPG, PNG, dan GIF dengan layout responsive (2 kolom di desktop, 1 kolom stacked di mobile).

## Pendekatan Implementasi

### 1. Database: Tabel Baru `footer_banners`

Membuat tabel terpisah dari `advertisements` (yang digunakan untuk popup) agar pengelolaan lebih terorganisir:

```text
footer_banners
├── id (uuid, PK)
├── title (text) - Judul internal untuk identifikasi
├── position (text) - 'left' atau 'right' untuk desktop
├── image_url (text) - URL gambar (JPG/PNG/GIF)
├── link_url (text, nullable) - URL tujuan saat diklik
├── is_active (boolean) - Status aktif/nonaktif
├── sort_order (integer) - Urutan tampilan
├── created_at (timestamptz)
├── updated_at (timestamptz)
```

### 2. Komponen Baru: `FooterBanners.tsx`

```text
src/components/FooterBanners.tsx
├── Fetch banner dari database (left & right)
├── Layout: grid grid-cols-1 lg:grid-cols-2 gap-4
├── Support GIF animation (menggunakan <img> tag langsung)
├── Clickable dengan link_url (optional)
├── Skeleton loading state
```

Layout Visual:
```text
┌──────────────────────────────────────────────────────────┐
│                    DESKTOP (lg+)                         │
│  ┌─────────────────────┐  ┌─────────────────────────────┐│
│  │    Banner Left      │  │       Banner Right          ││
│  │   (aspect 3:1)      │  │       (aspect 3:1)          ││
│  └─────────────────────┘  └─────────────────────────────┘│
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────┐
│     MOBILE (< lg)           │
│  ┌───────────────────────┐  │
│  │     Banner Top        │  │
│  │    (aspect 3:1)       │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │     Banner Bottom     │  │
│  │    (aspect 3:1)       │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### 3. Halaman CMS Baru: `CMSFooterBanners.tsx`

Fitur pengelolaan:
- List semua banner dengan preview
- Form upload (drag & drop atau file picker)
- Pilih posisi: Left / Right
- Toggle aktif/nonaktif
- Edit & hapus banner

### 4. Integrasi ke Semua Halaman

Menempatkan komponen `FooterBanners` di setiap halaman sebelum `Footer`:

```text
<main>
  ... content ...
</main>
<FooterBanners />  ← NEW
<Footer />
```

Halaman yang akan diupdate:
- `src/pages/Index.tsx`
- `src/pages/Berita.tsx`
- `src/pages/BeritaTag.tsx`
- `src/pages/Liga.tsx`
- `src/pages/Klasemen.tsx`
- `src/pages/Live.tsx`
- `src/pages/NewsDetail.tsx`

### 5. Routing CMS

Menambahkan route baru:
```text
/cms/footer-banners → CMSFooterBanners
```

## Spesifikasi Teknis

### Ratio & Ukuran Banner (Panduan untuk Desainer)

```text
┌─────────────────────────────────────────────────────────────┐
│                 BANNER SPECIFICATION                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Aspect Ratio: 3:1 (contoh: 1200×400 px)                    │
│                                                             │
│  Ukuran Rekomendasi:                                        │
│  ├── Desktop: 1200 × 400 px (untuk banner penuh)            │
│  ├── Single: 600 × 200 px (untuk satu sisi)                 │
│  └── Mobile: 800 × 267 px (untuk tampilan mobile)           │
│                                                             │
│  Format: JPG, PNG, GIF (animated supported)                 │
│  Max File Size: 2MB (untuk GIF: 5MB)                        │
│                                                             │
│  Safe Zone: Konten penting dalam 90% area tengah            │
│  karena edge mungkin terpotong di beberapa ukuran layar     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Storage Bucket

Menggunakan bucket `advertisements` yang sudah ada (public) dengan path:
```text
advertisements/footer-banners/{timestamp}.{ext}
```

### RLS Policy

Banner bersifat publik (read-only untuk semua, write hanya admin).

## File yang Akan Dibuat/Diubah

| File | Aksi | Deskripsi |
|------|------|-----------|
| `supabase/migrations/` | Create | Tabel `footer_banners` |
| `src/components/FooterBanners.tsx` | Create | Komponen display banner |
| `src/pages/cms/CMSFooterBanners.tsx` | Create | Halaman kelola banner |
| `src/pages/cms/index.ts` | Update | Export komponen baru |
| `src/App.tsx` | Update | Tambah route CMS |
| `src/pages/Index.tsx` | Update | Tambah `FooterBanners` |
| `src/pages/Berita.tsx` | Update | Tambah `FooterBanners` |
| `src/pages/BeritaTag.tsx` | Update | Tambah `FooterBanners` |
| `src/pages/Liga.tsx` | Update | Tambah `FooterBanners` |
| `src/pages/Klasemen.tsx` | Update | Tambah `FooterBanners` |
| `src/pages/Live.tsx` | Update | Tambah `FooterBanners` |
| `src/pages/NewsDetail.tsx` | Update | Tambah `FooterBanners` |

## Hasil yang Diharapkan

Setelah implementasi:
- Section banner muncul di atas footer pada semua halaman
- Layout 2 kolom (kiri-kanan) di desktop, stacked di mobile
- Banner dapat dikelola melalui CMS di `/cms/footer-banners`
- Support format JPG, PNG, dan GIF (termasuk animasi)
- Desainer memiliki panduan ratio yang jelas (3:1)
