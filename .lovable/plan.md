
# Perbaikan Copywriting AI Companion - Kebijakan Non-Judi

## Masalah yang Ditemukan
Di file `src/contexts/LanguageContext.tsx`, terdapat **7 instance** kata-kata yang berpotensi terkena filter Nawala dan melanggar kebijakan Google Ads:

| Baris | Key | Kata Bermasalah |
|-------|-----|-----------------|
| 79 | `ai.headline1` | "parlay" |
| 81 | `ai.subtitle` | "odds drop", "cuan" |
| 82 | `ai.placeholder` | "BTTS", "odds" |
| 87 | `ai.chatSubtitle` | "parlay" |
| 107 | `footer.aboutText` | "parlay" |

## Solusi Copywriting

### Perubahan di `src/contexts/LanguageContext.tsx`

#### 1. AI Headline 1 (baris 79)
| Sebelum | Sesudah |
|---------|---------|
| "Mau menang parlay?" | "Mau tahu siapa yang menang?" |
| "Want to win parlay?" | "Want to know who wins?" |

#### 2. AI Headline 2 (baris 80)
| Sebelum | Sesudah |
|---------|---------|
| "Gue bantu lu analisa!" | "Gue bantu lu analisa!" |
| (tidak berubah) | (tidak berubah) |

#### 3. AI Subtitle (baris 81)
| Sebelum | Sesudah |
|---------|---------|
| "Live score + alert odds drop! Waktunya cuan!" | "Live score + statistik lengkap! Waktunya update!" |
| "Live score + odds drop alerts! Time to win!" | "Live score + complete stats! Time to stay updated!" |

#### 4. AI Placeholder (baris 82)
| Sebelum | Sesudah |
|---------|---------|
| "Contoh: Analisa MU vs Arsenal, fokus BTTS + odds..." | "Contoh: Analisa MU vs Arsenal, fokus head-to-head..." |
| "Example: Analyze MU vs Arsenal, focus on BTTS + odds..." | "Example: Analyze MU vs Arsenal, focus on head-to-head..." |

#### 5. AI Chat Subtitle (baris 87)
| Sebelum | Sesudah |
|---------|---------|
| "Siap bantu analisa parlay kamu" | "Siap bantu analisa pertandingan kamu" |
| "Ready to help analyze your parlay" | "Ready to help analyze your matches" |

#### 6. Footer About Text (baris 107)
| Sebelum | Sesudah |
|---------|---------|
| "...plus prediksi parlay berbasis AI yang cerdas..." | "...plus analisa pertandingan berbasis AI yang cerdas..." |
| "...plus smart AI-powered parlay predictions..." | "...plus smart AI-powered match analysis..." |

---

## Ringkasan Perubahan

| Key | Kata Dihapus | Pengganti |
|-----|--------------|-----------|
| `ai.headline1` | parlay | "siapa yang menang" |
| `ai.subtitle` | odds drop, cuan | "statistik lengkap", "update" |
| `ai.placeholder` | BTTS, odds | "head-to-head" |
| `ai.chatSubtitle` | parlay | "pertandingan" |
| `footer.aboutText` | parlay | "pertandingan" |

## Dampak
- Copywriting menjadi fokus pada **analisa pertandingan dan statistik** (bukan judi/taruhan)
- Aman dari filter Nawala Indonesia
- Comply dengan kebijakan Google Ads dan App Store
- Messaging tetap menarik dan relevan untuk pengguna sepak bola
