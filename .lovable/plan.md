## 1. Badge per event (CMS-managed)

**Schema (`events` table)** — tambah 4 kolom:
- `badge_enabled` boolean default false
- `badge_label` text (max 24 char, contoh: "HOT", "Hadiah 2 Juta")
- `badge_color` text enum: `primary | red | yellow | blue | purple | green`
- `badge_icon` text — nama icon Lucide: `none | flame | star | trophy | gift | sparkles | crown | zap`

**CMS (`CMSEvents.tsx`)** — di form Tambah/Edit Event tambah section "Badge":
- Switch aktif/non-aktif
- Input teks (placeholder: "Hadiah 2 Juta")
- Pilih warna (6 swatch preset)
- Pilih icon (8 opsi termasuk None) dengan preview

**Tampilan di card (`EventCard.tsx`)**: badge muncul di pojok kanan-atas banner (absolute), pill rounded dengan icon kecil + label. Warna pakai semantic tokens (bg-primary/bg-destructive/dll, bukan hardcode).

## 2. Event Landing Page `/event/:slug`

**Route baru** di `App.tsx`:
```
/event              → list semua event (EventPage existing)
/event/:slug        → EventDetail page (baru)
/share/event/:slug  → redirect ke /event/:slug
```

**`src/pages/EventDetail.tsx` (baru)** — landing independen, mobile-first:
- Header + Footer site
- Hero: banner full-width (16:9, max-h-[60vh], `loading="eager"` karena LCP)
- Badge (jika aktif) di hero
- Judul event + periode (tanggal mulai–akhir WIB)
- Deskripsi lengkap (whitespace-pre-line)
- Sticky action bar di bawah (mobile) / inline (desktop): Ikut Event, Gabung Telegram, Salin Link, Download PDF
- Tombol "← Kembali ke daftar event"
- Helmet: title, description, canonical `/event/<slug>`, og:title/desc/image dari event
- Loading skeleton + Not Found state

**`EventCard.tsx`** — perubahan:
- Klik card → `navigate('/event/<slug>')` (bukan buka dialog)
- **Hapus** Dialog popup detail sepenuhnya + import Dialog
- Tombol "Salin Link" tetap copy `https://<host>/event/<slug>` (clean, langsung ke landing page)
- Hapus tombol "Salin Link" dan "Download PDF" di card list (pindah ke landing page) — card hanya: Ikut Event, Telegram. Lebih ringkas + clear bahwa detail dibuka via klik card.

**`ShareEventRedirect.tsx`** — update target dari `/event?slug=` ke `/event/<slug>` (tetap dukung UUID lama → `/event?id=<uuid>` sebagai fallback).

**`EventPage.tsx`** — sederhanakan: hapus logika `focusEvent`/scroll/canonical query param. Halaman hanya tampilkan list. Slug param di-handle oleh route baru.

## 3. Mobile responsive + lazy load

- Semua `<img>` event (card list, CMS list, dialog yang dihapus tidak relevan) → `loading="lazy"` + `decoding="async"`. Banner hero detail page tetap eager (LCP).
- Tambah `width`/`height` attribute aspect hint untuk cegah CLS.
- Landing page: padding responsive (`px-4 md:px-8`), aksi bar sticky di bottom pada `<md`, inline pada `>=md`.
- Card grid sudah responsive (1/2/3 col) — tidak diubah.

## File changes

```text
NEW    supabase/migrations/<ts>_add_event_badge.sql  (badge columns)
NEW    src/pages/EventDetail.tsx
EDIT   src/App.tsx                       (route /event/:slug)
EDIT   src/pages/Event.tsx               (hapus focus logic)
EDIT   src/components/EventCard.tsx      (badge, navigate, hapus dialog, hapus salin/PDF dari card)
EDIT   src/pages/ShareEventRedirect.tsx  (target → /event/<slug>)
EDIT   src/pages/cms/CMSEvents.tsx       (form badge fields + state)
EDIT   src/integrations/supabase/types.ts (auto-regen setelah migrasi)
```

## Catatan teknis

- Migrasi DB hanya tambah kolom + default; tidak ubah RLS.
- `badge_icon` di-render via Lucide `icons` map dinamis (sudah didukung).
- Domain copy link pakai `window.location.origin` (sama seperti sekarang) sehingga di prod = `bolakami.com/event/<slug>`.
- Edge function `event-og-metadata` tidak diubah (masih dipakai bot/crawler kalau dipanggil langsung).