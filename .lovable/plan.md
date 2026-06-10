# Plan: Bersihkan URL Bar pada Share Link Event

## Goal
Hilangkan hop ke URL edge function (`wqrvguxkanjuorntlmmx.supabase.co/...`) yang muncul di URL bar pengunjung saat membuka `/share/event/<slug>`. Pengunjung harus langsung mendarat di `/event?slug=...` di domain yang sama.

## Perubahan

### `src/pages/ShareEventRedirect.tsx`
Ganti `window.location.replace(<edgeFunctionUrl>)` dengan navigasi client-side via React Router `<Navigate replace>` ke route lokal.

- Param `:idOrSlug` di-deteksi UUID atau slug (regex sudah ada).
- UUID → `<Navigate to="/event?id=<uuid>" replace />`.
- Slug → `<Navigate to="/event?slug=<slug>" replace />`.
- Loader hanya muncul satu frame sebelum Navigate render.

Hasil: URL bar berubah dari `/share/event/<slug>` langsung jadi `/event?slug=<slug>` (replace, jadi tidak menambah history entry). Tidak ada flash supabase.co.

### Edge function `event-og-metadata`
Biarkan apa adanya. Tetap dipakai oleh bot sender / social crawler bila dipanggil langsung. Tidak ada perubahan.

## Out of scope
- Tidak mengubah UI card / dialog.
- Tidak mengubah skema DB.
- Tidak mengubah tombol Copy Link (URL yang disalin tetap `/share/event/<slug>` — bersih dan stabil).
