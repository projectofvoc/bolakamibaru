// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Histats analytics scraper.
 *
 * Histats does NOT expose a public REST API for stats. The only way to read
 * the 5 metrics + daily trend the dashboard needs is to log into the Histats
 * member area and parse the HTML stats pages.
 *
 * Caching: results are stored in `api_cache` for 60s. On scrape failure, the
 * latest cached value (even if stale) is returned with `stale: true`.
 */

const HISTATS_BASE = "https://www.histats.com";

interface HistatsAnalytics {
  visitors: number;
  pageviews: number;
  pageviewsPerVisit: number;
  sessionDuration: number; // seconds
  bounceRate: number; // percent 0-100
  trend: { date: string; visitors: number }[];
}

function rangeToDays(range: string): number {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return 30;
  }
}

function parseSetCookie(headers: Headers): string {
  // Deno's Headers.getSetCookie() returns array of Set-Cookie strings
  // @ts-ignore - getSetCookie is supported in Deno's runtime
  const cookies: string[] = headers.getSetCookie?.() ?? [];
  return cookies
    .map((c) => c.split(";")[0])
    .filter(Boolean)
    .join("; ");
}

function mergeCookies(existing: string, incoming: Headers): string {
  const newCookies = parseSetCookie(incoming);
  if (!existing) return newCookies;
  if (!newCookies) return existing;
  // dedupe by cookie name
  const map = new Map<string, string>();
  for (const part of (existing + "; " + newCookies).split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }
  return Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function loginHistats(
  username: string,
  password: string,
): Promise<string> {
  // Step 1: GET login page to seed cookies
  const loginPageRes = await fetch(`${HISTATS_BASE}/`, {
    headers: { "User-Agent": UA },
    redirect: "manual",
  });
  await loginPageRes.text();
  let cookies = parseSetCookie(loginPageRes.headers);

  // Step 2: POST credentials. Histats login form posts to /index.php
  const form = new URLSearchParams();
  form.set("user", username);
  form.set("pass", password);
  form.set("act", "login");

  const loginRes = await fetch(`${HISTATS_BASE}/index.php`, {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookies,
      "Referer": `${HISTATS_BASE}/`,
    },
    body: form.toString(),
    redirect: "manual",
  });
  await loginRes.text();
  cookies = mergeCookies(cookies, loginRes.headers);

  if (!cookies || cookies.length < 5) {
    throw new Error("Histats login did not return session cookies");
  }
  return cookies;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, "")).trim();
}

function parseNumber(text: string): number {
  const cleaned = text.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(
    /,/g,
    "",
  );
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : 0;
}

function parseFloatLoose(text: string): number {
  const cleaned = text.replace(/[^\d.,-]/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseDurationToSeconds(text: string): number {
  // Common formats: "00:01:23", "1:23", "83s", "1m 23s"
  const t = text.trim();
  const colon = t.match(/(\d+):(\d+)(?::(\d+))?/);
  if (colon) {
    const a = parseInt(colon[1], 10);
    const b = parseInt(colon[2], 10);
    const c = colon[3] ? parseInt(colon[3], 10) : null;
    return c !== null ? a * 3600 + b * 60 + c : a * 60 + b;
  }
  const ms = t.match(/(?:(\d+)\s*m)?\s*(\d+)\s*s/);
  if (ms) {
    const m = ms[1] ? parseInt(ms[1], 10) : 0;
    const s = parseInt(ms[2], 10);
    return m * 60 + s;
  }
  return parseNumber(t);
}

/**
 * Try to extract a numeric metric near a label keyword from the stats page.
 * Returns 0 if not found — caller may fall back to a different heuristic.
 */
function extractMetric(html: string, labels: string[]): string {
  for (const label of labels) {
    // Pattern: <td>...label...</td>...<td>VALUE</td>
    const re = new RegExp(
      `${label}[^<]*<\\/[^>]+>\\s*<[^>]+>\\s*([^<]+)<`,
      "i",
    );
    const m = html.match(re);
    if (m && m[1]) return stripTags(m[1]);
    // Pattern: label inline followed by number
    const re2 = new RegExp(`${label}[^\\d]{0,40}([\\d.,:smh\\s]+)`, "i");
    const m2 = html.match(re2);
    if (m2 && m2[1]) return m2[1].trim();
  }
  return "";
}

async function fetchHistatsStats(
  siteId: string,
  cookies: string,
  days: number,
): Promise<HistatsAnalytics> {
  // Histats stats overview page.
  // act=5 = stats summary; sect controls range (loose conventions)
  const url =
    `${HISTATS_BASE}/viewstats/?sid=${siteId}&act=5&day=${days}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Cookie": cookies,
      "Referer": `${HISTATS_BASE}/`,
    },
    redirect: "manual",
  });
  const html = await res.text();

  if (
    /login|sign\s*in|password/i.test(html) &&
    !/visitors|pageviews|hits/i.test(html)
  ) {
    throw new Error("Histats session expired or invalid credentials");
  }

  const visitorsRaw = extractMetric(html, [
    "Visitors",
    "Visitor",
    "Pengunjung",
  ]);
  const pageviewsRaw = extractMetric(html, [
    "Pageviews",
    "Page\\s*views",
    "Hits",
  ]);
  const ppvRaw = extractMetric(html, ["Pages/Visit", "Pages\\s*per\\s*Visit"]);
  const durationRaw = extractMetric(html, [
    "Avg.?\\s*Duration",
    "Average\\s*Time",
    "Avg\\.?\\s*Visit",
  ]);
  const bounceRaw = extractMetric(html, ["Bounce\\s*Rate", "Bounce"]);

  const visitors = parseNumber(visitorsRaw);
  const pageviews = parseNumber(pageviewsRaw);
  const pagesPerVisit = ppvRaw
    ? parseFloatLoose(ppvRaw)
    : visitors > 0
    ? Number((pageviews / visitors).toFixed(2))
    : 0;
  const sessionDuration = parseDurationToSeconds(durationRaw);
  const bounceRate = parseFloatLoose(bounceRaw);

  // Trend: scrape daily-summary table if present.
  // Each row often: <tr><td>YYYY-MM-DD</td><td>visitors</td>...
  const trend: { date: string; visitors: number }[] = [];
  const rowRe =
    /<tr[^>]*>\s*<t[dh][^>]*>\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\s*<\/t[dh]>\s*<t[dh][^>]*>\s*([\d.,]+)\s*<\/t[dh]>/gi;
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(html)) !== null) {
    const dateRaw = m[1];
    const visits = parseNumber(m[2]);
    let date = dateRaw;
    if (/\d{2}\/\d{2}\/\d{4}/.test(dateRaw)) {
      const [d, mo, y] = dateRaw.split("/");
      date = `${y}-${mo}-${d}`;
    }
    trend.push({ date, visitors: visits });
  }
  // Sort ascending and keep last `days` entries
  trend.sort((a, b) => a.date.localeCompare(b.date));
  const trimmed = trend.slice(-days);

  return {
    visitors,
    pageviews,
    pageviewsPerVisit: pagesPerVisit,
    sessionDuration,
    bounceRate,
    trend: trimmed,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let range = "30d";
  try {
    const body = await req.json().catch(() => ({}));
    if (body && typeof body.range === "string") range = body.range;
  } catch (_) { /* ignore */ }

  if (!["7d", "30d", "90d"].includes(range)) range = "30d";
  const days = rangeToDays(range);
  const cacheKey = `histats:overview:${range}`;

  // 1. Cache lookup (fresh)
  try {
    const { data: cached } = await supabase
      .from("api_cache")
      .select("cache_value, expires_at")
      .eq("cache_key", cacheKey)
      .maybeSingle();
    if (cached && new Date(cached.expires_at).getTime() > Date.now()) {
      return new Response(
        JSON.stringify({
          source: "cache",
          stale: false,
          data: cached.cache_value,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (e) {
    console.warn("cache lookup failed", e);
  }

  const siteId = Deno.env.get("HISTATS_SITE_ID");
  const username = Deno.env.get("HISTATS_USERNAME");
  const password = Deno.env.get("HISTATS_PASSWORD");

  if (!siteId || !username || !password) {
    return new Response(
      JSON.stringify({
        source: "error",
        error: "Missing Histats credentials in environment",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // 2. Live scrape
  try {
    const cookies = await loginHistats(username, password);
    const stats = await fetchHistatsStats(siteId, cookies, days);

    // 3. Save cache (60s)
    const expires = new Date(Date.now() + 60_000).toISOString();
    await supabase.from("api_cache").upsert(
      {
        cache_key: cacheKey,
        cache_value: stats as any,
        expires_at: expires,
      },
      { onConflict: "cache_key" },
    );

    return new Response(
      JSON.stringify({ source: "live", stale: false, data: stats }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("Histats scrape failed:", e?.message || e);
    // 4. Stale fallback
    const { data: stale } = await supabase
      .from("api_cache")
      .select("cache_value")
      .eq("cache_key", cacheKey)
      .maybeSingle();
    if (stale?.cache_value) {
      return new Response(
        JSON.stringify({
          source: "stale",
          stale: true,
          error: String(e?.message || e),
          data: stale.cache_value,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({
        source: "error",
        error: String(e?.message || e),
        data: null,
      }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});