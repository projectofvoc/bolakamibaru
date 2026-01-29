
# Perbaikan Layout Tabel Klasemen

## Masalah
Gap besar antara logo dan nama tim disebabkan oleh:
1. **LazyImage wrapper menggunakan `w-full h-full`** - membuat wrapper melebar ke seluruh cell, bukan mengikuti ukuran logo (w-7 h-7)
2. **Prop `wrapperClassName` tidak digunakan** - sehingga ukuran wrapper tidak terkontrol
3. **Team name menggunakan `truncate`** - menyebabkan nama terpotong dan layout tidak proporsional

## Solusi

### Perubahan di `src/pages/Klasemen.tsx`

#### 1. Perbaiki LazyImage dengan `wrapperClassName`
Tambahkan prop `wrapperClassName` untuk mengunci ukuran wrapper logo:

**Lokasi:** Baris 200-205

| Sebelum | Sesudah |
|---------|---------|
| `className="w-7 h-7 object-contain"` | `wrapperClassName="w-6 h-6 shrink-0"` + `className="w-full h-full object-contain"` |

#### 2. Kurangi gap container
**Lokasi:** Baris 198

| Sebelum | Sesudah |
|---------|---------|
| `gap-3` | `gap-2` |

#### 3. Perbaiki team name agar tidak terpotong
**Lokasi:** Baris 211

| Sebelum | Sesudah |
|---------|---------|
| `truncate max-w-[140px] sm:max-w-none` | `whitespace-nowrap` |

#### 4. Samakan ukuran fallback icon
**Lokasi:** Baris 207

| Sebelum | Sesudah |
|---------|---------|
| `w-7 h-7` | `w-6 h-6 shrink-0` |

#### 5. Hapus min-width kolom TIM
**Lokasi:** Baris 156

| Sebelum | Sesudah |
|---------|---------|
| `min-w-[180px]` | (dihapus) |

---

## Kode Setelah Perbaikan

```tsx
{/* Table Cell untuk kolom TIM */}
<TableCell>
  <div className="flex items-center gap-2">
    {team.teamLogo ? (
      <LazyImage 
        src={team.teamLogo} 
        alt={team.teamName}
        wrapperClassName="w-6 h-6 shrink-0"
        className="w-full h-full object-contain"
        fallback="/placeholder.svg"
      />
    ) : (
      <div className="w-6 h-6 shrink-0 bg-muted rounded-full flex items-center justify-center">
        <Trophy className="w-3 h-3 text-muted-foreground" />
      </div>
    )}
    <span className="font-medium text-sm whitespace-nowrap">
      {team.teamName}
    </span>
  </div>
</TableCell>
```

---

## Dampak
- Logo akan memiliki ukuran fixed 24x24px (w-6 h-6) dan tidak akan melebar
- Gap antara logo dan nama tim menjadi 8px (gap-2) 
- Nama tim tampil lengkap tanpa terpotong
- Layout konsisten untuk semua liga di dropdown (Liga 1, Liga 2, Premier League, La Liga, dll)

---

## Detail Teknis

### Kenapa `wrapperClassName` penting?
Komponen LazyImage membungkus img dalam div dengan default `w-full h-full`. Tanpa override melalui `wrapperClassName`, wrapper akan mengisi seluruh parent cell (~600px), meskipun img hanya 28x28px.

### Kenapa `shrink-0`?
Mencegah logo menyusut saat flexbox container kekurangan ruang, memastikan ukuran logo selalu konsisten 24x24px.
