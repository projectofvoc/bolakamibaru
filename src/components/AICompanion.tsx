import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Flag, Plus, Mic, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import AIChatSidebar, { ChatMessage } from './AIChatSidebar';

// Dummy AI responses for simulation
const dummyResponses = [
  {
    id: 'resp_btts',
    trigger: ['btts', 'arsenal', 'mu', 'manchester'],
    response: 'Berdasarkan analisa saya untuk MU vs Arsenal:\n\n⚽ **BTTS: Ya** (odds 1.85)\n📊 Head-to-head: 4 dari 5 pertemuan terakhir BTTS\n🔥 MU mencetak gol di 8 laga kandang berturut-turut\n⚠️ Arsenal bobol di 6 dari 7 laga tandang\n\nRekomendasi: BTTS + Over 2.5 @ 2.10',
  },
  {
    id: 'resp_liga1',
    trigger: ['liga 1', 'pencetak', 'top skor', 'gol terbanyak'],
    response: 'Top Skor Liga 1 Indonesia 2025/26:\n\n🥇 1. Matheus Pato (Persebaya) - 15 gol\n🥈 2. Wiljan Pluim (PSM) - 12 gol\n🥉 3. Marko Simic (Persija) - 11 gol\n4. David da Silva (Persib) - 10 gol\n5. Ezechiel N\'Douassel (Borneo FC) - 9 gol',
  },
  {
    id: 'resp_jadwal',
    trigger: ['jadwal', 'persebaya', 'schedule'],
    response: 'Jadwal Persebaya Surabaya minggu ini:\n\n📅 Sabtu, 18 Jan 2025\n🆚 Persebaya vs Arema FC\n🏟️ Stadion Gelora Bung Tomo\n⏰ 19:00 WIB\n\n📅 Rabu, 22 Jan 2025\n🆚 Madura United vs Persebaya\n🏟️ Stadion Gelora Madura Ratu Pamelingan\n⏰ 15:30 WIB',
  },
  {
    id: 'resp_statistik',
    trigger: ['statistik', 'pemain', 'terbaik', 'best'],
    response: 'Pemain Terbaik Liga 1 2025/26:\n\n🏆 **MVP Sementara**: Marko Simic (Persija)\n📊 Rating: 8.2 | Gol: 11 | Assist: 5\n\n🔥 **Form Terbaik**:\n• Matheus Pato - 6 gol dalam 5 laga\n• Wiljan Pluim - 4 assist dalam 3 laga\n\n🛡️ **Kiper Terbaik**: Ernando Ari (Persebaya)\n• Clean sheet: 8 | Save rate: 78%',
  },
  {
    id: 'resp_default',
    trigger: [],
    response: 'Terima kasih atas pertanyaannya! 🙏\n\nSaya adalah AI Assistant BolaKami yang siap membantu analisa:\n\n• Prediksi pertandingan & odds\n• Statistik pemain & tim\n• Jadwal pertandingan\n• Rekomendasi parlay\n\nSilakan tanyakan hal spesifik yang ingin kamu ketahui!',
  },
];

const AICompanion: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const prompts = [
    t('ai.prompt1'),
    t('ai.prompt2'),
    t('ai.prompt3'),
  ];

  // Get AI response based on user message
  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const item of dummyResponses) {
      if (item.trigger.length === 0) continue;
      if (item.trigger.some(keyword => lowerMessage.includes(keyword))) {
        return item.response;
      }
    }
    
    // Default response
    return dummyResponses.find(r => r.id === 'resp_default')?.response || 'Saya sedang memproses permintaan kamu...';
  };

  // Handle sending message
  const handleSend = useCallback(() => {
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

    // Simulate AI response delay
    const responseDelay = 1000 + Math.random() * 1500;
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'ai',
        content: getAIResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, responseDelay);
  }, [inputValue]);

  // Handle prompt chip click
  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    // Trigger send after state update
    setTimeout(() => {
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

      const responseDelay = 1000 + Math.random() * 1500;
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: 'ai',
          content: getAIResponse(prompt),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, responseDelay);
    }, 0);
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
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-secondary p-8 md:p-12 border border-border"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              {/* Icon - Simple Flag */}
              <Flag className="w-8 h-8 text-primary mx-auto mb-4" />
              
              {/* Headline Line 1 - Primary/Orange */}
              <h2 className="text-2xl md:text-4xl font-bold text-primary">
                {t('ai.headline1')}
              </h2>
              
              {/* Headline Line 2 - White */}
              <p className="text-2xl md:text-4xl font-bold text-foreground mb-3">
                {t('ai.headline2')}
              </p>
              
              {/* Subtitle - Smaller, Gray */}
              <p className="text-sm md:text-base text-muted-foreground mb-8">
                {t('ai.subtitle')}
              </p>
              
              {/* Input Field - Rounded Full with Icons */}
              <div className="relative max-w-xl mx-auto flex items-center gap-2 bg-input border border-border rounded-full px-4 py-3 mb-6">
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
                  placeholder={t('ai.placeholder')}
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
              <div className="flex flex-wrap justify-center gap-2">
                {prompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-4 py-2 text-sm bg-card text-foreground rounded-full border border-muted-foreground/30 hover:border-primary hover:text-primary transition-colors"
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
