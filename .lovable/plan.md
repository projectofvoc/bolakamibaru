## Tujuan
Ganti pilihan icon badge event dari generic (Flame/Star/Trophy/dll) menjadi icon platform media sosial + web, supaya user langsung paham event ini berjalan di platform mana.

## Daftar icon baru

| Value | Label | Source |
|---|---|---|
| `none` | Tanpa Icon | — |
| `web` | Website | Lucide `Globe` |
| `telegram` | Telegram | Lucide `Send` (paper plane, sudah dipakai utk telegram di app ini) |
| `whatsapp` | WhatsApp | Lucide `MessageCircle` |
| `facebook` | Facebook | Lucide `Facebook` |
| `instagram` | Instagram | Lucide `Instagram` |
| `tiktok` | TikTok | Custom `TikTokIcon` (sudah ada di `src/components/icons/SocialIcons.tsx`) |
| `youtube` | YouTube | Lucide `Youtube` |
| `twitter` | X / Twitter | Lucide `Twitter` |
| `threads` | Threads | Custom `ThreadsIcon` (sudah ada) |
| `discord` | Discord | Lucide `MessagesSquare` (proxy — Lucide tidak punya icon Discord) |

Total 11 opsi (termasuk None). Icon TikTok & Threads pakai SVG custom; sisanya pakai Lucide.

## Perubahan

### 1. DB — migrasi update CHECK constraint `events_badge_icon_check`
```text
none | web | telegram | whatsapp | facebook | instagram | tiktok | youtube | twitter | threads | discord
```
Default tetap `none`. Tidak ada data lama yang perlu di-migrate karena fitur baru saja dirilis dan default `none`.

### 2. `src/components/EventBadge.tsx`
- Update `BadgeIcon` type ke 11 nilai di atas.
- Update `BADGE_ICON_OPTIONS` (label + icon).
- Render: buat helper `renderIcon(icon, className)` yang return:
  - Untuk Lucide icons → ambil dari `icons` map (sudah dipakai).
  - Untuk `tiktok`/`threads` → render custom SVG component.

### 3. `src/pages/cms/CMSEvents.tsx`
Tidak ada perubahan struktur — sudah render `BADGE_ICON_OPTIONS` secara dinamis. Tambahkan preview icon kecil di tiap tombol pilihan agar admin lebih cepat memilih:
```text
[🌐 Website]  [✈ Telegram]  [📘 Facebook]  ...
```

### 4. Tidak ada perubahan di `EventCard.tsx` / `EventDetail.tsx` — sudah pakai `<EventBadge>` component.

## File changes

```text
NEW    supabase/migrations/<ts>_update_event_badge_icon_check.sql
EDIT   src/components/EventBadge.tsx
EDIT   src/pages/cms/CMSEvents.tsx   (preview icon di tombol pilihan)
```

## Catatan
- WhatsApp & Discord pakai icon proxy karena Lucide official tidak menyediakannya; alternatif lain (Simple Icons, custom SVG) bisa dipakai jika user tidak puas — tunggu feedback.
- Warna icon mengikuti warna badge (text color), tidak di-brand-color per platform, agar konsisten dengan sistem desain badge yang sudah disetujui (teks + warna preset).