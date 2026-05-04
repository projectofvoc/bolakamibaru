import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Service account JWT -> access token ---
function b64url(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array
  if (typeof input === 'string') bytes = new TextEncoder().encode(input)
  else if (input instanceof ArrayBuffer) bytes = new Uint8Array(input)
  else bytes = input
  let str = ''
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i])
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function pemToPkcs8(pem: string): Uint8Array {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '')
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getServiceAccountAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - Date.now() > 60_000) {
    return cachedToken.token
  }
  const raw = Deno.env.get('GA4_SERVICE_ACCOUNT_JSON')
  if (!raw) throw new Error('GA4_SERVICE_ACCOUNT_JSON not set')
  const sa = JSON.parse(raw)

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`

  const keyData = pemToPkcs8(sa.private_key)
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(unsigned))
  const jwt = `${unsigned}.${b64url(sig)}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const j = await res.json()
  if (!res.ok) throw new Error(j.error_description || j.error || 'token_exchange_failed')

  cachedToken = {
    token: j.access_token,
    expiresAt: Date.now() + (j.expires_in || 3600) * 1000,
  }
  return cachedToken.token
}

async function runReport(propertyId: string, accessToken: string, body: any) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const j = await res.json()
  if (!res.ok) throw new Error(j?.error?.message || 'ga4_api_failed')
  return j
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userErr } = await userClient.auth.getUser(token)
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const userId = userData.user.id

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: roleRow } = await admin.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle()
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const body = await req.json().catch(() => ({}))
    const days = Math.min(Math.max(parseInt(body.days || '30', 10) || 30, 1), 365)
    const domain = body.domain === 'com' ? 'com' : 'news'

    const propertyEnvKey = domain === 'com' ? 'GA4_PROPERTY_ID_COM' : 'GA4_PROPERTY_ID'
    const propertyId = Deno.env.get(propertyEnvKey)
    if (!propertyId || !/^\d+$/.test(propertyId)) {
      const domainLabel = domain === 'com' ? 'bolakami.com' : 'bolakami.news'
      return new Response(JSON.stringify({
        error: `GA4 Property ID untuk ${domainLabel} belum dikonfigurasi (secret ${propertyEnvKey} kosong/invalid)`,
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const accessToken = await getServiceAccountAccessToken()
    const dateRange = { startDate: `${days}daysAgo`, endDate: 'today' }

    const [overview, daily, topPages, sources, devices, countries] = await Promise.all([
      runReport(propertyId, accessToken, {
        dateRanges: [dateRange],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
        ],
      }),
      runReport(propertyId, accessToken, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'totalUsers' }, { name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      runReport(propertyId, accessToken, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),
      runReport(propertyId, accessToken, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      runReport(propertyId, accessToken, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
      }),
      runReport(propertyId, accessToken, {
        dateRanges: [dateRange],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
    ])

    const ovRow = overview.rows?.[0]?.metricValues || []
    const result = {
      property_id: propertyId,
      domain,
      days,
      overview: {
        users: parseInt(ovRow[0]?.value || '0', 10),
        sessions: parseInt(ovRow[1]?.value || '0', 10),
        pageviews: parseInt(ovRow[2]?.value || '0', 10),
        avg_session_seconds: parseFloat(ovRow[3]?.value || '0'),
      },
      daily: (daily.rows || []).map((r: any) => ({
        date: r.dimensionValues[0].value,
        users: parseInt(r.metricValues[0].value, 10),
        pageviews: parseInt(r.metricValues[1].value, 10),
      })),
      top_pages: (topPages.rows || []).map((r: any) => ({
        path: r.dimensionValues[0].value,
        title: r.dimensionValues[1].value,
        views: parseInt(r.metricValues[0].value, 10),
      })),
      sources: (sources.rows || []).map((r: any) => ({
        source: r.dimensionValues[0].value,
        medium: r.dimensionValues[1].value,
        sessions: parseInt(r.metricValues[0].value, 10),
      })),
      devices: (devices.rows || []).map((r: any) => ({
        device: r.dimensionValues[0].value,
        sessions: parseInt(r.metricValues[0].value, 10),
      })),
      countries: (countries.rows || []).map((r: any) => ({
        country: r.dimensionValues[0].value,
        sessions: parseInt(r.metricValues[0].value, 10),
      })),
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e: any) {
    console.error('ga4-analytics error', e)
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
