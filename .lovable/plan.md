# Event Pertama Bolakami: "Tebak & Share Pildun" + Fitur Deskripsi

## 1. Database
Migration untuk menambah kolom pada `public.events`:
- `description` (TEXT, nullable) — diisi via CMS, mendukung multi-baris/markdown ringan, ditampilkan dalam dropdown di card event.

## 2. CMS (`src/pages/cms/CMSEvents.tsx`)
- Tambah field **Deskripsi Event** (Textarea, opsional, rich-text plain dengan support newline). Diletakkan di bawah field "Nama Event".
- Placeholder: "Syarat & ketentuan, cara ikut, hadiah, dsb. Mendukung baris baru."
- Simpan ke kolom `description`.

## 3. Tampilan User (`src/components/EventCard.tsx`)
- Tambah **dropdown/accordion "Lihat Detail & Syarat"** di bawah area tombol (pakai `shadcn/ui` Collapsible atau Accordion).
- Saat di-expand, tampilkan `description` dengan `whitespace-pre-line` agar baris baru terjaga. Heading kecil + chevron icon untuk toggle.
- Jika `description` kosong/null, dropdown tidak ditampilkan.
- Tambah translation key `event.viewDetails` / `event.hideDetails` di `LanguageContext.tsx`.

## 4. Banner Event Pertama
Generate banner 1792×1008 (16:9) via `imagegen` (model premium karena ada teks):
- Tema: Piala Dunia 2026, dark theme bolakami (primary `#4ade80`, bg `#0d0f14`).
- Visual: trophy Piala Dunia + bola, badge "TANPA MODAL", tagline besar **"TEBAK & SHARE PILDUN"**, sub **"Total Hadiah Rp 50.000.000 · 100 Pemenang"**.
- Logo/teks "BOLAKAMI" kecil di pojok.
- Disimpan ke `src/assets/events/event-pildun-2026.jpg`, lalu di-upload ke bucket `articles-media` (folder `events/`) via script seed, dan URL publik disimpan ke `banner_url`.

## 5. Seed Event Pertama (via `supabase--insert`)
Setelah migration disetujui & banner ter-upload:
- `name`: "Tebak & Share Pildun Bolakami — Tebak Juara Piala Dunia 2026"
- `description`: Full S&K dari PDF (Cara Ikut, Caption Siap Pakai, Hadiah, Penentuan Pemenang, Larangan, Ketentuan Lain, Disclaimer) — diformat dengan section headers & bullet menggunakan newline + emoji ringan.
- `start_date`: `2026-06-11 00:00 WIB`
- `end_date`: `2026-07-19 02:00 WIB`
- `join_url`: `https://www.facebook.com/groups/bolakamiofficial` (sementara, bisa diganti admin)
- `telegram_url`: null
- `telegram_enabled`: false (sesuai SK — channel utama Facebook)
- `is_active`: true
- `sort_order`: 0

## Teknis singkat
- File diubah: `CMSEvents.tsx`, `EventCard.tsx`, `LanguageContext.tsx`.
- File dibuat: banner image asset.
- 1 migration: `ALTER TABLE public.events ADD COLUMN description TEXT;`
- 1 insert data event pertama.
