import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles } from '@/data/dummyData';
import { motion } from 'framer-motion';
import { CheckCircle, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NewsGrid: React.FC = () => {
  const { language, t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(8);

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  return (
    <section className="py-12 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
          {t('section.fromClubs')}
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleArticles.map((article, index) => (
            <Link key={article.id} to={`/news/${article.slug}`}>
              <motion.article
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
                  <span className="px-3 py-1 text-xs font-semibold bg-primary/90 text-primary-foreground rounded-full">
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
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {article.title[language]}
                </h3>
                
                {/* Publisher Metadata Footer */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* Publisher Icon */}
                    <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-muted rounded-full text-xs">
                      {article.publisher.icon}
                    </span>
                    
                    {/* Publisher Name */}
                    <span className="text-sm text-muted-foreground truncate max-w-[80px]">
                      {article.publisher.name}
                    </span>
                    
                    {/* Verified Badge */}
                    {article.publisher.verified && (
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-primary fill-primary/20" />
                    )}
                    
                    {/* Separator */}
                    <span className="text-muted-foreground/50 flex-shrink-0">·</span>
                    
                    {/* Timestamp */}
                    <span className="text-sm text-muted-foreground truncate">
                      {article.timestamp}
                    </span>
                  </div>
                  
                  {/* Bookmark Button */}
                  <button className="p-1.5 hover:bg-muted rounded-md transition-colors flex-shrink-0">
                    <Bookmark className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.article>
            </Link>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-10 text-center">
            <Button
              variant="outline"
              className="rounded-full px-8"
              onClick={() => setVisibleCount(prev => prev + 8)}
            >
              {t('section.seeMore')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsGrid;
