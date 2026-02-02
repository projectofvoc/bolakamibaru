import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, Calendar, Target, CheckCircle, Bookmark, Clock, ChevronRight, Play } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FooterBanners from '@/components/FooterBanners';
import SidebarBanners from '@/components/SidebarBanners';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-stadium.jpg';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { LazyImage } from '@/components/ui/LazyImage';
import { useLiveScores } from '@/hooks/useLiveScores';

interface FilterInfo {
  id: string;
  name: { id: string; en: string };
  icon: React.ElementType;
  description: { id: string; en: string };
}

const filterTypes: FilterInfo[] = [
  { 
    id: 'trending', 
    name: { id: 'Trending', en: 'Trending' }, 
    icon: TrendingUp,
    description: { id: 'Berita paling populer dan viral', en: 'Most popular and viral news' }
  },
  { 
    id: 'daily', 
    name: { id: 'Update Harian', en: 'Daily Updates' }, 
    icon: Calendar,
    description: { id: 'Berita terbaru hari ini', en: 'Today\'s latest news' }
  },
  { 
    id: 'prediksi', 
    name: { id: 'Prediksi', en: 'Predictions' }, 
    icon: Target,
    description: { id: 'Prediksi skor dan analisa pertandingan', en: 'Match predictions and analysis' }
  },
];

// Indonesian clubs/keywords for filtering
const indonesianClubs = ['Persebaya', 'Persija', 'Persib', 'Arema', 'Bali United', 'Madura United', 'PSM', 'PSIS', 'Borneo FC', 'Timnas', 'Indonesia'];
const indonesianLeagues = ['Liga 1 Indonesia', 'Liga 1'];
const internationalLeagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'];

const Berita: React.FC = () => {
  const { filter } = useParams<{ filter?: string }>();
  const { language, t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeRegion, setActiveRegion] = useState<'indonesia' | 'international'>('indonesia');

  const currentFilter = filter ? filterTypes.find(f => f.id === filter) : null;
  
  // Fetch articles from database
  const { data: allArticles, isLoading } = useQuery({
    queryKey: ['berita-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });

  // Use live scores hook
  const { matches: liveMatchesData } = useLiveScores();

  // Filter articles by region
  const isIndonesianArticle = (article: any) => {
    const title = article.title_id + ' ' + article.title_en;
    const clubMatch = article.club && indonesianClubs.some(club => article.club?.includes(club));
    return article.category === 'Liga 1' || 
           indonesianClubs.some(club => title.includes(club)) ||
           clubMatch;
  };

  const isInternationalArticle = (article: any) => {
    const title = article.title_id + ' ' + article.title_en;
    const isIndonesian = indonesianClubs.some(club => title.includes(club)) || 
                         article.club && indonesianClubs.some(club => article.club?.includes(club));
    return !isIndonesian && (
           internationalLeagues.some(league => article.category === league) ||
           article.category === 'Transfer' ||
           article.category === 'Bundesliga');
  };

  const isTrending = filter === 'trending';
  
  // Get filtered articles based on region (only for trending)
  const filteredArticles = isTrending
    ? activeRegion === 'indonesia'
      ? (allArticles || []).filter(isIndonesianArticle)
      : (allArticles || []).filter(isInternationalArticle)
    : allArticles || [];

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  // Get featured article based on region
  const regionFeatured = isTrending
    ? activeRegion === 'indonesia'
      ? (allArticles || []).find(isIndonesianArticle) || (allArticles || [])[0]
      : (allArticles || []).find(isInternationalArticle) || (allArticles || [])[0]
    : (allArticles || [])[0];

  // Get live matches
  const liveMatches = (liveMatchesData || []).filter((m: any) => m.status === 'live').slice(0, 6);
  const displayMatches = liveMatches.length > 0 
    ? liveMatches 
    : (liveMatchesData || []).filter((m: any) => m.status === 'ft' || m.status === 'post' || m.status === 'scheduled').slice(0, 5);

  const getLeagueShortName = (league: string) => {
    const mapping: Record<string, string> = {
      'Liga 1 Indonesia': 'Liga 1',
      'Premier League': 'EPL',
      'La Liga': 'La Liga',
      'Serie A': 'Serie A',
      'Bundesliga': 'Bund.',
    };
    return mapping[league] || league;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/3] rounded-lg" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SidebarBanners />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Different for trending vs other filters */}
        {isTrending && regionFeatured ? (
          /* Trending: Hero Dashboard Style */
          <section className="w-full bg-background py-6">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-card rounded-2xl overflow-hidden border border-border"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[450px]">
                  
                  {/* Card 1: Featured Article (Left - 8 cols) */}
                  <Link to={`/news/${regionFeatured.slug}`} className="lg:col-span-8 relative overflow-hidden block">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${regionFeatured.featured_image || heroImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    
                    <div className="relative h-full flex flex-col p-6 min-h-[350px] lg:min-h-0">
                      {/* Category Badge - Top Left */}
                      <span className="inline-flex items-center gap-1 w-fit px-3 py-1 mb-auto text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                        <Play className="w-3 h-3" />
                        {regionFeatured.category}
                      </span>
                      
                      {/* Content at bottom */}
                      <div className="mt-auto">
                        {/* Popular News Label */}
                        <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2 block">
                          {language === 'id' ? 'BERITA POPULER' : 'POPULAR NEWS'}
                        </span>
                        
                        {/* Headline */}
                        <h2 className="text-[26px] md:text-[34px] lg:text-[42px] font-bold text-white mb-3 leading-tight max-w-2xl">
                          {language === 'id' ? regionFeatured.title_id : regionFeatured.title_en}
                        </h2>
                      </div>
                      
                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <span>{regionFeatured.author_name || 'Bolakami'}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {regionFeatured.published_at 
                              ? new Date(regionFeatured.published_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Card 2: Live Score Widget (Right - 4 cols) */}
                  <div className="lg:col-span-4 bg-card flex flex-col">
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
                        href="https://bolakamitv.up.railway.app/"
                        target="_blank"
                        rel="noopener noreferrer"
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
                    
                    {/* Match Rows */}
                    <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border">
                      {displayMatches.length > 0 ? displayMatches.map((match: any) => (
                        <div
                          key={match.id}
                          className="grid grid-cols-[80px_1fr_60px_70px] px-4 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer items-center"
                        >
                          {/* Liga */}
                          <span className="text-[11px] text-muted-foreground truncate pr-2">
                            {getLeagueShortName(match.league)}
                          </span>
                          
                          {/* Pertandingan - Tim stacked */}
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className={`text-xs truncate ${match.homeScore !== undefined && match.homeScore > (match.awayScore || 0) ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                              {match.homeTeam}
                            </span>
                            <span className={`text-xs truncate ${match.awayScore !== undefined && match.awayScore > (match.homeScore || 0) ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                              {match.awayTeam}
                            </span>
                          </div>
                          
                          {/* Skor - stacked */}
                          <div className="flex flex-col gap-0.5 text-center">
                            <span className={`text-xs font-bold ${match.homeScore !== undefined && match.homeScore > (match.awayScore || 0) ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {match.homeScore ?? '-'}
                            </span>
                            <span className={`text-xs font-bold ${match.awayScore !== undefined && match.awayScore > (match.homeScore || 0) ? 'text-foreground' : 'text-muted-foreground'}`}>
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
                      )) : (
                        <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                          {language === 'id' ? 'Tidak ada pertandingan' : 'No matches available'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        ) : (
          /* Other Filters: Default Hero */
          <section className="bg-gradient-to-br from-primary/20 via-background to-background py-12">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                {currentFilter ? (
                  <currentFilter.icon className="w-8 h-8 text-primary" />
                ) : (
                  <Newspaper className="w-8 h-8 text-primary" />
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {currentFilter 
                    ? currentFilter.name[language] 
                    : (language === 'id' ? 'Berita' : 'News')}
                </h1>
              </motion.div>
              <p className="text-muted-foreground">
                {currentFilter 
                  ? currentFilter.description[language]
                  : (language === 'id' 
                      ? 'Semua berita dan artikel sepak bola terkini' 
                      : 'All the latest football news and articles')}
              </p>
            </div>
          </section>
        )}

        {/* Filter Navigation */}
        <section className="py-3 sm:py-4 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* LEFT: Main Filter Tabs */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
                {filterTypes.map((f, idx) => (
                  <Link key={f.id} to={`/berita/${f.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Button 
                        variant={f.id === filter ? 'default' : 'ghost'} 
                        size="sm" 
                        className="rounded-full whitespace-nowrap gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-4"
                      >
                        <f.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {f.name[language]}
                      </Button>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* RIGHT: Sub-Tabs for Trending (Indonesia vs International) */}
              {isTrending && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="hidden sm:flex items-center gap-1 bg-muted/30 p-1 rounded-full flex-shrink-0"
                >
                  <button
                    onClick={() => {
                      setActiveRegion('indonesia');
                      setVisibleCount(10);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      activeRegion === 'indonesia'
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    🇮🇩 Indonesia
                  </button>
                  <button
                    onClick={() => {
                      setActiveRegion('international');
                      setVisibleCount(10);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      activeRegion === 'international'
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    🌍 International
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* News Articles Grid */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {isTrending 
                ? activeRegion === 'indonesia'
                  ? (language === 'id' ? 'Trending Indonesia' : 'Trending Indonesia')
                  : (language === 'id' ? 'Trending International' : 'Trending International')
                : currentFilter 
                  ? currentFilter.name[language]
                  : (language === 'id' ? 'Semua Berita' : 'All News')}
            </h2>

            {/* 5-column grid for trending, 4 for others */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isTrending ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-6`}>
              {visibleArticles.length > 0 ? visibleArticles.map((article, index) => (
                <Link key={article.id} to={`/news/${article.slug}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative rounded-lg overflow-hidden bg-card aspect-[4/3]">
                      <LazyImage
                        src={article.featured_image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop'}
                        alt={language === 'id' ? article.title_id : article.title_en}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        fallback="/placeholder.svg"
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
                        {language === 'id' ? article.title_id : article.title_en}
                      </h3>
                      
                      {/* Publisher Metadata Footer */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {/* Publisher Icon */}
                          <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-muted rounded-full text-xs">
                            {article.publisher_icon || '📰'}
                          </span>
                          
                          {/* Publisher Name */}
                          <span className="text-sm text-muted-foreground truncate max-w-[80px]">
                            {article.publisher_name || 'Bolakami'}
                          </span>
                          
                          {/* Verified Badge */}
                          {article.publisher_verified && (
                            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-primary fill-primary/20" />
                          )}
                          
                          {/* Separator */}
                          <span className="text-muted-foreground/50 flex-shrink-0">·</span>
                          
                          {/* Timestamp */}
                          <span className="text-sm text-muted-foreground truncate">
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
              )) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  {language === 'id' ? 'Tidak ada berita tersedia' : 'No news available'}
                </div>
              )}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-10 text-center">
                <Button
                  variant="outline"
                  className="rounded-full px-8"
                  onClick={() => setVisibleCount(prev => prev + 10)}
                >
                  {t('section.seeMore')}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <FooterBanners />
      <Footer />
    </div>
  );
};

export default Berita;
