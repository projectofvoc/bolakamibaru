import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bot, Send, Sparkles } from 'lucide-react';
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
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            
            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
              {t('ai.title')}
            </h2>
            
            {/* Suggested Prompts */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
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
            
            {/* Input Field */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder={t('ai.placeholder')}
                className="w-full px-5 py-4 pr-14 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {/* Powered By */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{t('ai.poweredBy')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AICompanion;
