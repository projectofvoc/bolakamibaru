## Plan: Ganti tombol "Salin Link" → "Share Event"

### Perubahan UI (EventDetail.tsx)

**Desktop action bar:**
- Button "Salin Link" (Link2 icon) → "Share Event" (Share2 icon dari lucide-react)
- Tetap variant `outline`, posisi sama

**Mobile sticky bar:**
- Icon button Link2 → Share2 (aria-label "Share event")

### Behavior

Handler baru `handleShare()`:
1. Jika `navigator.share` tersedia (mobile/PWA modern):
   - Panggil `navigator.share({ title: event.name, text: event.name, url: shareUrl })`
   - Tangani `AbortError` (user cancel) tanpa toast error
2. Fallback (desktop/browser tanpa Web Share API):
   - Copy `shareUrl` ke clipboard (perilaku lama)
   - Tampilkan toast "Link disalin" / "Link copied"
   - Set `copied=true` 1800ms (icon Share2 → Check)

### Teks i18n

Tambah key di `LanguageContext`:
- `event.share` → ID: "Share Event", EN: "Share Event"

(Key lama `event.copyLink` tetap dipertahankan kalau masih dipakai di tempat lain; kalau tidak, dihapus.)

### File yang diubah
- `src/pages/EventDetail.tsx` — rename handler & label, ganti icon, tambah Web Share API
- `src/contexts/LanguageContext.tsx` — tambah `event.share`

### Tidak diubah
- Tombol salin di section "Detail & Syarat" (icon Copy di header) — tetap
- DB, edge function, share redirect route, PDF
