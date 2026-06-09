
# Plan: Fitur Event

## Tujuan
Menambahkan menu baru "Event" berisi card event yang bisa dikelola sepenuhnya dari CMS oleh admin & author. Setiap card menampilkan banner, nama, tanggal mulai/berakhir, tombol Join (link), dan tombol Gabung Grup Telegram (opsional, bisa di-disable per event sehingga tombolnya hilang dari card).

## 1. Database (Lovable Cloud)
Tabel baru `public.events`:
- `name` (text)
- `banner_url` (text, nullable) — gambar cover
- `start_date`, `end_date` (timestamptz)
- `join_url` (text) — link tombol Join
- `telegram_url` (text, nullable)
- `telegram_enabled` (boolean, default false) — kalau false, tombol Telegram tidak ditampilkan
- `is_active` (boolean, default true) — toggle manual tampil/sembunyi (termasuk untuk event yang sudah lewat)
- `sort_order` (int, default 0)
- standar: id, created_at, updated_at, created_by

GRANTs:
- `SELECT` untuk `anon` & `authenticated` (publik baca)
- `ALL` untuk `service_role`
- `INSERT/UPDATE/DELETE` untuk `authenticated`

RLS:
- Public read: hanya baris `is_active = true`
- Manage (insert/update/delete): user dengan role `admin` ATAU `author` via `has_role()`

Storage: gunakan bucket `articles-media` yang sudah ada (folder `events/`) untuk upload banner — tidak perlu bucket baru.

## 2. Sisi User

### a. Section di Homepage (`src/components/EventsSection.tsx`)
- Dirender di `src/pages/Index.tsx` (urutan: setelah `UpcomingMatches`, sebelum `AICompanion` — final akan dikonfirmasi visual)
- Menampilkan maksimal 3 event aktif terdekat, dengan link "Lihat Semua" ke `/event`
- Mengikuti tema dark minimal (bg `#1a1d24`, primary `#4ade80`)

### b. Halaman `/event` (`src/pages/Event.tsx`)
- Header + Footer standar, Helmet SEO (title, description, canonical `bolakami.com/event`)
- Grid responsif card event aktif, sort by `sort_order` lalu `start_date`
- Format tanggal WIB (UTC+7), bilingual via `LanguageContext`

### c. Card Event (`src/components/EventCard.tsx`)
- Banner di atas (fallback placeholder kalau kosong)
- Nama event, rentang tanggal "12 Jun – 20 Jun 2026 WIB"
- Tombol "Join" (primary) → buka `join_url` di tab baru
- Tombol "Gabung Grup Telegram" (secondary) — hanya dirender bila `telegram_enabled === true` && `telegram_url` terisi

### d. Navigasi
- Tambah item "Event" di Header (`src/components/Header.tsx`) menuju `/event`, label ID/EN
- Tambah route `/event` di `src/App.tsx`

## 3. CMS

### a. Halaman `src/pages/cms/CMSEvents.tsx`
- List event (tabel: banner thumb, nama, tanggal, status aktif, telegram on/off, aksi edit/hapus)
- Form Tambah/Edit (dialog atau halaman terpisah) dengan field: name, banner upload, start_date, end_date (datepicker), join_url, telegram_url, switch `telegram_enabled`, switch `is_active`, `sort_order`
- Validasi: end_date ≥ start_date, join_url wajib, kalau `telegram_enabled` true maka `telegram_url` wajib

### b. Wiring
- Daftarkan di `src/pages/cms/index.ts`
- Tambah route `/cms/events` di `src/App.tsx`
- Tambah menu "Events" di `CMSLayout.tsx` — masuk **menuItems** (KONTEN), bukan adminItems, sehingga admin & author dapat akses (RLS tetap menjaga). Icon: `CalendarDays`.

## 4. Catatan teknis
- Tidak perlu logika hide otomatis berdasarkan tanggal — kontrol via switch `is_active` di CMS.
- Gunakan React Query (`queryClient`) dengan key `['events']` dan invalidate setelah mutasi.
- Tipe Supabase akan ter-regenerate otomatis setelah migration disetujui.
- Tidak ada perubahan ke edge functions, AI Companion, atau sistem Read-to-Earn.

## File yang akan dibuat/diubah
Baru:
- `src/pages/Event.tsx`
- `src/pages/cms/CMSEvents.tsx`
- `src/components/EventsSection.tsx`
- `src/components/EventCard.tsx`

Diubah:
- `src/App.tsx` (route `/event`, `/cms/events`)
- `src/pages/Index.tsx` (render `EventsSection`)
- `src/components/Header.tsx` (nav item "Event")
- `src/pages/cms/CMSLayout.tsx` (menu Events)
- `src/pages/cms/index.ts` (export)
- `src/contexts/LanguageContext.tsx` (string ID/EN: Event, Join, Gabung Grup Telegram, dll.)

Migration: tabel `events` + GRANT + RLS sesuai di atas.
