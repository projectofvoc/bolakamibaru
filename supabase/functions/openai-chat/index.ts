import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `Kamu adalah Predicto AI, asisten sepak bola profesional untuk Bola Kami. Kemampuan utamamu:

1. **Informasi Sepak Bola Umum**: Berikan informasi lengkap tentang pemain, klub, liga, sejarah, dan berita terbaru sepak bola dari seluruh dunia.

2. **Racik Parlay**: Bantu pengguna meracik parlay dengan analisis cerdas:
   - Analisa statistik pertandingan
   - Form tim (5 pertandingan terakhir)
   - Head-to-head record
   - Kondisi pemain (cedera, suspensi)
   - Faktor home/away advantage
   - Rekomendasi odds yang value

3. **Statistik Lengkap**: Berikan data statistik komprehensif:
   - Klasemen liga terkini
   - Top skor dan assist
   - Statistik tim (gol, clean sheet, xG)
   - Performa pemain individu
   - Tren dan pola pertandingan

Gaya komunikasi:
- Gunakan bahasa Indonesia yang natural dan friendly
- Sertakan emoji ⚽🔥📊 untuk membuat percakapan lebih hidup
- Berikan analisis yang jelas dan terstruktur
- Jika diminta prediksi, berikan dengan basis data dan disclaimer
- Untuk parlay, berikan rekomendasi dengan tingkat kepercayaan

Catatan: Selalu berikan informasi berdasarkan pengetahuan yang kamu miliki. Jika informasi sangat baru atau tidak pasti, sampaikan hal tersebut.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API key belum dikonfigurasi' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Message is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build messages array with system prompt and conversation history
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI API with model gpt-4');

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      // Handle specific error cases
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Rate limit tercapai. Silakan coba lagi dalam beberapa saat.' 
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'API key tidak valid. Silakan periksa konfigurasi.' 
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `OpenAI API error: ${response.status}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Maaf, tidak ada respons dari AI.';

    console.log('OpenAI response received successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: aiResponse,
        usage: data.usage
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in openai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
