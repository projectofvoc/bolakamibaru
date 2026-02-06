
# Plan: Perbesar Ukuran Sidebar Banner

## Ringkasan
Memperbesar ukuran sidebar banner kiri dan kanan yang saat ini menggunakan lebar 120px menjadi ukuran yang lebih besar (160px) agar lebih terlihat dan proporsional dengan konten halaman.

---

## Analisis Kondisi Saat Ini

### File: `src/components/SidebarBanners.tsx`

**Ukuran saat ini:**
- Width: `w-[120px]`
- Aspect ratio: `aspect-[4/15]` (menghasilkan tinggi sekitar 450px)
- Banner height dalam scroll calculation: 450px (baris 44)

**Positioning saat ini:**
- Left: `calc(50% - 720px - 130px)`
- Right: `calc(50% - 720px - 130px)`

---

## Perubahan yang Akan Dilakukan

### 1. Perbesar Width Banner (baris 104 dan 130)

**Sebelum:**
```tsx
<div className="w-[120px] aspect-[4/15] rounded-lg overflow-hidden shadow-lg bg-muted">
```

**Sesudah:**
```tsx
<div className="w-[160px] aspect-[4/15] rounded-lg overflow-hidden shadow-lg bg-muted">
```

### 2. Update Scroll Calculation (baris 44)

**Sebelum:**
```tsx
const bannerBottom = scrollY + 96 + 450;
```

**Sesudah:**
```tsx
const bannerBottom = scrollY + 96 + 600; // 160px * 15/4 = 600px height
```

### 3. Sesuaikan Positioning untuk Accommodating Ukuran Baru (baris 79-85)

**Sebelum:**
```tsx
// Article variant
? { left: 'calc(50% - 448px - 140px)' }
: { right: 'calc(50% - 448px - 140px)' };

// Default variant
? { left: 'calc(50% - 720px - 130px)' }
: { right: 'calc(50% - 720px - 130px)' };
```

**Sesudah:**
```tsx
// Article variant
? { left: 'calc(50% - 448px - 180px)' }
: { right: 'calc(50% - 448px - 180px)' };

// Default variant
? { left: 'calc(50% - 720px - 180px)' }
: { right: 'calc(50% - 720px - 180px)' };
```

---

## Perbandingan Visual

```text
SEBELUM:                          SESUDAH:
┌────────┐                       ┌──────────┐
│        │                       │          │
│  120px │  → Height ~450px      │  160px   │  → Height ~600px
│        │                       │          │
│        │                       │          │
│        │                       │          │
│        │                       │          │
│        │                       │          │
│        │                       │          │
│        │                       │          │
│        │                       │          │
└────────┘                       └──────────┘
```

---

## Ringkasan Perubahan
1. **Width:** 120px → 160px (33% lebih besar)
2. **Height:** ~450px → ~600px (proporsional dengan aspect ratio 4:15)
3. **Positioning:** Disesuaikan untuk memastikan tidak overlap dengan konten

---

## Estimasi Waktu
- Implementasi: 2-3 menit
- Testing: 1 menit
