## Tujuan
1. Matikan tombol **Ikut Event** pada event "Tebak & Share Pildun" (data seed pertama).
2. Perbaiki layout popup event: banner dan deskripsi sekarang terlihat tumpang tindih (lihat screenshot — judul & list S&K terbaca di atas gambar piala). Pisahkan menjadi dua section yang jelas.

## Perubahan

### 1. Database (data update, bukan schema)
- `UPDATE public.events SET join_enabled = false WHERE name ILIKE 'Tebak & Share Pildun%';`
- Tidak ada perubahan kolom/RLS.

### 2. `src/components/EventCard.tsx` — restruktur `DialogContent`

Masalah saat ini: `DialogContent` punya `p-0` + `overflow-y-auto`, banner pakai `aspect-[16/9] w-full` (sangat tinggi di dialog `max-w-3xl`), lalu header + deskripsi diletakkan di bawahnya dalam container yang sama yang ikut scroll → di viewport pendek banner & teks terlihat menempel/menutupi.

Struktur baru (flex column, banner fixed di atas, deskripsi scrollable di bawah):

```text
┌─ DialogContent (flex flex-col, max-h-[92vh], p-0) ─┐
│  [Banner section]                                  │
│    - aspect-[16/9], max-h-[45vh], object-contain   │
│    - bg-black, border-b border-border              │
│    - shrink-0 (tidak ikut scroll)                  │
├────────────────────────────────────────────────────┤
│  [Header section] (p-6 pb-3, shrink-0)             │
│    - Title + tanggal periode                       │
├────────────────────────────────────────────────────┤
│  [Description section] (flex-1 overflow-y-auto)    │
│    - px-6 py-4, whitespace-pre-line                │
│    - Scroll independen dari banner                 │
├────────────────────────────────────────────────────┤
│  [Action buttons] (p-4 border-t, shrink-0)         │
│    - Join (jika enabled) / Telegram / Copy Link    │
└────────────────────────────────────────────────────┘
```

Detail:
- Banner pakai `object-contain` + `bg-black` agar full image terlihat tanpa cropping aneh, tinggi dibatasi `max-h-[45vh]` supaya tidak mendominasi.
- Header & action bar `shrink-0`, hanya bagian deskripsi yang scroll.
- Hapus `border-t` di deskripsi (sudah ada pemisah natural via section).
- Tidak ada perubahan card view, hanya popup.

### 3. Tidak ada perubahan lain
- CMS, translation keys, dan tabel events tidak diubah.

## File yang disentuh
- `src/components/EventCard.tsx` (edit struktur DialogContent)
- 1 migration data-only untuk update `join_enabled` event Pildun
