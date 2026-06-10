import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    .replace(/'/g, '&#39;');
}

function defaultHtml(siteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8">
<title>Event BOLAKAMI</title>
<meta property="og:title" content="Event BOLAKAMI">
<meta property="og:description" content="Ikuti event komunitas BOLAKAMI">
<meta property="og:image" content="${siteUrl}/og-bolakami.png">
<meta property="og:type" content="website">
<meta http-equiv="refresh" content="0; url=${siteUrl}/event">
</head><body></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const siteUrl = 'https://bolakami.com';

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(defaultHtml(siteUrl), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: event } = await supabase
      .from('events')
      .select('name, banner_url, description')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (!event) {
      return new Response(defaultHtml(siteUrl), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const eventUrl = `${siteUrl}/event?id=${id}`;
    const title = event.name as string;
    const rawDesc = (event.description as string | null) || 'Ikuti event komunitas BOLAKAMI';
    const description = rawDesc.replace(/\s+/g, ' ').slice(0, 160);
    const ogImage = (event.banner_url as string | null) || `${siteUrl}/og-bolakami.png`;

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <meta property="og:type" content="website">
  <meta property="og:url" content="${eventUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:secure_url" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta property="og:site_name" content="BOLAKAMI">
  <meta property="og:locale" content="id_ID">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@BOLAKAMI">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImage}">

  <link rel="canonical" href="${eventUrl}">
  <meta http-equiv="refresh" content="0; url=${eventUrl}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <p>Redirecting to <a href="${eventUrl}">${eventUrl}</a></p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch (err) {
    console.error('event-og-metadata error:', err);
    return new Response(defaultHtml(siteUrl), {
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
});