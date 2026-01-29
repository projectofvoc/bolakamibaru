

# Plan: Implementasi Copywriting Aman untuk AI Companion

## Ringkasan
Mengubah teks di komponen AI Companion dari terminologi judi/betting menjadi fokus pada **analisis sepakbola murni** untuk menghindari pemblokiran Nawala Indonesia dan pelanggaran Google AdSense/Ads.

---

## Masalah yang Diidentifikasi (dari Screenshot)

| Lokasi | Teks Lama (Bermasalah) | Kata Kunci Judi |
|--------|------------------------|-----------------|
| Headline baris 1 | "Mau menang parlay?" | parlay |
| Headline baris 2 | "Gue bantu lu analisa!" | - (aman) |
| Subheadline | "Live score + alert odds drop! Waktunya cuan!" | odds, cuan |
| Placeholder input | "Contoh: Analisa MU vs Arsenal, fokus BTTS + odds..." | BTTS, odds |

---

## Solusi: Copywriting Baru

Akan menggunakan **Opsi A - Fokus Analisis & Statistik**:

| Lokasi | Teks Lama | Teks Baru |
|--------|-----------|-----------|
| Headline baris 1 | "Mau menang parlay?" | **"Mau tahu siapa yang menang?"** |
| Headline baris 2 | "Gue bantu lu analisa!" | **"Gue bantu lu analisa!"** (tetap) |
| Subheadline | "Live score + alert odds drop! Waktunya cuan!" | **"Live score + statistik lengkap! Waktunya update!"** |
| Placeholder | "Contoh: Analisa MU vs Arsenal, fokus BTTS + odds..." | **"Contoh: Analisa MU vs Arsenal, fokus head-to-head..."** |

---

## Langkah Implementasi

### 1. Update AICompanion.tsx
Mengubah 4 bagian teks statis:
- Headline utama baris 1
- Subheadline/deskripsi  
- Placeholder input field

### 2. Review AIChatSidebar.tsx
Memastikan tidak ada terminologi judi di sidebar chat (jika ada).

### 3. Verifikasi Prompt Chips
Dari screenshot, chip-chip prompt sudah aman:
- "Siapa pencetak gol terbanyak Liga 1?"
- "Jadwal pertandingan Persebaya"
- "Statistik pemain terbaik"

---

## Detail Teknis

**File yang akan diubah:**
- `src/components/AICompanion.tsx`
- `src/components/AIChatSidebar.tsx` (jika ada terminologi judi)

**Jenis perubahan:**
- Hanya string/teks statis
- Tidak ada perubahan logika atau fungsi

**Estimasi waktu:**
- Perubahan minimal, sekitar 4-5 baris teks

---

## Kata-Kata yang Dihindari vs Alternatif

| Dilarang | Alternatif Aman |
|----------|-----------------|
| parlay | prediksi / analisa |
| odds | statistik / peluang menang |
| cuan | update / info |
| BTTS | head-to-head / gol |
| betting | pertandingan |
| taruhan | jadwal |
| handicap | performa |

---

## Hasil Akhir

Setelah implementasi, AI Companion akan menampilkan:
- **Headline**: "Mau tahu siapa yang menang? Gue bantu lu analisa!"
- **Subheadline**: "Live score + statistik lengkap! Waktunya update!"
- **Placeholder**: "Contoh: Analisa MU vs Arsenal, fokus head-to-head..."

Perubahan ini memastikan komponen **100% aman** dari Nawala dan kebijakan Google.

