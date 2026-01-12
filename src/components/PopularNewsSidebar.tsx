import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, Bookmark } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const PopularNewsSidebar: React.FC = () => {
  const { language, t } = useLanguage();
  
  const { data: articles, isLoading } = useQuery({
    queryKey: ['popular-news-sidebar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(11);
      
      if (error) throw error;
      return data;
    }
  });

  const thumbnailArticles = articles?.slice(0, 3) || [];
  const textOnlyArticles = articles?.slice(3, 11) || [];

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <Skeleton className="h-6 w-32 mb-5" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[16/9] rounded-lg mb-3" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
        <div className="border-t border-border my-5" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-lg font-bold text-foreground mb-5">
        {t('news.popularNews')}
      </h3>
      
      {/* Top 3 Articles with Thumbnails */}
      <div className="space-y-4">
        {thumbnailArticles.map((article) => (
          <Link
            key={article.id}
            to={`/news/${article.slug}`}
            className="block group"
          >
            {/* Thumbnail with badges - 16:9 aspect ratio */}
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-3">
              <img
                src={article.featured_image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=225&fit=crop'}
                alt={language === 'id' ? article.title_id : article.title_en}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Category Badge - Top Left */}
              <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                {article.category}
              </span>
              
              {/* Club Badge - Top Right */}
              {article.club && (
                <span className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                  {article.club}
                </span>
              )}
            </div>
            
            {/* Title - consistent with NewsGrid */}
            <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {language === 'id' ? article.title_id : article.title_en}
            </h4>
            
            {/* Publisher metadata row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                {/* Publisher icon */}
                <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px]">
                  {article.publisher_icon || '📰'}
                </span>
                
                {/* Publisher name */}
                <span>{article.publisher_name || 'Bolakama'}</span>
                
                {/* Verified badge */}
                {article.publisher_verified && (
                  <CheckCircle className="w-3 h-3 text-primary fill-primary" />
                )}
                
                {/* Separator */}
                <span>·</span>
                
                {/* Timestamp */}
                <span>
                  {article.published_at 
                    ? new Date(article.published_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })
                    : ''}
                </span>
              </div>
              
              {/* Bookmark button */}
              <button 
                className="p-1 hover:bg-muted rounded-full transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </Link>
        ))}
      </div>

      {/* Divider */}
      {textOnlyArticles.length > 0 && <div className="border-t border-border my-5" />}

      {/* Bottom 8 Articles - Text Only List */}
      <div className="space-y-0">
        {textOnlyArticles.map((article, index) => (
          <Link
            key={article.id}
            to={`/news/${article.slug}`}
            className="flex items-start gap-3 py-3 border-b border-border last:border-b-0 group"
          >
            {/* Number */}
            <span className="text-base font-bold text-muted-foreground/50 w-6 shrink-0">
              {String(index + 4).padStart(2, '0')}
            </span>
            
            {/* Title */}
            <h4 className="text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {language === 'id' ? article.title_id : article.title_en}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularNewsSidebar;
