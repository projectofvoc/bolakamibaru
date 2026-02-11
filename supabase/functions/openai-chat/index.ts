import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LOVABLE_AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Get current date in Indonesian format
const getCurrentDate = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return now.toLocaleDateString('id-ID', options);
};

const SYSTEM_PROMPT = `Kamu adalah Predicto AI, asisten sepak bola profesional untuk Bola Kami.

📅 TANGGAL HARI INI: ${getCurrentDate()}

Kemampuan utamamu:

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

⚠️ PENTING - KETERBATASAN PENGETAHUAN:
- Untuk informasi yang berubah cepat seperti transfer pemain, klasemen terkini, jadwal pertandingan, atau berita terbaru, SELALU awali dengan: "Berdasarkan data terakhir yang saya miliki..."
- Jika tidak yakin dengan informasi terkini, sarankan pengguna untuk mengecek sumber resmi seperti website klub atau liga
- JANGAN pernah memberikan informasi yang outdated dengan kepastian tinggi - lebih baik akui keterbatasan

Gaya komunikasi:
- Gunakan bahasa Indonesia yang natural dan friendly
- Sertakan emoji ⚽🔥📊 untuk membuat percakapan lebih hidup
- Berikan analisis yang jelas dan terstruktur
- Jika diminta prediksi, berikan dengan basis data dan disclaimer
- Untuk parlay, berikan rekomendasi dengan tingkat kepercayaan`;

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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Lovable API key belum dikonfigurasi' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { message, conversationHistory = [], fixture_id, match_data } = await req.json();

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

    // Build match context string if match_data is provided
    let matchContext = '';
    if (match_data) {
      matchContext = `\n\n📋 KONTEKS PERTANDINGAN SAAT INI:
- Home Team: ${match_data.homeTeam || 'N/A'}
- Away Team: ${match_data.awayTeam || 'N/A'}
- Liga: ${match_data.league || 'N/A'}
${fixture_id ? `- Fixture ID: ${fixture_id}` : ''}
${match_data.startingAt ? `- Kickoff: ${match_data.startingAt}` : ''}
${match_data.venue ? `- Venue: ${match_data.venue}` : ''}`;
    }

    // Build messages array with system prompt and conversation history
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT + matchContext },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Calling Lovable AI with model google/gemini-3-flash-preview', match_data ? `(match: ${match_data.homeTeam} vs ${match_data.awayTeam})` : '');

    const response = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        ...(match_data && {
          modeSettings: {
            home_team: match_data.homeTeam,
            away_team: match_data.awayTeam,
            league: match_data.league,
          }
        })
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
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
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Kredit habis. Silakan hubungi administrator.' 
          }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `AI service error: ${response.status}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Maaf, tidak ada respons dari AI.';

    console.log('Lovable AI response received successfully');

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
