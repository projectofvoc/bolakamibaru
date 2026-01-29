
# Perbaikan Layout Tabel Klasemen

## Masalah Utama
Komponen `LazyImage` memiliki wrapper div dengan `w-full h-full` yang menyebabkan area logo melebar melebihi ukuran seharusnya (28x28px), menciptakan gap besar antara logo dan nama tim.

## Solusi

### 1. Perbaiki LazyImage di Klasemen.tsx
Tambahkan prop `wrapperClassName` untuk mengontrol ukuran wrapper:

**File:** `src/pages/Klasemen.tsx`

**Perubahan pada team logo (sekitar baris 170-176):**
- Tambahkan `wrapperClassName="w-6 h-6 shrink-0"` pada LazyImage
- Ubah `className` menjadi `w-full h-full object-contain`
- Kurangi `gap-3` menjadi `gap-2` untuk spacing lebih rapat

**Kode sebelum:**
```tsx
<div className="flex items-center gap-3">
  {team.teamLogo ? (
    <LazyImage 
      src={team.teamLogo} 
      alt={team.teamName}
      className="w-7 h-7 object-contain"
      fallback="/placeholder.svg"
    />
```

**Kode sesudah:**
```tsx
<div className="flex items-center gap-2">
  {team.teamLogo ? (
    <LazyImage 
      src={team.teamLogo} 
      alt={team.teamName}
      wrapperClassName="w-6 h-6 shrink-0"
      className="w-full h-full object-contain"
      fallback="/placeholder.svg"
    />
```

### 2. Perbaiki fallback icon (trophy placeholder)
Samakan ukuran fallback dengan logo:
- Ubah `w-7 h-7` menjadi `w-6 h-6 shrink-0`

### 3. Perbaiki team name container
Hapus `truncate` dan `max-w` agar nama tidak terpotong:

**Sebelum:**
```tsx
<span className="font-medium text-sm truncate max-w-[140px] sm:max-w-none">
```

**Sesudah:**
```tsx
<span className="font-medium text-sm whitespace-nowrap">
```

### 4. Kompres kolom statistik
Untuk tampilan lebih compact:
- Ubah header kolom TIM dari `min-w-[180px]` menjadi tanpa min-width
- Kurangi padding kolom angka dari default ke `px-2`

---

## Ringkasan Perubahan
| Lokasi | Sebelum | Sesudah |
|--------|---------|---------|
| LazyImage wrapper | tidak ada | `wrapperClassName="w-6 h-6 shrink-0"` |
| Flex gap | `gap-3` | `gap-2` |
| Team name | `truncate max-w-[140px]` | `whitespace-nowrap` |
| Fallback icon | `w-7 h-7` | `w-6 h-6 shrink-0` |

## Dampak
- Logo dan nama tim akan rapat tanpa gap berlebih
- Nama tim tidak terpotong
- Layout konsisten untuk semua liga di dropdown
- Responsive di mobile dan desktop
