import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title_id, excerpt_id, content_id } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate required fields
    if (!title_id) {
      throw new Error("title_id is required");
    }

    console.log("Translating article:", { 
      title_id: title_id.substring(0, 50), 
      hasExcerpt: !!excerpt_id, 
      hasContent: !!content_id 
    });

    const systemPrompt = `Kamu adalah penerjemah profesional untuk berita sepak bola.
Terjemahkan teks berikut dari Bahasa Indonesia ke Bahasa Inggris.
Pertahankan:
- Format HTML (jangan ubah tag HTML apapun)
- Tone jurnalistik yang profesional
- Istilah sepak bola yang tepat dalam bahasa Inggris
- Nama pemain, klub, dan kompetisi sesuai penulisan resmi internasional

Jangan:
- Tambahkan atau kurangi informasi apapun
- Ubah struktur HTML
- Berikan penjelasan atau komentar tambahan

PENTING: Hanya berikan hasil terjemahan saja, tanpa penjelasan.`;

    const userPrompt = `Terjemahkan konten berita sepak bola berikut ke Bahasa Inggris:

JUDUL:
${title_id}

${excerpt_id ? `RINGKASAN:
${excerpt_id}

` : ''}${content_id ? `KONTEN:
${content_id}` : ''}

Format respons (JSON):
{
  "title_en": "terjemahan judul",
  "excerpt_en": "terjemahan ringkasan (atau null jika tidak ada)",
  "content_en": "terjemahan konten (atau string kosong jika tidak ada)"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Batas permintaan tercapai, silakan coba lagi nanti." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Kredit AI habis, silakan tambahkan kredit." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    console.log("AI raw response:", aiResponse.substring(0, 200));

    // Parse JSON response from AI
    let translatedData;
    try {
      // Try to extract JSON from the response (AI might add extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        translatedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback: use the raw response as title if JSON parsing fails
      translatedData = {
        title_en: aiResponse.trim().split('\n')[0] || title_id,
        excerpt_en: excerpt_id || null,
        content_en: content_id || "",
      };
    }

    console.log("Translation completed:", { 
      title_en: translatedData.title_en?.substring(0, 50) 
    });

    return new Response(
      JSON.stringify({
        title_en: translatedData.title_en || title_id,
        excerpt_en: translatedData.excerpt_en || excerpt_id || null,
        content_en: translatedData.content_en || content_id || "",
      }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in translate-article:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
