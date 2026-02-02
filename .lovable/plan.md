

# Plan: Render Markdown pada Respons AI

## Masalah
Respons AI menampilkan simbol markdown mentah seperti `**` karena model AI (Gemini/GPT) secara natural menggunakan format markdown untuk output mereka, tetapi komponen chat tidak me-render markdown tersebut.

## Solusi
Tambahkan library `react-markdown` untuk merender respons AI dengan proper markdown formatting sehingga `**teks**` menjadi **teks tebal**, lists terformat rapi, dll.

---

## Langkah Implementasi

### Langkah 1: Install Library
Tambahkan package `react-markdown` ke project.

### Langkah 2: Update AIChatSidebar.tsx
Update komponen untuk merender respons AI menggunakan ReactMarkdown.

**File:** `src/components/AIChatSidebar.tsx`

```text
Perubahan yang akan dilakukan:
├── Import ReactMarkdown dari 'react-markdown'
├── Ganti <p>{message.content}</p> dengan <ReactMarkdown>
├── Tambahkan styling untuk prose/markdown content
└── Hanya apply untuk message role 'ai' (user tetap plain text)
```

**Sebelum:**
```tsx
<p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
```

**Sesudah:**
```tsx
{message.role === 'ai' ? (
  <div className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none">
    <ReactMarkdown>{message.content}</ReactMarkdown>
  </div>
) : (
  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
)}
```

---

## Hasil yang Diharapkan
- `**BRI Liga 1 2024/2025**` akan menjadi **BRI Liga 1 2024/2025** (bold)
- `*teks*` akan menjadi *teks* (italic)
- Lists akan terformat dengan proper bullet/numbering
- Links akan clickable

## Estimasi Waktu
- Implementasi: 3-5 menit
- Testing: 2 menit

