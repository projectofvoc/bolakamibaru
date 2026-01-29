

# Perbaikan Line Height & Spacing Artikel - Audit CMS

## Masalah yang Ditemukan

Dari screenshot dan analisis kode di `src/index.css`, ditemukan **3 masalah utama** pada styling `.article-content`:

| Lokasi | Property | Nilai Saat Ini | Masalah |
|--------|----------|----------------|---------|
| Baris 177 | `ul space-y` | `space-y-2` (8px) | Terlalu besar untuk list pendek |
| Baris 185 | `li leading` | `leading-relaxed` (1.625) | Line-height terlalu tinggi |
| Baris 173 | `p leading` | `leading-relaxed` (1.625) | Paragraf terlihat renggang |

### Dampak Visual

- List "Jadwal Live Streaming" memiliki gap **~50px** antar item
- Paragraf artikel terlihat terlalu "sparse" dan tidak compact
- Reading experience kurang optimal terutama untuk informasi ringkas

---

## Solusi yang Direkomendasikan

### Perubahan di `src/index.css`

#### 1. Ubah spacing list (`ul`)
**Baris 176-178**

| Sebelum | Sesudah |
|---------|---------|
| `@apply list-disc pl-6 mb-5 space-y-2;` | `@apply list-disc pl-6 mb-5 space-y-1;` |

**Alasan**: `space-y-1` (4px) lebih proporsional untuk list item yang pendek seperti jadwal

#### 2. Ubah line-height list item (`li`)
**Baris 184-186**

| Sebelum | Sesudah |
|---------|---------|
| `@apply text-lg leading-relaxed text-foreground/90;` | `@apply text-lg leading-normal text-foreground/90;` |

**Alasan**: `leading-normal` (1.5) lebih compact namun tetap readable

#### 3. Ubah line-height paragraf (`p`)
**Baris 172-174**

| Sebelum | Sesudah |
|---------|---------|
| `@apply text-lg leading-relaxed mb-5 text-foreground/90;` | `@apply text-lg leading-[1.75] mb-5 text-foreground/90;` |

**Alasan**: `leading-[1.75]` memberikan keseimbangan antara readability dan density untuk teks panjang

#### 4. Ubah margin bottom heading (`h2`)
**Baris 164-166**

| Sebelum | Sesudah |
|---------|---------|
| `@apply text-2xl md:text-3xl font-bold mb-4 mt-8 text-foreground leading-tight;` | `@apply text-2xl md:text-3xl font-bold mb-3 mt-8 text-foreground leading-tight;` |

**Alasan**: Mengurangi jarak antara heading dan konten di bawahnya

---

## Perbandingan Visual (Estimasi)

### Sebelum
```
📺 Jadwal Live Streaming
                                    ← 50px gap
• Kompetisi: UEFA Europa League
                                    ← 50px gap
• Pertandingan: Panathinaikos vs Roma
                                    ← 50px gap
• Tempat: Olympiako Stadio...
```

### Sesudah
```
📺 Jadwal Live Streaming
                              ← 20px gap
• Kompetisi: UEFA Europa League
                              ← 20px gap
• Pertandingan: Panathinaikos vs Roma
                              ← 20px gap
• Tempat: Olympiako Stadio...
```

---

## Ringkasan Perubahan File

**File:** `src/index.css`

| Baris | Class | Perubahan |
|-------|-------|-----------|
| 173 | `.article-content p` | `leading-relaxed` → `leading-[1.75]` |
| 165 | `.article-content h2` | `mb-4` → `mb-3` |
| 177 | `.article-content ul` | `space-y-2` → `space-y-1` |
| 185 | `.article-content li` | `leading-relaxed` → `leading-normal` |

---

## Dampak

- Spacing antar bullet point berkurang ~50% (dari ~50px ke ~25px)
- Section "Jadwal Live Streaming" tampil lebih compact dan profesional
- Paragraf artikel tetap readable namun lebih dense
- Konsisten dengan standar editorial modern (National Geographic, The Athletic, dll)

