import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const LatestUpdates: React.FC = () => {
  const { language, t } = useLanguage();

  const { data: articles, isLoading } = useQuery({
    queryKey: ['latest-updates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
          {t('section.latestUpdates')}
        </h2>

        {/* List */}
        <div className="space-y-4">
          {articles.map((article, index) => (
            <Link key={article.id} to={`/news/${article.slug}`}>
              <motion.article
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-4 p-4 rounded-lg bg-card hover:bg-card-hover transition-colors cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-24 h-16 rounded overflow-hidden">
                  <img
                    src={article.featured_image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=120&fit=crop'}
                    alt={language === 'id' ? article.title_id : article.title_en}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {language === 'id' ? article.title_id : article.title_en}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="text-primary text-xs font-semibold">{article.category}</span>
                    <span>•</span>
                    <span>
                      {article.published_at 
                        ? new Date(article.published_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })
                        : ''}
                    </span>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestUpdates;
