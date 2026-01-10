import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles, featuredArticle } from '@/data/dummyData';
import { Share2 } from 'lucide-react';

const PopularNewsSidebar: React.FC = () => {
  const { language, t } = useLanguage();
  
  // Combine featured and regular articles for popular news
  const allArticles = [featuredArticle, ...articles].slice(0, 6);
  
  // Dummy share counts
  const shareCounts = [1234, 892, 756, 534, 423, 312];

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-lg font-bold text-foreground mb-5">
        {t('news.popularNews')}
      </h3>
      
      <div className="space-y-4">
        {allArticles.map((article, index) => (
          <Link
            key={article.id}
            to={`/news/${article.slug}`}
            className="flex gap-3 group"
          >
            {/* Number Badge */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Thumbnail */}
              <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-2">
                <img
                  src={article.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop'}
                  alt={article.title[language]}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              
              {/* Title */}
              <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {article.title[language]}
              </h4>
              
              {/* Share count */}
              <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground">
                <Share2 className="w-3 h-3" />
                <span className="text-xs">{shareCounts[index]} {t('news.shares')}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularNewsSidebar;
