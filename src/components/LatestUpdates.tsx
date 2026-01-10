import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles } from '@/data/dummyData';
import { motion } from 'framer-motion';

const LatestUpdates: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
          {t('section.latestUpdates')}
        </h2>

        {/* List */}
        <div className="space-y-4">
          {articles.slice(0, 5).map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-4 p-4 rounded-lg bg-card hover:bg-card-hover transition-colors cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-24 h-16 rounded overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title[language]}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {article.title[language]}
                </h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="text-primary text-xs font-semibold">{article.category}</span>
                  <span>•</span>
                  <span>{article.timestamp}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestUpdates;
