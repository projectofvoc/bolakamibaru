

## Plan: Ganti AI Terjemahan ke OpenAI (API Key Sendiri)

### Overview
Ubah edge function `translate-article` agar menggunakan OpenAI API langsung dengan `OPENAI_API_KEY` yang sudah tersimpan, bukan Lovable AI Gateway. Ini menghilangkan ketergantungan pada kredit Lovable AI.

### Changes (1 file)

**`supabase/functions/translate-article/index.ts`**

- Ganti endpoint dari `https://ai.gateway.lovable.dev/v1/chat/completions` ke `https://api.openai.com/v1/chat/completions`
- Ganti auth dari `LOVABLE_API_KEY` ke `OPENAI_API_KEY`
- Ganti model dari `google/gemini-3-flash-preview` ke `gpt-4o-mini` (cepat, murah, cukup untuk terjemahan)
- Error handling tetap sama (429 rate limit, 402 insufficient credits → billing issue)

### Key Difference

```text
BEFORE:  Lovable AI Gateway → kredit Lovable → model Gemini
AFTER:   OpenAI API langsung → billing OpenAI Anda → model GPT-4o-mini
```

Tidak ada perubahan di frontend atau CMS. Fungsi terjemahan tetap dipanggil sama seperti sebelumnya.

