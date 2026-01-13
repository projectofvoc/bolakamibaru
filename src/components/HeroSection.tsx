import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-stadium.jpg';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const HeroSection: React.FC = () => {
  const { language, t } = useLanguage();

  const { data: featuredArticle, isLoading } = useQuery({
    queryKey: ['hero-featured-article'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      // Fallback to latest article if no featured
      if (!data) {
        const { data: latestData, error: latestError } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (latestError) throw latestError;
        return latestData;
      }
      
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-card">
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12 md:pb-16">
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-12 w-full max-w-2xl mb-4" />
            <Skeleton className="h-6 w-full max-w-xl mb-6" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </section>
    );
  }

  if (!featuredArticle) {
    return null;
  }

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${featuredArticle.featured_image || heroImage})` }}
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
              {language === 'id' ? featuredArticle.title_id : featuredArticle.title_en}
            </h1>
            
            {/* Excerpt */}
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
              {language === 'id' ? featuredArticle.excerpt_id : featuredArticle.excerpt_en}
            </p>
            
            {/* Meta */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{featuredArticle.author_name || 'Bolakami'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {featuredArticle.published_at 
                    ? new Date(featuredArticle.published_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })
                    : ''}
                </span>
              </div>
            </div>
            
            {/* CTA Button */}
            <Link to={`/news/${featuredArticle.slug}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                {t('hero.readMore')}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
