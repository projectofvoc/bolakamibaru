import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, Calendar, BarChart3, CheckCircle, Bookmark, Clock, ChevronRight, Play } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles, featuredArticle, matches } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-stadium.jpg';

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
    id: 'analisa', 
    name: { id: 'Analisa', en: 'Analysis' }, 
    icon: BarChart3,
    description: { id: 'Artikel analisa mendalam', en: 'In-depth analysis articles' }
  },
];

// Indonesian clubs/keywords for filtering
const indonesianClubs = ['Persebaya', 'Persija', 'Persib', 'Arema', 'Bali United', 'Madura United', 'PSM', 'PSIS', 'Borneo FC'];
const indonesianLeagues = ['Liga 1 Indonesia', 'Liga 1'];
const internationalLeagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga'];

const Berita: React.FC = () => {
  const { filter } = useParams<{ filter?: string }>();
  const { language, t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeRegion, setActiveRegion] = useState<'indonesia' | 'international'>('indonesia');

  const currentFilter = filter ? filterTypes.find(f => f.id === filter) : null;
  
  // All articles (in real app, would filter by type)
  const allArticles = [featuredArticle, ...articles];

  // Filter articles by region
  const isIndonesianArticle = (article: typeof featuredArticle) => {
    const title = article.title.id + ' ' + article.title.en;
    return article.category === 'Liga 1' || 
           indonesianClubs.some(club => title.includes(club));
  };

  const isInternationalArticle = (article: typeof featuredArticle) => {
    return internationalLeagues.some(league => article.category === league) ||
           article.category === 'Transfer' ||
           article.category === 'Premier League' ||
           article.category === 'La Liga' ||
           article.category === 'Serie A';
  };

  const isTrending = filter === 'trending';
  
  // Get filtered articles based on region (only for trending)
  const filteredArticles = isTrending
    ? activeRegion === 'indonesia'
      ? allArticles.filter(isIndonesianArticle)
      : allArticles.filter(isInternationalArticle)
    : allArticles;

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  // Get featured article based on region
  const regionFeatured = isTrending
    ? activeRegion === 'indonesia'
      ? allArticles.find(isIndonesianArticle) || featuredArticle
      : allArticles.find(isInternationalArticle) || featuredArticle
    : featuredArticle;

  // Filter matches by region
  const regionMatches = isTrending
    ? activeRegion === 'indonesia'
      ? matches.filter(m => indonesianLeagues.includes(m.league))
      : matches.filter(m => internationalLeagues.includes(m.league))
    : matches;

  // Get live matches from filtered region
  const liveMatches = regionMatches.filter(m => m.status === 'live').slice(0, 6);
  const displayMatches = liveMatches.length > 0 
    ? liveMatches 
    : regionMatches.filter(m => m.status === 'ft' || m.status === 'post' || m.status === 'scheduled').slice(0, 5);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Different for trending vs other filters */}
        {isTrending ? (
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
                      style={{ backgroundImage: `url(${regionFeatured.image || heroImage})` }}
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
                          {regionFeatured.title[language]}
                        </h2>
                      </div>
                      
                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <span>{regionFeatured.author}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{regionFeatured.timestamp}</span>
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
                    
                    {/* Match Rows */}
                    <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border">
                      {displayMatches.length > 0 ? displayMatches.map((match) => (
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
        <section className="py-4 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4">
              {/* LEFT: Main Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto">
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
                        className="rounded-full whitespace-nowrap gap-2"
                      >
                        <f.icon className="w-4 h-4" />
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
                  className="flex items-center gap-1 bg-muted/30 p-1 rounded-full flex-shrink-0"
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
                    transition={{ delay: index * 0.03 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative rounded-lg overflow-hidden bg-card aspect-[4/3]">
                      <img
                        src={article.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop'}
                        alt={article.title[language]}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 text-xs font-semibold bg-primary/90 text-primary-foreground rounded-full">
                          {article.category}
                        </span>
                      </div>
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
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-muted rounded-full text-xs">
                            {article.publisher.icon}
                          </span>
                          <span className="text-sm text-muted-foreground truncate max-w-[80px]">
                            {article.publisher.name}
                          </span>
                          {article.publisher.verified && (
                            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-primary fill-primary/20" />
                          )}
                          <span className="text-muted-foreground/50 flex-shrink-0">·</span>
                          <span className="text-sm text-muted-foreground truncate">
                            {article.timestamp}
                          </span>
                        </div>
                        <button className="p-1.5 hover:bg-muted rounded-md transition-colors flex-shrink-0">
                          <Bookmark className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              )) : (
                <div className="col-span-full flex items-center justify-center py-16 text-muted-foreground">
                  {language === 'id' ? 'Tidak ada berita untuk ditampilkan' : 'No news to display'}
                </div>
              )}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  className="rounded-full px-8"
                  onClick={() => setVisibleCount(prev => prev + 10)}
                >
                  {language === 'id' ? 'Muat Lebih Banyak' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Featured Stories Section - 3 Column Cards + Text List */}
        {(() => {
          // Get articles for featured stories (with fallback to all articles)
          const featuredStoriesData = filteredArticles.length > 5 
            ? filteredArticles.slice(5) 
            : allArticles.slice(5);
          
          // 3 articles with images for cards
          const featuredStoriesWithImages = featuredStoriesData.slice(0, 3);
          
          // 3 more articles for text-only list
          const textOnlyHeadlines = featuredStoriesData.slice(3, 6);

          if (featuredStoriesWithImages.length === 0) return null;

          return (
            <section className="py-12 bg-background">
              <div className="container mx-auto px-4">
                {/* 3 Column Featured Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredStoriesWithImages.map((article, index) => (
                    <motion.div
                      key={`featured-${article.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={`/news/${article.slug}`} className="block group">
                        {/* Image */}
                        <div className="aspect-video rounded-lg overflow-hidden mb-3">
                          <img 
                            src={article.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop'} 
                            alt={article.title[language]}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Headline */}
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-3">
                          {article.title[language]}
                        </h3>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Text-only Headlines List */}
                {textOnlyHeadlines.length > 0 && (
                  <div className="mt-8 space-y-0">
                    {textOnlyHeadlines.map((article, index) => (
                      <motion.div
                        key={`text-${article.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link 
                          to={`/news/${article.slug}`}
                          className="block border-b border-border py-4 last:border-b-0 group"
                        >
                          <h3 className="text-lg text-muted-foreground group-hover:text-primary transition-colors">
                            {article.title[language]}
                          </h3>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })()}
      </main>

      <Footer />
    </div>
  );
};

export default Berita;
