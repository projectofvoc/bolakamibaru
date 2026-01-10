import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles } from '@/data/dummyData';
import { motion } from 'framer-motion';

const NewsGrid: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <section className="py-12 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
          {t('section.fromClubs')}
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.slice(0, 8).map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group cursor-pointer"
            >
              <div className="relative rounded-lg overflow-hidden bg-card aspect-[4/3]">
                <img
                  src={article.image}
                  alt={article.title[language]}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 text-xs font-semibold bg-primary/90 text-primary-foreground rounded">
                    {article.category}
                  </span>
                </div>
                {/* Club Badge */}
                {article.club && (
                  <div className="absolute top-3 right-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-background/80 rounded-full text-xs font-bold">
                      {article.club.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {article.title[language]}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {article.timestamp}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        {/* See More Button */}
        <div className="mt-10 text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {t('section.seeMore')}
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default NewsGrid;
