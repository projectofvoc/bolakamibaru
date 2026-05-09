import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const WEBSITE_ID = "a800340b-6bf8-4c8f-ab16-ed80a6758cdd";
const BASE = `https://umami-production-fba5.up.railway.app/api/websites/${WEBSITE_ID}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const hours = Math.max(1, Math.min(24 * 90, Number(url.searchParams.get("hours") || 24)));
    const endAt = Date.now();
    const startAt = endAt - hours * 3600 * 1000;
    const token = Deno.env.get("UMAMI_API_TOKEN") || "";

    const auth = { Authorization: `Bearer ${token}` };
    const qs = `startAt=${startAt}&endAt=${endAt}`;

    const [statsRes, eventsRes] = await Promise.all([
      fetch(`${BASE}/stats?${qs}`, { headers: auth }),
      fetch(`${BASE}/metrics?${qs}&type=event`, { headers: auth }),
    ]);

    if (!statsRes.ok) {
      const text = await statsRes.text();
      return new Response(JSON.stringify({ error: `Umami ${statsRes.status}: ${text.slice(0, 200)}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await statsRes.json();
    const events = eventsRes.ok ? await eventsRes.json() : [];
    return new Response(JSON.stringify({ ok: true, hours, ...data, events }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});