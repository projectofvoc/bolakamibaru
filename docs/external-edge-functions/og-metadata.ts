/**
 * =============================================================
 * OG-METADATA EDGE FUNCTION - Deploy ke Supabase Eksternal
 * =============================================================
 * 
 * Edge function ini di-deploy ke Supabase project: zmbawgfnrtspgdiqywzc
 * Data artikel di-query dari Lovable Cloud DB: wqrvguxkanjuorntlmmx
 * 
 * ---- DEPLOYMENT INSTRUCTIONS ----
 * 
 * 1. Set secrets di Supabase eksternal:
 *    supabase secrets set LOVABLE_SUPABASE_URL=https://wqrvguxkanjuorntlmmx.supabase.co --project-ref zmbawgfnrtspgdiqywzc
 *    supabase secrets set LOVABLE_SERVICE_ROLE_KEY=<service_role_key_dari_lovable_cloud> --project-ref zmbawgfnrtspgdiqywzc
 * 
 * 2. Buat folder structure di project Supabase eksternal lokal:
 *    supabase/functions/og-metadata/index.ts
 * 
 * 3. Copy kode di bawah ke file tersebut
 * 
 * 4. Deploy:
 *    supabase functions deploy og-metadata --project-ref zmbawgfnrtspgdiqywzc
 * 
 * ---- ARSITEKTUR ----
 * 
 * Supabase Eksternal (zmbawgfnrtspgdiqywzc)
 *      │
 *      │  og-metadata edge function
 *      │  query articles menggunakan:
 *      │  - LOVABLE_SUPABASE_URL
 *      │  - LOVABLE_SERVICE_ROLE_KEY
 *      ▼
 * Lovable Cloud DB (wqrvguxkanjuorntlmmx)
 *      │
 *      ▼
 * Tabel articles (data tetap di sini)
 * 
 * =============================================================
 */

// @ts-nocheck - File ini bukan untuk dijalankan di Lovable, hanya dokumentasi

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateDefaultOGHtml(siteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta property="og:title" content="BolaKami - Berita Sepak Bola Terkini" />
  <meta property="og:description" content="Dapatkan berita sepak bola terbaru, skor langsung, dan analisis mendalam" />
  <meta property="og:image" content="${siteUrl}/og-bolakami.png" />
  <meta property="og:url" content="${siteUrl}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta http-equiv="refresh" content="0;url=${siteUrl}" />
  <title>BolaKami - Berita Sepak Bola Terkini</title>
</head>
<body><p>Redirecting...</p></body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    const siteUrl = 'https://bolakami.com';

    if (!slug) {
      return new Response(generateDefaultOGHtml(siteUrl), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Koneksi ke Lovable Cloud database (bukan database lokal)
    const lovableUrl = Deno.env.get('LOVABLE_SUPABASE_URL')!;
    const lovableKey = Deno.env.get('LOVABLE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(lovableUrl, lovableKey);

    const { data: article, error } = await supabase
      .from('articles')
      .select('title_id, title_en, excerpt_id, excerpt_en, featured_image, category, slug, published_at')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !article) {
      console.log('Article not found:', slug, error?.message);
      return new Response(generateDefaultOGHtml(siteUrl), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const title = escapeHtml(article.title_id || article.title_en);
    const description = escapeHtml(
      article.excerpt_id || article.excerpt_en || 'Baca berita selengkapnya di BolaKami'
    );
    const image = article.featured_image || `${siteUrl}/og-bolakami.png`;
    const articleUrl = `${siteUrl}/berita/${article.slug}`;
    const publishedTime = article.published_at || new Date().toISOString();

    const ogHtml = `<!DOCTYPE html>
<html lang="id" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${title} - BolaKami</title>
  <meta name="title" content="${title} - BolaKami" />
  <meta name="description" content="${description}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${articleUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="BolaKami" />
  <meta property="og:locale" content="id_ID" />
  <meta property="article:published_time" content="${publishedTime}" />
  <meta property="article:section" content="${escapeHtml(article.category || 'Berita')}" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${articleUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  
  <!-- WhatsApp specific -->
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:alt" content="${title}" />
  
  <!-- Canonical -->
  <link rel="canonical" href="${articleUrl}" />
  
  <!-- Redirect browser to actual article page -->
  <meta http-equiv="refresh" content="0;url=${articleUrl}" />
  
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #0a0a0a; color: #fff; }
    .loading { text-align: center; }
    .spinner { width: 40px; height: 40px; border: 3px solid #333; border-top-color: #22c55e; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <p>Memuat berita...</p>
  </div>
</body>
</html>`;

    return new Response(ogHtml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (err) {
    console.error('OG metadata error:', err);
    return new Response('Internal Server Error', {
      status: 500,
      headers: corsHeaders,
    });
  }
});
