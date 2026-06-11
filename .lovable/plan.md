## Analisis Masalah

Saya cek DB & code:

**DB row terakhir (event "Tebak & Share Pildun Bolakami"):**

```
badge_enabled: false
badge_label:   NULL
badge_color:   blue
badge_icon:    telegram
```

Jadi sebenarnya **warna & icon TERSIMPAN** ke database. Yang tidak tersimpan adalah `badge_enabled` (selalu jadi `false`) dan `badge_label` (NULL). Akibatnya badge tidak muncul di card/landing page karena render dibatasi oleh `badge_enabled && badge_label`.

**Root cause** — `src/pages/cms/CMSEvents.tsx` baris 209–210:

```ts
badge_enabled: badgeEnabled && !!badgeLabel.trim(),
badge_label:   badgeLabel.trim() ? badgeLabel.trim().slice(0,24) : null,
```

Switch hanya tersimpan `true` kalau teks badge juga terisi. Pada screenshot, "Hadiah 2 Juta" itu adalah **placeholder** (input kosong) — karena itu `badge_enabled` di-paksa `false` walau switch ON dan icon Telegram dipilih.

Tambahan: render badge di `EventCard.tsx`, `EventsSection.tsx`, dan `EventDetail.tsx` juga butuh `badge_enabled && badge_label`, jadi badge icon-only (tanpa teks) tidak mungkin.

## Rencana Perbaikan

### 1. `src/pages/cms/CMSEvents.tsx` (saveMutation)

- `badge_enabled` ikuti switch apa adanya (`badgeEnabled`), tidak tergantung label.
- `badge_label` tetap di-trim/slice 24 char, boleh NULL.
- Validasi ringan: kalau switch ON tapi label kosong **dan** icon `none`, tampilkan error "Isi teks badge atau pilih icon".

### 2. `EventBadge.tsx`

- Bila `label` kosong, render badge icon-only (padding lebih simetris, `aria-label` dari nama icon).

### 3. Render badge di card & landing

File: `src/components/EventCard.tsx`, `src/components/EventsSection.tsx`, `src/pages/EventDetail.tsx`

- Ganti syarat dari `badge_enabled && badge_label` → `badge_enabled && (badge_label || badge_icon !== 'none')`.

### 4. Tidak ada perubahan DB

Constraint & kolom sudah benar; data icon/warna lama akan langsung muncul setelah user save ulang (toggle akan tersimpan dengan benar).

### Verifikasi setelah build

- Buka event di CMS → aktifkan badge, pilih icon Telegram, kosongkan teks → Simpan → reopen: switch tetap ON, icon Telegram tetap terpilih.
- Cek di list event & landing `/event/:slug`: badge icon Telegram muncul di pojok kanan-atas banner.
- Test dengan teks "Hadiah 2 Juta" + icon → keduanya tampil.  
  
dan warna dari iconnya atau badgenya untuk media sosial tetap menggunakan warna default dari platformnya 