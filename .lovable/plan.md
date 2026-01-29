
# Plan: Mengubah Copywriting AI Companion agar Aman dari Nawala & Pelanggaran Google

## Ringkasan
Mengubah semua teks di komponen AI Companion dari terminologi terkait judi/betting menjadi fokus pada **analisis sepakbola murni** untuk menghindari pemblokiran nawala Indonesia dan pelanggaran kebijakan Google AdSense/Ads.

---

## Masalah yang Diidentifikasi

Berdasarkan screenshot, teks berikut mengandung terminologi judi:

| Lokasi | Teks Lama (Bermasalah) | Kata Kunci Judi |
|--------|------------------------|-----------------|
| Headline baris 1 | "Mau menang parlay?" | parlay |
| Headline baris 2 | "Gue bantu lu analisa!" | - |
| Subheadline | "Live score + alert odds drop! Waktunya cuan!" | odds, cuan |
| Placeholder | "Contoh: Analisa MU vs Arsenal, fokus BTTS + odds..." | BTTS, odds |

---

## Solusi: Copywriting Baru

### Opsi A - Fokus Analisis & Statistik

| Lokasi | Teks Baru |
|--------|-----------|
| Headline baris 1 | "Mau tahu siapa yang menang?" |
| Headline baris 2 | "Gue bantu lu analisa!" |
| Subheadline | "Live score + statistik lengkap! Waktunya update!" |
| Placeholder | "Contoh: Analisa MU vs Arsenal, fokus head-to-head..." |

### Opsi B - Fokus Prediksi Match

| Lokasi | Teks Baru |
|--------|-----------|
| Headline baris 1 | "Mau prediksi pertandingan?" |
| Headline baris 2 | "Gue bantu lu analisa!" |
| Subheadline | "Live score + statistik pertandingan real-time!" |
| Placeholder | "Contoh: Prediksi MU vs Arsenal, siapa lebih unggul?" |

---

## Langkah Implementasi

### 1. Update AICompanion.tsx
Mengubah 4 bagian teks:
- Headline utama (2 baris)
- Subheadline/deskripsi
- Placeholder input field

### 2. Review AIChatSidebar.tsx (jika ada)
Memastikan tidak ada terminologi judi di sidebar chat

### 3. Review Prompt Chips
Memastikan chip-chip prompt sudah aman (dari screenshot: "Siapa pencetak gol terbanyak Liga 1?", "Jadwal pertandingan Persebaya", "Statistik pemain terbaik" - ini sudah **AMAN**)

---

## Detail Teknis

**File yang akan diubah:**
- `src/components/AICompanion.tsx`

**Jenis perubahan:**
- String/teks statis saja
- Tidak ada perubahan logika atau fungsi

**Estimasi:**
- Perubahan minimal, hanya 4-5 baris teks

---

## Kata-Kata yang Harus Dihindari

| Kata Terlarang | Alternatif Aman |
|----------------|-----------------|
| parlay | prediksi / analisa |
| odds | statistik / peluang menang |
| cuan | update / info |
| BTTS | head-to-head / gol |
| betting | pertandingan |
| taruhan | jadwal |
| handicap | performa |
