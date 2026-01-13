import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Clock, ChevronRight, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import heroImage from '@/assets/hero-stadium.jpg';
import { useLiveScores } from '@/hooks/useLiveScores';
import { format } from 'date-fns';

const HeroDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const { matches: liveMatches, isLoading: isLoadingScores, error: scoresError } = useLiveScores();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch 3 featured articles from database
  const { data: featuredArticles = [], isLoading: isLoadingArticle } = useQuery({
    queryKey: ['featured-articles-hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (featuredArticles.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => 
        prev === featuredArticles.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredArticles.length]);

  // Handle manual navigation and reset timer
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Display live matches first, then finished
  const displayMatches = liveMatches
    .filter(m => m.status === 'live')
    .concat(liveMatches.filter(m => m.status !== 'live'))
    .slice(0, 6);

  // Get current article data
  const currentArticle = featuredArticles[currentSlide];
  const articleTitle = currentArticle 
    ? (language === 'id' ? currentArticle.title_id : currentArticle.title_en)
    : (language === 'id' ? 'Berita Terbaru Akan Muncul Di Sini' : 'Latest News Will Appear Here');
  
  const articleCategory = currentArticle?.category || 'Daily';
  const articleAuthor = currentArticle?.author_name || 'BOLAKAMI';
  const articleDate = currentArticle?.published_at 
    ? format(new Date(currentArticle.published_at), 'dd MMM yyyy')
    : format(new Date(), 'dd MMM yyyy');
  const articleSlug = currentArticle?.slug || '';
  const articleImage = currentArticle?.featured_image || heroImage;

  return (
    <section className="w-full bg-background py-6">
      <div className="container mx-auto px-4">
        {/* Main Container with 2 Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6"
        >
          {/* Card 1: Featured Article Slideshow (Left - 8 cols) */}
          <div className="lg:col-span-8 relative overflow-hidden bg-card rounded-2xl border border-border min-h-[450px]">
            {isLoadingArticle ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : featuredArticles.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">
                  {language === 'id' ? 'Tidak ada artikel featured' : 'No featured articles'}
                </p>
              </div>
            ) : (
              <Link 
                to={articleSlug ? `/news/${articleSlug}` : '#'} 
                className="block w-full h-full"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentArticle?.id || 'empty'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${articleImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    
                    <div className="relative h-full flex flex-col p-6">
                      {/* Category Badge - Top Left */}
                      <span className="inline-flex items-center gap-1 w-fit px-3 py-1 mb-auto text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                        <Play className="w-3 h-3" />
                        {articleCategory}
                      </span>
                      
                      {/* Content at bottom */}
                      <div className="mt-auto">
                        {/* Popular News Label */}
                        <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2 block">
                          {language === 'id' ? 'BERITA POPULER' : 'POPULAR NEWS'}
                        </span>
                        
                        {/* Headline */}
                        <motion.h2 
                          key={`title-${currentArticle?.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="text-[26px] md:text-[34px] lg:text-[42px] font-bold text-white mb-3 leading-tight max-w-2xl"
                        >
                          {articleTitle}
                        </motion.h2>
                      </div>
                      
                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <span>{articleAuthor}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{articleDate}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Slide Indicators */}
                {featuredArticles.length > 1 && (
                  <div className="absolute bottom-6 right-6 flex gap-2 z-10">
                    {featuredArticles.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          goToSlide(index);
                        }}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide 
                            ? 'bg-primary w-6' 
                            : 'bg-white/50 w-2 hover:bg-white/70'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </Link>
            )}
          </div>

          {/* Card 2: Live Score Widget (Right - 4 cols) */}
          <div className="lg:col-span-4 bg-card rounded-2xl border border-border flex flex-col min-h-[450px] lg:min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{t('liveScore.title')}</span>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-live/20 rounded text-[10px] font-bold text-live">
                  <span className="w-1.5 h-1.5 bg-live rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
              <a
                href="/fixtures"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                {t('liveScore.viewAll')}
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-[80px_1fr_60px_70px] px-4 py-2 text-[11px] font-medium text-muted-foreground border-b border-border bg-muted/30">
              <span>{t('liveScore.league')}</span>
              <span>{t('liveScore.match')}</span>
              <span className="text-center">{t('liveScore.score')}</span>
              <span className="text-right">{t('liveScore.status')}</span>
            </div>
            
            {/* Match Rows - Scrollable only when overflow */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border">
              {isLoadingScores ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : scoresError ? (
                <div className="flex flex-col items-center justify-center py-6 px-4 text-center gap-2">
                  <p className="text-xs text-destructive font-medium">
                    {language === 'id' ? 'Gagal memuat skor' : 'Failed to load scores'}
                  </p>
                  <p className="text-[10px] text-muted-foreground break-all max-w-full">
                    {scoresError.slice(0, 60)}
                  </p>
                </div>
              ) : displayMatches.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                  {language === 'id' ? 'Tidak ada pertandingan' : 'No matches available'}
                </div>
              ) : (
                displayMatches.map((match) => (
                  <div
                    key={match.id}
                    className="grid grid-cols-[80px_1fr_60px_70px] px-4 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer items-center"
                  >
                    {/* Liga */}
                    <span className="text-[11px] text-muted-foreground truncate pr-2">
                      {match.leagueShort}
                    </span>
                    
                    {/* Pertandingan - Tim stacked */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className={`text-xs truncate ${match.homeScore !== null && match.homeScore > (match.awayScore || 0) ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {match.homeTeam}
                      </span>
                      <span className={`text-xs truncate ${match.awayScore !== null && match.awayScore > (match.homeScore || 0) ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {match.awayTeam}
                      </span>
                    </div>
                    
                    {/* Skor - stacked */}
                    <div className="flex flex-col gap-0.5 text-center">
                      <span className={`text-xs font-bold ${match.homeScore !== null && match.homeScore > (match.awayScore || 0) ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {match.homeScore ?? '-'}
                      </span>
                      <span className={`text-xs font-bold ${match.awayScore !== null && match.awayScore > (match.homeScore || 0) ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {match.awayScore ?? '-'}
                      </span>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center gap-1 justify-end">
                      {match.status === 'live' ? (
                        <>
                          <span className="w-1.5 h-1.5 bg-live rounded-full animate-pulse" />
                          <span className="text-[10px] font-bold text-live">
                            {match.minute}'
                          </span>
                        </>
                      ) : match.status === 'ft' ? (
                        <span className="text-[10px] font-medium text-muted-foreground">FT</span>
                      ) : match.status === 'post' ? (
                        <span className="text-[10px] font-medium text-warning">POST</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">{match.time}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroDashboard;
