import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function generateDefaultOGHtml(siteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>BOLAKAMI - Portal Berita Sepak Bola Indonesia</title>
  <meta property="og:title" content="BOLAKAMI - Portal Berita Sepak Bola Indonesia">
  <meta property="og:description" content="Portal berita sepak bola terlengkap di Indonesia">
  <meta property="og:image" content="${siteUrl}/og-bolakami.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="BOLAKAMI">
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>`
}

Deno.serve(async (req) => {
  console.log('OG Metadata Edge Function v2 - Request received')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const slug = url.searchParams.get('slug')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const siteUrl = 'https://bolakamibaru.lovable.app'

    console.log(`OG Metadata request - Slug: ${slug || 'none'}`)

    // If no slug, return default OG HTML
    if (!slug) {
      console.log('No slug provided, returning default OG')
      return new Response(generateDefaultOGHtml(siteUrl), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    // Fetch article from database
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Fetching article from database...')
    const { data: article, error } = await supabase
      .from('articles')
      .select('title_id, title_en, excerpt_id, excerpt_en, featured_image, slug, category')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) {
      console.error('Database error:', error.message)
      return new Response(generateDefaultOGHtml(siteUrl), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    if (!article) {
      console.log('Article not found for slug:', slug)
      return new Response(generateDefaultOGHtml(siteUrl), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    console.log('Article found:', article.title_id)

    // Use /news/ path to match SPA route
    const articleUrl = `${siteUrl}/news/${article.slug}`
    const ogImage = article.featured_image || `${siteUrl}/og-bolakami.png`
    const title = article.title_id || article.title_en || 'BOLAKAMI'
    const description = (article.excerpt_id || article.excerpt_en || 'Baca berita terbaru di BOLAKAMI').substring(0, 200)

    console.log('Generating OG HTML with:', { title, ogImage, articleUrl })

    // Return HTML with OG meta tags for ALL requests (crawlers and browsers)
    // Browsers will be redirected via meta refresh
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | BOLAKAMI</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${articleUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta property="og:site_name" content="BOLAKAMI">
  <meta property="og:locale" content="id_ID">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@BOLAKAMI">
  <meta name="twitter:creator" content="@BOLAKAMI">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImage}">
  
  <!-- WhatsApp -->
  <meta property="og:image:secure_url" content="${ogImage}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${articleUrl}">
  
  <!-- Redirect browsers to SPA -->
  <meta http-equiv="refresh" content="0; url=${articleUrl}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <p>Redirecting to <a href="${articleUrl}">${articleUrl}</a></p>
</body>
</html>`

    return new Response(html, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error in og-metadata function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
