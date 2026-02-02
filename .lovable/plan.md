

# Plan: Perbaikan AI Companion dengan Informasi Real-Time

## Masalah yang Ditemukan
AI Companion memberikan informasi **outdated/kadaluarsa** karena model GPT-4 memiliki knowledge cutoff date dan tidak memiliki akses ke informasi real-time dari internet.

**Contoh kasus:** Ronaldo sudah bermain untuk Al Nassr sejak Januari 2023, tapi AI menjawab Manchester United.

---

## Solusi yang Direkomendasikan

### Opsi 1: Upgrade ke Model Terbaru (Direkomendasikan - Cepat)
- Ganti model dari `gpt-4` ke `gpt-4-turbo` atau `gpt-4o`
- Model ini memiliki knowledge cutoff yang lebih baru (April 2024 untuk gpt-4-turbo)
- **Kelebihan:** Mudah diimplementasi, hanya perlu ganti 1 baris kode
- **Kekurangan:** Tetap ada batasan cutoff date, tidak real-time

### Opsi 2: Gunakan Lovable AI dengan Google Gemini (Direkomendasikan - Gratis)
- Ganti OpenAI dengan Lovable AI menggunakan model `google/gemini-3-flash-preview`
- **Kelebihan:** 
  - Tidak perlu API key OpenAI
  - Model lebih baru dengan pengetahuan lebih update
  - Gratis hingga batas tertentu
- **Kekurangan:** Masih ada batasan knowledge cutoff

### Opsi 3: Tambahkan Web Search Capability (Paling Akurat)
- Integrasikan dengan API pencarian (seperti Serper, Tavily, atau Bing Search)
- AI akan mencari informasi terbaru dari internet sebelum menjawab
- **Kelebihan:** Informasi selalu real-time dan akurat
- **Kekurangan:** Membutuhkan API key tambahan, sedikit lebih lambat

---

## Implementasi Rekomendasi: Upgrade ke gpt-4-turbo + Perbaiki System Prompt

### Langkah 1: Update Model dan System Prompt
**File:** `supabase/functions/openai-chat/index.ts`

```text
Perubahan yang akan dilakukan:
├── Ganti model dari "gpt-4" → "gpt-4-turbo" atau "gpt-4o"
├── Tambahkan tanggal cutoff awareness di system prompt
├── Instruksikan AI untuk mengakui keterbatasan pengetahuan
└── Tambahkan disclaimer untuk informasi yang mungkin outdated
```

### Langkah 2: Perbaikan System Prompt
Tambahkan instruksi berikut di system prompt:

```
PENTING - KETERBATASAN PENGETAHUAN:
- Pengetahuanmu memiliki batas waktu (cutoff date)
- Untuk informasi yang berubah cepat seperti transfer pemain, 
  klasemen terkini, atau berita terbaru, SELALU sampaikan bahwa:
  "Berdasarkan data terakhir yang saya miliki..."
- Jika tidak yakin dengan informasi terbaru, sarankan user 
  untuk mengecek sumber resmi
- Tanggal saat ini adalah: [dynamic date]
```

### Langkah 3: Deploy Ulang Edge Function
- Deploy function yang sudah diupdate
- Test dengan pertanyaan tentang informasi terbaru

---

## Estimasi Waktu
- Implementasi: 5-10 menit
- Testing: 5 menit

## Pertanyaan untuk User
Apakah Anda ingin:
1. **Upgrade ke gpt-4-turbo/gpt-4o** (tetap pakai OpenAI, lebih cepat)
2. **Ganti ke Lovable AI** (gratis, tidak perlu API key)
3. **Tambahkan Web Search** (paling akurat, butuh API key tambahan)

