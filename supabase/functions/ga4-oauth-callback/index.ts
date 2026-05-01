import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const stateRaw = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  const appOrigin = req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://bolakami.work'

  const redirectBack = (qs: string) => {
    let returnTo = appOrigin
    try {
      if (stateRaw) {
        const parsed = JSON.parse(atob(stateRaw))
        if (parsed.r) returnTo = parsed.r
      }
    } catch (_) {}
    const sep = returnTo.includes('?') ? '&' : '?'
    return Response.redirect(`${returnTo}${sep}${qs}`, 302)
  }

  if (error) return redirectBack(`ga4_error=${encodeURIComponent(error)}`)
  if (!code || !stateRaw) return redirectBack('ga4_error=missing_code')

  let userId: string
  try {
    const parsed = JSON.parse(atob(stateRaw))
    userId = parsed.u
    if (!userId) throw new Error('no user')
  } catch {
    return redirectBack('ga4_error=invalid_state')
  }

  try {
    const clientId = Deno.env.get('GA4_OAUTH_CLIENT_ID')!
    const clientSecret = Deno.env.get('GA4_OAUTH_CLIENT_SECRET')!
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ga4-oauth-callback`

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    const tokenJson = await tokenRes.json()
    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error('Token exchange failed', tokenJson)
      return redirectBack(`ga4_error=${encodeURIComponent(tokenJson.error || 'token_exchange_failed')}`)
    }

    const accessToken: string = tokenJson.access_token
    const refreshToken: string | undefined = tokenJson.refresh_token
    const expiresIn: number = tokenJson.expires_in || 3600
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Get user email
    let googleEmail: string | null = null
    try {
      const u = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (u.ok) {
        const uj = await u.json()
        googleEmail = uj.email || null
      }
    } catch (_) {}

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    // Preserve refresh_token if already present and Google didn't return a new one
    let finalRefresh = refreshToken
    if (!finalRefresh) {
      const { data: existing } = await admin
        .from('ga4_oauth_tokens')
        .select('refresh_token')
        .eq('user_id', userId)
        .maybeSingle()
      finalRefresh = existing?.refresh_token
    }
    if (!finalRefresh) {
      return redirectBack('ga4_error=no_refresh_token')
    }

    // Upsert
    const { error: upErr } = await admin
      .from('ga4_oauth_tokens')
      .upsert(
        {
          user_id: userId,
          access_token: accessToken,
          refresh_token: finalRefresh,
          expires_at: expiresAt,
          google_email: googleEmail,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    if (upErr) {
      console.error('Upsert failed', upErr)
      return redirectBack(`ga4_error=${encodeURIComponent('db_save_failed')}`)
    }

    return redirectBack('ga4_connected=1')
  } catch (e) {
    console.error(e)
    return redirectBack(`ga4_error=${encodeURIComponent(String(e))}`)
  }
})