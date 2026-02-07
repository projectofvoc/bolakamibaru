import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Flag, Plus, Mic, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import AIChatSidebar, { ChatMessage } from './AIChatSidebar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLiveScores } from '@/hooks/useLiveScores';
import { useUpcomingFixtures } from '@/hooks/useUpcomingFixtures';

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

  // Call OpenAI API with retry logic
  const callOpenAI = useCallback(async (message: string): Promise<string> => {
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
            conversationHistory: conversationHistory.current
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
  }, []);

  // Handle sending message
  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsOpen(true);
    setIsTyping(true);

    // Call OpenAI API
    const aiResponseText = await callOpenAI(userMessage.content);
    
    const aiResponse: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'ai',
      content: aiResponseText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  }, [inputValue, callOpenAI]);

  // Handle prompt chip click
  const handlePromptClick = async (prompt: string) => {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsOpen(true);
    setIsTyping(true);

    // Call OpenAI API
    const aiResponseText = await callOpenAI(prompt);
    
    const aiResponse: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'ai',
      content: aiResponseText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  // Handle Enter key in widget input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
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
              {/* Icon - Simple Flag */}
              <Flag className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-3 sm:mb-4" />
              
              {/* Headline Line 1 - Primary/Orange */}
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-primary">
                {t('ai.headline1')}
              </h2>
              
              {/* Headline Line 2 - White */}
              <p className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3">
                {t('ai.headline2')}
              </p>
              
              {/* Subtitle - Smaller, Gray */}
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6 sm:mb-8">
                {t('ai.subtitle')}
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
                  disabled={!inputValue.trim()}
                  className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
