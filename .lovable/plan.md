
# Plan: Implementasi Sidebar Banners (Banner Kiri & Kanan)

## Ringkasan

Membuat fitur sidebar banner yang muncul di sisi kiri dan kanan halaman (seperti pada gambar referensi). Banner ini akan terlihat di layar besar (desktop) dan tersembunyi di mobile. Banner dapat dikelola melalui CMS dengan aspect ratio 4:15 dan mendukung format JPG, PNG, GIF.

## Pendekatan Implementasi

### 1. Database: Tabel Baru `sidebar_banners`

```text
sidebar_banners
├── id (uuid, PK)
├── title (text) - Judul internal untuk identifikasi
├── position (text) - 'left' atau 'right'
├── image_url (text) - URL gambar (JPG/PNG/GIF)
├── link_url (text, nullable) - URL tujuan saat diklik
├── is_active (boolean) - Status aktif/nonaktif
├── sort_order (integer) - Urutan tampilan
├── created_at (timestamptz)
├── updated_at (timestamptz)
```

### 2. Layout Visual

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              DESKTOP VIEW                              │
├──────────┬──────────────────────────────────────────────┬──────────────┤
│          │                                              │              │
│  ┌────┐  │            MAIN CONTENT AREA                 │   ┌────┐     │
│  │    │  │                                              │   │    │     │
│  │ L  │  │   ┌────────────────────────────────────┐     │   │ R  │     │
│  │ E  │  │   │          Header                     │    │   │ I  │     │
│  │ F  │  │   ├────────────────────────────────────┤    │   │ G  │     │
│  │ T  │  │   │                                    │     │   │ H  │     │
│  │    │  │   │        Page Content                │     │   │ T  │     │
│  │ B  │  │   │                                    │     │   │    │     │
│  │ A  │  │   │                                    │     │   │ B  │     │
│  │ N  │  │   │                                    │     │   │ A  │     │
│  │ N  │  │   └────────────────────────────────────┘     │   │ N  │     │
│  │ E  │  │                                              │   │ N  │     │
│  │ R  │  │   ┌────────────────────────────────────┐     │   │ E  │     │
│  │    │  │   │          Footer                    │     │   │ R  │     │
│  └────┘  │   └────────────────────────────────────┘     │   └────┘     │
│          │                                              │              │
│ 4:15     │                                              │   4:15       │
│ ratio    │                                              │   ratio      │
└──────────┴──────────────────────────────────────────────┴──────────────┘

┌────────────────────────────────┐
│        MOBILE VIEW             │
│   (Sidebar banners hidden)     │
│                                │
│  ┌──────────────────────────┐  │
│  │    MAIN CONTENT AREA     │  │
│  │    (Full width)          │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

### 3. Komponen Baru: `SidebarBanners.tsx`

Komponen wrapper yang menampilkan banner di sisi kiri dan kanan:
- Menggunakan CSS `position: fixed` untuk sticky behavior
- Hanya tampil di layar >= 1440px (untuk tidak mengganggu konten)
- Animasi fade-in saat scroll

### 4. Halaman CMS: `CMSSidebarBanners.tsx`

Halaman terpisah untuk mengelola sidebar banners dengan fitur:
- Upload gambar dengan validasi aspect ratio 4:15
- Pilih posisi: Left / Right
- Toggle aktif/nonaktif
- Preview layout

### 5. Spesifikasi Teknis Banner

```text
┌─────────────────────────────────────────────────────────────┐
│                 SIDEBAR BANNER SPECIFICATION                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Aspect Ratio: 4:15 (vertical/portrait)                     │
│                                                             │
│  Ukuran Rekomendasi:                                        │
│  ├── Standard: 160 × 600 px (Wide Skyscraper)               │
│  ├── Alternative: 120 × 600 px (Skyscraper)                 │
│  └── Large: 300 × 1050 px (untuk layar besar)               │
│                                                             │
│  Format: JPG, PNG, GIF (animasi didukung)                   │
│  Max File Size: 2MB (JPG/PNG) | 5MB (GIF)                   │
│                                                             │
│  Visibility: Hanya tampil di layar >= 1440px                │
│  Position: Fixed (sticky saat scroll)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## File yang Akan Dibuat/Diubah

| File | Aksi | Deskripsi |
|------|------|-----------|
| `supabase/migrations/` | Create | Tabel `sidebar_banners` |
| `src/components/SidebarBanners.tsx` | Create | Komponen display sidebar banner |
| `src/pages/cms/CMSSidebarBanners.tsx` | Create | Halaman CMS kelola sidebar banners |
| `src/pages/cms/index.ts` | Update | Export komponen baru |
| `src/pages/cms/CMSLayout.tsx` | Update | Tambah menu sidebar banners |
| `src/App.tsx` | Update | Tambah route `/cms/sidebar-banners` |
| `src/pages/Index.tsx` | Update | Tambah komponen `SidebarBanners` |
| `src/pages/Berita.tsx` | Update | Tambah komponen `SidebarBanners` |
| `src/pages/BeritaTag.tsx` | Update | Tambah komponen `SidebarBanners` |
| `src/pages/Liga.tsx` | Update | Tambah komponen `SidebarBanners` |
| `src/pages/Klasemen.tsx` | Update | Tambah komponen `SidebarBanners` |
| `src/pages/Live.tsx` | Update | Tambah komponen `SidebarBanners` |
| `src/pages/NewsDetail.tsx` | Update | Tambah komponen `SidebarBanners` |

## Hasil yang Diharapkan

Setelah implementasi:
- Banner vertikal muncul di sisi kiri dan kanan layar (desktop >= 1440px)
- Banner bersifat sticky (tetap terlihat saat scroll)
- Tidak muncul di mobile/tablet untuk menjaga UX
- Dapat dikelola melalui CMS di `/cms/sidebar-banners`
- Support format JPG, PNG, dan GIF (termasuk animasi)
- Aspect ratio 4:15 sesuai permintaan

