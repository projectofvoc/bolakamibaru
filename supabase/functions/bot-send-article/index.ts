import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BotSettings {
  is_enabled: boolean;
  auto_send_on_publish: boolean;
  allow_manual_send: boolean;
  provider_name: string;
  bot_token: string | null;
  api_key: string | null;
  secret_key: string | null;
  endpoint_url: string | null;
  destination_id: string | null;
  message_thread_id: string | null;
  default_template: string | null;
  fallback_image_url: string | null;
  send_mode: string;
  parse_mode: string;
  use_fallback_image: boolean;
  retry_enabled: boolean;
  max_retry_count: number;
  retry_delay_seconds: number;
  request_timeout_seconds: number;
  send_without_image: boolean;
}

function formatMessage(
  template: string,
  article: any,
  baseUrl: string
): string {
  const articleUrl = `${baseUrl}/news/${article.slug}`;
  return template
    .replace(/\{title\}/g, article.title_id || article.title_en || "")
    .replace(/\{excerpt\}/g, article.excerpt_id || article.excerpt_en || "")
    .replace(/\{article_url\}/g, articleUrl)
    .replace(
      /\{published_at\}/g,
      article.published_at
        ? new Date(article.published_at).toLocaleString("id-ID")
        : ""
    );
}

async function sendTelegram(
  settings: BotSettings,
  article: any,
  message: string,
  imageUrl: string | null,
  timeout: number
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  const botToken = settings.bot_token;
  const chatId = settings.destination_id;

  if (!botToken || !chatId) {
    return { success: false, error: "Bot token or chat ID not configured" };
  }

  const baseUrl =
    settings.endpoint_url || `https://api.telegram.org/bot${botToken}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

  try {
    let response: Response;
    let data: any;

    if (
      imageUrl &&
      settings.send_mode === "photo_caption"
    ) {
      // Try sending as photo with caption
      const caption =
        message.length > 1024 ? message.substring(0, 1024) : message;

      response = await fetch(`${baseUrl}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          ...(settings.message_thread_id ? { message_thread_id: Number(settings.message_thread_id) } : {}),
          photo: imageUrl,
          caption,
          parse_mode: settings.parse_mode,
        }),
        signal: controller.signal,
      });
      data = await response.json();

      // If photo send succeeds and message was truncated, send remaining as text
      if (data.ok && message.length > 1024) {
        await fetch(`${baseUrl}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            ...(settings.message_thread_id ? { message_thread_id: Number(settings.message_thread_id) } : {}),
            text: message,
            parse_mode: settings.parse_mode,
          }),
        });
      }
    } else {
      // Text only
      response = await fetch(`${baseUrl}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          ...(settings.message_thread_id ? { message_thread_id: Number(settings.message_thread_id) } : {}),
          text: message,
          parse_mode: settings.parse_mode,
        }),
        signal: controller.signal,
      });
      data = await response.json();
    }

    clearTimeout(timeoutId);

    if (data.ok) {
      return {
        success: true,
        message_id: String(data.result?.message_id || ""),
      };
    } else {
      return {
        success: false,
        error: data.description || "Unknown Telegram error",
      };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      return { success: false, error: "Request timed out" };
    }
    return { success: false, error: err.message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action, article_id, force } = body;

    // Fetch settings
    const { data: settings, error: settingsErr } = await supabase
      .from("bot_sender_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsErr || !settings) {
      return new Response(
        JSON.stringify({ error: "Bot sender settings not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TEST CONNECTION
    if (action === "test_connection") {
      if (!settings.bot_token || !settings.destination_id) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Bot token dan Chat ID harus diisi",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const baseUrl =
        settings.endpoint_url ||
        `https://api.telegram.org/bot${settings.bot_token}`;
      try {
        const res = await fetch(`${baseUrl}/getMe`);
        const data = await res.json();
        if (data.ok) {
          return new Response(
            JSON.stringify({
              success: true,
              bot_name: data.result?.first_name,
              bot_username: data.result?.username,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({
            success: false,
            error: data.description || "Connection failed",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e: any) {
        return new Response(
          JSON.stringify({ success: false, error: e.message }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // TEST MESSAGE
    if (action === "test_message") {
      if (!settings.bot_token || !settings.destination_id) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Bot token dan Chat ID harus diisi",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const testMessage = "🧪 Test message dari BOLAKAMI CMS Bot Sender\n\nKoneksi berhasil! Bot siap mengirim berita.";
      const baseUrl =
        settings.endpoint_url ||
        `https://api.telegram.org/bot${settings.bot_token}`;

      try {
        const res = await fetch(`${baseUrl}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: settings.destination_id,
            ...(settings.message_thread_id ? { message_thread_id: Number(settings.message_thread_id) } : {}),
            text: testMessage,
            parse_mode: settings.parse_mode,
          }),
        });
        const data = await res.json();
        if (data.ok) {
          return new Response(
            JSON.stringify({ success: true, message_id: data.result?.message_id }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ success: false, error: data.description }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e: any) {
        return new Response(
          JSON.stringify({ success: false, error: e.message }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // SEND ARTICLE
    if (!article_id) {
      return new Response(
        JSON.stringify({ error: "article_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.is_enabled) {
      return new Response(
        JSON.stringify({ error: "Bot sender is disabled", skipped: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.bot_token || !settings.destination_id) {
      return new Response(
        JSON.stringify({ error: "Bot configuration incomplete" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch article
    const { data: article, error: articleErr } = await supabase
      .from("articles")
      .select("*")
      .eq("id", article_id)
      .single();

    if (articleErr || !article) {
      return new Response(
        JSON.stringify({ error: "Article not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (article.status !== "published") {
      return new Response(
        JSON.stringify({ error: "Article is not published" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already sent (unless force)
    if (article.is_sent && !force) {
      return new Response(
        JSON.stringify({ error: "Article already sent", skipped: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine image
    let imageUrl = article.featured_image || null;
    if (!imageUrl && settings.use_fallback_image && settings.fallback_image_url) {
      imageUrl = settings.fallback_image_url;
    }
    if (!imageUrl && !settings.send_without_image) {
      return new Response(
        JSON.stringify({ error: "No image available and send_without_image is disabled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build message
    const siteUrl = body.site_url || "https://bolakamibaru.lovable.app";
    const template =
      settings.default_template ||
      "📰 {title}\n\n{excerpt}\n\n🔗 Baca selengkapnya:\n{article_url}";
    const message = formatMessage(template, article, siteUrl);

    // Update attempt count
    const attemptNumber = (article.send_attempt_count || 0) + 1;
    await supabase
      .from("articles")
      .update({
        send_status: "sending",
        send_attempt_count: attemptNumber,
      })
      .eq("id", article_id);

    // Send
    const result = await sendTelegram(
      settings as BotSettings,
      article,
      message,
      imageUrl,
      settings.request_timeout_seconds || 30
    );

    // Log
    await supabase.from("article_send_logs").insert({
      article_id,
      send_status: result.success ? "sent" : "failed",
      request_payload: { message, image_url: imageUrl, chat_id: settings.destination_id },
      response_payload: result,
      error_message: result.error || null,
      attempt_number: attemptNumber,
      sent_to: settings.destination_id,
      provider_name: settings.provider_name,
    });

    if (result.success) {
      await supabase
        .from("articles")
        .update({
          send_status: "sent",
          is_sent: true,
          sent_at: new Date().toISOString(),
          send_error: null,
          external_message_id: result.message_id || null,
        })
        .eq("id", article_id);

      return new Response(
        JSON.stringify({ success: true, message_id: result.message_id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      await supabase
        .from("articles")
        .update({
          send_status: "failed",
          send_error: result.error,
        })
        .eq("id", article_id);

      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    console.error("Bot send error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
