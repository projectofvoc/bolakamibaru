import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const PROMPT_GENERATION_INSTRUCTION = `Kamu adalah asisten yang menghasilkan 3 suggestion prompts untuk chatbot sepak bola.

Buatkan 3 pertanyaan pendek dan menarik yang relevan dengan topik sepak bola terkini:
- Pertanyaan tentang liga-liga top Eropa (Premier League, La Liga, Serie A, Bundesliga, Ligue 1)
- Pertanyaan tentang Liga Indonesia (Liga 1, Liga 2, Tim Nasional)
- Pertanyaan tentang pemain, statistik, transfer, atau pertandingan terkini
- Pertanyaan tentang prediksi atau analisa pertandingan

Format output: JSON array dengan 3 string, contoh:
["Siapa top skor Premier League minggu ini?", "Prediksi El Clasico akhir pekan ini", "Statistik Persib di 5 laga terakhir"]

PENTING:
- Gunakan bahasa Indonesia
- Maksimal 40 karakter per prompt
- Variasikan topik (jangan semua tentang hal yang sama)
- Buat pertanyaan yang engaging dan actionable`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase credentials not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Supabase credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Generating new AI prompts...');

    // Call OpenAI to generate prompts
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: PROMPT_GENERATION_INSTRUCTION },
          { role: 'user', content: `Generate 3 fresh football prompts for today: ${new Date().toISOString()}` }
        ],
        temperature: 0.9,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `OpenAI API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('OpenAI response:', content);

    // Parse the JSON array from response
    let prompts: string[];
    try {
      // Extract JSON array from response (handle potential markdown code blocks)
      const jsonMatch = content.match(/\[.*\]/s);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      prompts = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(prompts) || prompts.length !== 3) {
        throw new Error('Expected array of 3 prompts');
      }
    } catch (parseError) {
      console.error('Failed to parse prompts:', parseError);
      // Use fallback prompts
      prompts = [
        'Top skor Liga 1 musim ini?',
        'Prediksi pertandingan EPL weekend',
        'Statistik Messi vs Ronaldo 2024'
      ];
    }

    console.log('Parsed prompts:', prompts);

    // Deactivate old prompts
    const { error: deactivateError } = await supabase
      .from('ai_prompts')
      .update({ is_active: false })
      .eq('is_active', true);

    if (deactivateError) {
      console.error('Failed to deactivate old prompts:', deactivateError);
    }

    // Insert new prompts
    const newPrompts = prompts.map((text, index) => ({
      prompt_text: text,
      prompt_order: index + 1,
      is_active: true
    }));

    const { data: insertedData, error: insertError } = await supabase
      .from('ai_prompts')
      .insert(newPrompts)
      .select();

    if (insertError) {
      console.error('Failed to insert new prompts:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save prompts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully updated prompts:', insertedData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        prompts: prompts,
        message: 'Prompts updated successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-ai-prompts function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
