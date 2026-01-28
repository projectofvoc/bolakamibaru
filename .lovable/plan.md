
## Rencana: URL Share Profesional dengan Internal Redirect

### Masalah Saat Ini

URL share saat ini menampilkan URL Supabase yang terlihat tidak profesional:
```
https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/og-metadata?slug=...
```

### Solusi

Membuat route internal `/share/:slug` yang akan:
1. Menampilkan halaman dengan OG meta tags yang benar
2. Auto-redirect ke halaman artikel sebenarnya (`/news/:slug`)
3. URL yang di-share menjadi lebih profesional: `bolakamibaru.lovable.app/share/artikel-slug`

### File yang Akan Dimodifikasi/Dibuat

| File | Aksi | Deskripsi |
|------|------|-----------|
| `src/pages/ShareRedirect.tsx` | Create | Halaman yang fetch OG metadata dan redirect |
| `src/App.tsx` | Modify | Tambah route `/share/:slug` |
| `src/pages/NewsDetail.tsx` | Modify | Update shareUrl ke format baru |

### Detail Implementasi

#### A. Buat ShareRedirect.tsx

Halaman ini akan:
1. Fetch data artikel berdasarkan slug
2. Set OG meta tags menggunakan `document.head` manipulation
3. Langsung redirect ke `/news/:slug`

Karena SPA, meta tags yang di-set secara client-side tidak akan terbaca oleh crawler. Namun, kita tetap perlu Edge Function untuk crawler.

**Pendekatan Hybrid:**
- URL share: `https://bolakamibaru.lovable.app/share/:slug`
- ShareRedirect page akan check apakah request dari crawler atau browser
- Browser: langsung redirect ke `/news/:slug`
- Crawler: Edge function tetap diperlukan

**Solusi Terbaik:**
Menggunakan Edge Function yang sudah ada, tapi mengubah URL di frontend menjadi path yang lebih bersih dengan memanfaatkan custom domain dan reverse proxy.

Karena keterbatasan SPA, solusi terbaik adalah:
1. **Tetap gunakan Edge Function** untuk OG metadata (crawler butuh ini)
2. **Buat halaman ShareRedirect** yang menampilkan loading singkat sebelum redirect
3. **Update URL format** yang di-share menjadi domain sendiri

#### Opsi Implementasi

**Opsi 1: Internal Route + Edge Function (Direkomendasikan)**

Buat route `/share/:slug` yang:
- Fetch artikel dan update meta tags
- Langsung redirect ke `/news/:slug` 
- **Masalah**: Crawler tidak bisa baca meta tags dari SPA

**Opsi 2: Simpan URL Cantik tapi Tetap Pakai Edge Function**

Update Edge Function untuk menerima request dari domain utama via reverse proxy. Sayangnya Lovable tidak support reverse proxy.

**Opsi 3: Fallback - Tampilkan URL Domain tapi Redirect ke Edge Function**

Buat page `/share/:slug` yang hanya redirect ke Edge Function. URL terlihat lebih baik di chat tapi tetap redirect ke Supabase.

### Implementasi yang Dipilih: Client-Side OG + Redirect

Meskipun tidak sempurna untuk semua crawler, kita bisa:
1. Buat halaman `/share/:slug` dengan proper meta tags
2. Gunakan `react-helmet` atau manual meta injection
3. WhatsApp dan beberapa crawler modern bisa membaca client-side rendered meta tags

```tsx
// src/pages/ShareRedirect.tsx
const ShareRedirect: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Fetch article data
  const { data: article } = useQuery({...});
  
  // Set meta tags when article loads
  useEffect(() => {
    if (article) {
      // Update OG meta tags
      updateMetaTags(article);
      // Redirect after small delay to let crawlers read meta
      setTimeout(() => navigate(`/news/${slug}`), 100);
    }
  }, [article]);
  
  return <LoadingSpinner />;
};
```

### Update NewsDetail.tsx

```diff
- const shareUrl = `https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/og-metadata?slug=${article.slug}`;
+ const shareUrl = `https://bolakamibaru.lovable.app/share/${article.slug}`;
```

### Update App.tsx

```diff
+ import ShareRedirect from "./pages/ShareRedirect";

  <Routes>
    ...
+   <Route path="/share/:slug" element={<ShareRedirect />} />
    <Route path="/news/:slug" element={<NewsDetail />} />
    ...
  </Routes>
```

### Hasil Akhir

**Sebelum:**
```
https://wqrvguxkanjuorntlmmx.supabase.co/functions/v1/og-metadata?slug=prediksi-mu-vs-chelsea
```

**Sesudah:**
```
https://bolakamibaru.lovable.app/share/prediksi-mu-vs-chelsea
```

### Catatan Penting

- Beberapa crawler (Facebook, Twitter) mungkin tidak membaca meta tags dari SPA karena tidak menjalankan JavaScript
- WhatsApp biasanya bisa membaca meta tags dengan delay kecil
- Untuk crawler yang butuh server-rendered HTML, Edge Function tetap diperlukan
- Jika OG preview tidak muncul di Facebook/Twitter, kita bisa fallback ke Edge Function dengan URL yang lebih bersih menggunakan custom subdomain di masa depan
