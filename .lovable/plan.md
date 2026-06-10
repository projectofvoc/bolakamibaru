# Plan: Share Link Event Pakai Slug

## Goal
Ubah link share event dari `/share/event/<uuid>` jadi `/share/event/<slug>` (contoh: `tebak-skor-match-mexico-vs-africa`), tetap kompatibel dengan link UUID lama.

## 1. Database (migration)

Tambah kolom `slug` di tabel `events`:
- `slug text` — unique, nullable awalnya
- Backfill semua row existing: lowercase, ganti non-alphanumeric jadi `-`, strip dash ganda/edge
- Anti-bentrok: bila slug duplikat, append `-<6 char id>` 
- Tambah unique index pada `slug`
- Trigger BEFORE INSERT/UPDATE: auto-generate slug dari `name` bila slug kosong atau name berubah

## 2. Frontend — `src/components/EventCard.tsx`

`shareUrl` jadi `${origin}/share/event/${event.slug ?? event.id}`. Tambah `slug` ke interface `EventItem`.

## 3. Query — `src/pages/Event.tsx`

Tambah `slug` di SELECT events. Tambah dukungan `?slug=` (selain `?id=`) untuk focus event.

## 4. Routing — `src/pages/ShareEventRedirect.tsx`

Param `:id` di-rename konseptual jadi `:idOrSlug`. Kirim ke edge function sebagai `?id=` (jika UUID valid) atau `?slug=` (jika bukan UUID). Deteksi UUID via regex.

## 5. Edge Function — `supabase/functions/event-og-metadata/index.ts`

Terima `?id=` (UUID lookup) **atau** `?slug=` (slug lookup). Build `eventUrl` redirect pakai `?slug=<slug>` bila tersedia, fallback `?id=`. Update `event` SELECT untuk include `slug`.

## 6. CMS Share (jika ada)

Cek `src/pages/cms/CMSEvents.tsx` — bila ada tombol copy share link, pakai slug juga.

## Technical Detail

**Slug generator (SQL):**
```sql
lower(regexp_replace(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))
```

**UUID detect (TS):**
```ts
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
```

**Backward compat:** Route `/share/event/:idOrSlug` resolve dua-duanya; canonical `/event?slug=...` jadi sumber utama, `/event?id=...` tetap jalan.

## Out of scope
- Tidak mengubah desain card / dialog.
- Tidak mengubah copy/translasi.
