
## Tujuan
Mengganti panggilan langsung ke OpenAI API (`api.openai.com` + `OPENAI_API_KEY`) pada edge function `translate-article` menjadi **Lovable AI Gateway** (`ai.gateway.lovable.dev/v1` + `LOVABLE_API_KEY`), supaya billing terpusat di kredit Lovable dan tidak bergantung pada rate limit OpenAI account terpisah.

## Perubahan

### 1. `supabase/functions/translate-article/index.ts`
- Ganti `OPENAI_API_KEY` → `LOVABLE_API_KEY` (sudah tersedia di project secrets).
- Ganti endpoint:
  - Dari: `https://api.openai.com/v1/chat/completions`
  - Ke: `https://ai.gateway.lovable.dev/v1/chat/completions`
- Ganti header auth:
  - Dari: `Authorization: Bearer ${OPENAI_API_KEY}`
  - Ke: `Authorization: Bearer ${LOVABLE_API_KEY}`
- Ganti model:
  - Dari: `gpt-4o-mini`
  - Ke: `google/gemini-3-flash-preview` (default Lovable AI, cepat & murah untuk task terjemahan)
- Tambah `response_format: { type: "json_object" }` agar output JSON lebih reliable (mengurangi kebutuhan regex parsing).
- Pertahankan handling error 429 (rate limit) dan 402 (kredit habis) yang sudah ada — pesannya tetap sesuai.
- Pertahankan struktur respons dan logging yang sudah ada.

### 2. `src/pages/cms/CMSArticleEditor.tsx`
- Perbaiki parsing error dari `supabase.functions.invoke('translate-article')`:
  - `FunctionsHttpError` punya `context.response` yang berisi body JSON dengan field `error`.
  - Baca body tersebut dan tampilkan pesan spesifik di toast:
    - 429 → "Batas permintaan tercapai, silakan coba lagi nanti."
    - 402 → "Kredit AI habis. Silakan tambahkan kredit di workspace Lovable."
    - Lainnya → tampilkan `error.message` dari body.
- Tidak mengubah flow publish — hanya pesan error yang lebih informatif.

## Yang TIDAK Diubah
- `OPENAI_API_KEY` tetap di project (tidak dihapus) — bisa berguna untuk fungsi lain jika ada. Hanya tidak dipakai oleh `translate-article` lagi.
- Tidak ada perubahan database / schema.
- Tidak ada perubahan UI lain selain pesan toast error.

## Verifikasi Setelah Implementasi
1. Deploy edge function `translate-article`.
2. Test dengan `supabase--curl_edge_functions` mengirim payload `{title_id, excerpt_id, content_id}` sederhana.
3. Cek response 200 + JSON `{title_en, excerpt_en, content_en}` valid.
4. Cek logs tidak ada lagi error "Rate limit exceeded" dari OpenAI.
5. Test publish artikel di CMS — pastikan terjemahan berhasil dan toast error (jika ada) menampilkan pesan jelas.

## Estimasi Dampak
- **Positif:** Tidak ada lagi 429 dari OpenAI (kecuali kredit Lovable habis, yang error-nya jelas).
- **Biaya:** Bergeser dari billing OpenAI ke kredit Lovable workspace (Gemini Flash jauh lebih murah dari GPT-4o-mini).
- **Risiko:** Jika kredit Lovable habis → error 402 dengan pesan jelas. Tinggal top-up di Settings → Plans & credits.
