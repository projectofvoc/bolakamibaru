import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Mic, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import AIChatSidebar, { ChatMessage } from './AIChatSidebar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLiveScores } from '@/hooks/useLiveScores';
import { useUpcomingFixtures } from '@/hooks/useUpcomingFixtures';
import dukunMascot from '@/assets/dukun-bolakami-mascot.webp';

const DUKUN_REDIRECT_URL = 'https://dukunbolakami.com';

// Use external Predicto Widget endpoint
const PREDICTO_API_URL = 'https://jfzjqdxqpqiayckjolpr.supabase.co/functions/v1/predicto-widget';

// Helper function for delay between retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AICompanion: React.FC = () => {
  const { t, language } = useLanguage();
  const [sessionId] = useState<string>(() => {
    const STORAGE_KEY = 'predicto_session_id';
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const newId = `bok-${Date.now()}`;
    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([
    t('ai.prompt1'),
    t('ai.prompt2'),
    t('ai.prompt3'),
  ]);
  // Store conversation history for OpenAI context
  const conversationHistory = useRef<ConversationMessage[]>([]);

  // Fetch live and upcoming matches for dynamic placeholder
  const { matches: liveMatches } = useLiveScores();
  const { data: upcomingMatches } = useUpcomingFixtures();

  // Generate dynamic placeholder from random live/upcoming match
  const dynamicPlaceholder = useMemo(() => {
    const allMatches: { homeTeam: string; awayTeam: string }[] = [];

    // Add live matches
    liveMatches.forEach(match => {
      allMatches.push({
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam
      });
    });

    // Add upcoming matches
    upcomingMatches?.forEach(fixture => {
      allMatches.push({
        homeTeam: fixture.homeTeam.name,
        awayTeam: fixture.awayTeam.name
      });
    });

    // Pick random match
    if (allMatches.length > 0) {
      const randomMatch = allMatches[Math.floor(Math.random() * allMatches.length)];
      return language === 'id'
        ? `Analisa pertandingan ${randomMatch.homeTeam} vs ${randomMatch.awayTeam}`
        : `Analyze ${randomMatch.homeTeam} vs ${randomMatch.awayTeam} match`;
    }

    return t('ai.placeholder');
  }, [liveMatches, upcomingMatches, language, t]);

  // Fetch dynamic prompts from database
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_prompts')
          .select('prompt_text')
          .eq('is_active', true)
          .order('prompt_order', { ascending: true })
          .limit(3);

        if (error) {
          console.error('Error fetching prompts:', error);
          return;
        }

        if (data && data.length > 0) {
          setPrompts(data.map(p => p.prompt_text));
        }
      } catch (err) {
        console.error('Failed to fetch prompts:', err);
      }
    };

    fetchPrompts();
  }, []);

  // Find matching fixture from user message
  const findMatchingFixture = useCallback((message: string) => {
    const msgLower = message.toLowerCase();

    // Check live matches first (priority for is_live flag)
    for (const match of liveMatches) {
      const homeName = match.homeTeam.toLowerCase();
      const awayName = match.awayTeam.toLowerCase();
      if (msgLower.includes(homeName) || msgLower.includes(awayName)) {
        return {
          fixture_id: match.id,
          match_data: {
            home_team: match.homeTeam,
            away_team: match.awayTeam,
            league: match.league,
          },
          is_live: true,
        };
      }
    }

    // Check upcoming fixtures
    for (const fixture of (upcomingMatches || [])) {
      const homeName = fixture.homeTeam.name.toLowerCase();
      const awayName = fixture.awayTeam.name.toLowerCase();
      if (msgLower.includes(homeName) || msgLower.includes(awayName)) {
        return {
          fixture_id: fixture.id,
          match_data: {
            home_team: fixture.homeTeam.name,
            away_team: fixture.awayTeam.name,
            league: fixture.league.name,
          },
          is_live: false,
        };
      }
    }

    return null;
  }, [liveMatches, upcomingMatches]);

  // Call OpenAI API with retry logic
  const callOpenAI = useCallback(async (
    message: string,
    matchContext?: { fixture_id: string | number; match_data: any; is_live: boolean }
  ): Promise<string> => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 detik
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`OpenAI API - Attempt ${attempt}/${MAX_RETRIES}`);
        
        const response = await fetch(PREDICTO_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message,
            sessionId,
            conversationHistory: conversationHistory.current,
            ...(matchContext && {
              fixture_id: matchContext.fixture_id,
              match_data: matchContext.match_data,
              is_live_analysis: matchContext.is_live,
              mode: 'analisa',
            })
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 429) {
            toast.error('Rate limit tercapai. Coba lagi nanti.');
            throw new Error('Rate limit exceeded');
          }
          
          if (response.status === 401) {
            toast.error('API key tidak valid.');
            throw new Error('Invalid API key');
          }
          
          throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle error dari API
        if (data.success === false) {
          throw new Error(data.error || 'API returned error');
        }
        
        // Update conversation history for context
        conversationHistory.current = [
          ...conversationHistory.current,
          { role: 'user', content: message },
          { role: 'assistant', content: data.response }
        ];
        
        // Keep only last 10 messages for context window
        if (conversationHistory.current.length > 20) {
          conversationHistory.current = conversationHistory.current.slice(-20);
        }
        
        return data.response || 'Maaf, terjadi kesalahan. Silakan coba lagi.';
        
      } catch (error) {
        console.error(`OpenAI Error (Attempt ${attempt}):`, error);
        
        // Jika belum mencapai max retry, tunggu lalu coba lagi
        if (attempt < MAX_RETRIES) {
          console.log(`Retrying in ${RETRY_DELAY}ms...`);
          await delay(RETRY_DELAY);
        }
      }
    }
    
    // Semua retry gagal
    return 'Maaf, saya sedang tidak bisa merespons setelah beberapa percobaan. Silakan coba lagi dalam beberapa saat. 🙏';
  }, [sessionId]);

  // Handle sending message — redirect to Dukun Bolakami
  const handleSend = useCallback(() => {
    window.open(DUKUN_REDIRECT_URL, '_blank', 'noopener,noreferrer');
  }, []);

  // Handle prompt chip click — redirect to Dukun Bolakami
  const handlePromptClick = (_prompt: string) => {
    window.open(DUKUN_REDIRECT_URL, '_blank', 'noopener,noreferrer');
  };

  // Handle Enter key in widget input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-secondary p-6 sm:p-8 md:p-12 border border-border"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-primary/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              {/* Dukun Bolakami Mascot */}
              <motion.img
                src={dukunMascot}
                alt="Dukun Bolakami"
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto mb-4 sm:mb-5 drop-shadow-[0_0_30px_hsl(var(--primary)/0.5)]"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Headline */}
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground">
                Analisa setiap pertandingan{' '}
                <span className="text-foreground">dengan </span>
                <span className="text-primary">Dukun Bolakami!</span>
              </h2>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-2 sm:mt-3 mb-6 sm:mb-8">
                Probabilitas, risiko, value pick, dan odds context — dalam satu chat.
              </p>
              
              {/* Input Field - Rounded Full with Icons */}
              <div className="relative max-w-xl mx-auto flex items-center gap-2 bg-input border border-border rounded-full px-3 sm:px-4 py-2.5 sm:py-3 mb-4 sm:mb-6">
                {/* Plus icon */}
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                
                {/* Input */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={dynamicPlaceholder}
                  className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                />
                
                {/* Microphone icon */}
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
                
                {/* Send button - rounded-full */}
                <button 
                  onClick={handleSend}
                  className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
              
              {/* Suggested Prompts - Below Input */}
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {prompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-card text-foreground rounded-full border border-muted-foreground/30 hover:border-primary hover:text-primary transition-colors"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Chat Sidebar */}
      <AIChatSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSend}
        isTyping={isTyping}
      />
    </>
  );
};

export default AICompanion;
