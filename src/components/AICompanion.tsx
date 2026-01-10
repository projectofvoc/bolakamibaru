import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Flag, Plus, Mic, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

const AICompanion: React.FC = () => {
  const { t } = useLanguage();

  const prompts = [
    t('ai.prompt1'),
    t('ai.prompt2'),
    t('ai.prompt3'),
  ];

  return (
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
            
            {/* Headline */}
            <h2 className="text-xl md:text-2xl font-bold text-primary mb-2">
              {t('ai.headline')}
            </h2>
            
            {/* Subtitle */}
            <p className="text-muted-foreground mb-8">
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
                placeholder={t('ai.placeholder')}
                className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
              />
              
              {/* Microphone icon */}
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              
              {/* Send button - rounded-full */}
              <button className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
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
                  className="px-4 py-2 text-sm bg-secondary/50 text-foreground rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AICompanion;
