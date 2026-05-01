import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: Deno.env.get('GA4_OAUTH_CLIENT_ID')!,
      client_secret: Deno.env.get('GA4_OAUTH_CLIENT_SECRET')!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const j = await res.json()
  if (!res.ok) throw new Error(j.error_description || j.error || 'refresh_failed')
  return { access_token: j.access_token as string, expires_in: (j.expires_in as number) || 3600 }
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
      { global: { headers: { Authorization: authHeader } } }
    )
    const token = authHeader.replace('Bearer ', '')
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token)
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const userId = claims.claims.sub as string

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: roleRow } = await admin.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle()
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const body = await req.json().catch(() => ({}))
    const action = body.action || 'report'
    const days = Math.min(Math.max(parseInt(body.days || '30', 10) || 30, 1), 365)

    if (action === 'status') {
      const { data: t } = await admin.from('ga4_oauth_tokens').select('google_email, ga4_property_id').eq('user_id', userId).maybeSingle()
      return new Response(JSON.stringify({ connected: !!t, email: t?.google_email || null, property_id: t?.ga4_property_id || null }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'set_property') {
      const propertyId = String(body.property_id || '').trim()
      if (!/^\d+$/.test(propertyId)) {
        return new Response(JSON.stringify({ error: 'Invalid property id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      const { error: upErr } = await admin.from('ga4_oauth_tokens').update({ ga4_property_id: propertyId, updated_at: new Date().toISOString() }).eq('user_id', userId)
      if (upErr) return new Response(JSON.stringify({ error: upErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'disconnect') {
      await admin.from('ga4_oauth_tokens').delete().eq('user_id', userId)
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // action === 'report'
    const { data: tokenRow, error: tokenErr } = await admin.from('ga4_oauth_tokens').select('*').eq('user_id', userId).maybeSingle()
    if (tokenErr || !tokenRow) {
      return new Response(JSON.stringify({ error: 'Not connected' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (!tokenRow.ga4_property_id) {
      return new Response(JSON.stringify({ error: 'No property id set' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let accessToken = tokenRow.access_token
    const expiresAt = new Date(tokenRow.expires_at).getTime()
    if (expiresAt - Date.now() < 60_000) {
      const r = await refreshAccessToken(tokenRow.refresh_token)
      accessToken = r.access_token
      const newExpiresAt = new Date(Date.now() + r.expires_in * 1000).toISOString()
      await admin.from('ga4_oauth_tokens').update({ access_token: accessToken, expires_at: newExpiresAt, updated_at: new Date().toISOString() }).eq('user_id', userId)
    }

    const propertyId = tokenRow.ga4_property_id
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
      connected: true,
      email: tokenRow.google_email,
      property_id: propertyId,
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