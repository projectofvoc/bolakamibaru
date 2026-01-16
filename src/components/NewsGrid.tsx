import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { CheckCircle, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const NewsGrid: React.FC = () => {
  const { language, t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(8);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['news-grid-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(0, 19); // Get first 20 articles for this section
      
      if (error) throw error;
      return data;
    }
  });

  const visibleArticles = articles?.slice(0, visibleCount) || [];
  const hasMore = visibleCount < (articles?.length || 0);

  if (isLoading) {
    return (
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] rounded-lg" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {t('section.fromClubs')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('section.fromClubsSubtitle')}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
                  src={article.featured_image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop'}
                  alt={language === 'id' ? article.title_id : article.title_en}
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
              
              <div className="mt-2 sm:mt-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {language === 'id' ? article.title_id : article.title_en}
                </h3>
                
                {/* Publisher Metadata Footer */}
                <div className="mt-2 sm:mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                    {/* Publisher Icon - Hidden on mobile */}
                    <span className="hidden sm:flex w-5 h-5 flex-shrink-0 items-center justify-center bg-muted rounded-full text-xs">
                      {article.publisher_icon || '📰'}
                    </span>
                    
                    {/* Publisher Name - Hidden on mobile */}
                    <span className="hidden sm:block text-xs sm:text-sm text-muted-foreground truncate max-w-[80px]">
                      {article.publisher_name || 'Bolakami'}
                    </span>
                    
                    {/* Verified Badge - Hidden on mobile */}
                    {article.publisher_verified && (
                      <CheckCircle className="hidden sm:block w-3.5 h-3.5 flex-shrink-0 text-primary fill-primary/20" />
                    )}
                    
                    {/* Separator - Hidden on mobile */}
                    <span className="hidden sm:block text-muted-foreground/50 flex-shrink-0">·</span>
                    
                    {/* Timestamp */}
                    <span className="text-[11px] sm:text-sm text-muted-foreground truncate">
                      {article.published_at 
                        ? new Date(article.published_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })
                        : ''}
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
