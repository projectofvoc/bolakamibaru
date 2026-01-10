import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { featuredArticle } from '@/data/dummyData';
import { Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-stadium.jpg';

const HeroSection: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient-overlay" />
      
      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto px-4 pb-12 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            {/* Category Badge */}
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
              {featuredArticle.category}
            </span>
            
            {/* Headline */}
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {featuredArticle.title[language]}
            </h1>
            
            {/* Excerpt */}
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
              {featuredArticle.excerpt[language]}
            </p>
            
            {/* Meta */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{featuredArticle.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{featuredArticle.timestamp}</span>
              </div>
            </div>
            
            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('hero.readMore')}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
