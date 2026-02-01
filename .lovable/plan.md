

# Plan: Tambah Menu Footer Banners ke Sidebar CMS

## Masalah

Menu "Footer Banners" (`/cms/footer-banners`) tidak muncul di sidebar CMS karena belum ditambahkan ke dalam array `adminItems` pada file `CMSLayout.tsx`.

## Solusi

Menambahkan item baru ke dalam array `adminItems` pada baris 56-64.

## Perubahan yang Diperlukan

| File | Perubahan |
|------|-----------|
| `src/pages/cms/CMSLayout.tsx` | Tambah import icon `Image` dan tambah item Footer Banners |

## Detail Implementasi

### 1. Import Icon

Menambahkan icon `Image` dari lucide-react (cocok untuk banner/gambar).

### 2. Tambah Item ke adminItems

```text
SEBELUM:
const adminItems = [
  { title: 'Liga', url: '/cms/leagues', icon: Trophy },
  { title: 'Advertise', url: '/cms/advertise', icon: Megaphone },
  { title: 'Navigation', url: '/cms/navigation', icon: Link2 },
  ...
];

SESUDAH:
const adminItems = [
  { title: 'Liga', url: '/cms/leagues', icon: Trophy },
  { title: 'Advertise', url: '/cms/advertise', icon: Megaphone },
  { title: 'Footer Banners', url: '/cms/footer-banners', icon: Image },  ← BARU
  { title: 'Navigation', url: '/cms/navigation', icon: Link2 },
  ...
];
```

## Posisi Menu

Footer Banners akan ditempatkan setelah "Advertise" karena keduanya terkait dengan konten iklan/promosi, sehingga pengelompokan lebih logis:

```text
ADMIN
├── Liga
├── Advertise (popup ads)
├── Footer Banners (banner di atas footer)  ← NEW
├── Navigation
├── Social Media
├── OG Preview
├── API
└── Users
```

## Hasil yang Diharapkan

Setelah implementasi, menu "Footer Banners" akan muncul di sidebar CMS pada bagian ADMIN dan dapat diakses oleh user dengan role admin.

