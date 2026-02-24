import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight, CheckCircle, Bookmark, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FooterBanners from '@/components/FooterBanners';
import SidebarBanners from '@/components/SidebarBanners';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { LazyImage } from '@/components/ui/LazyImage';
import { useUpcomingFixtures, UpcomingFixture } from '@/hooks/useUpcomingFixtures';

// Import SVG logos
import liga1Logo from '@/assets/leagues/liga-1.svg';
import liga2Logo from '@/assets/leagues/liga-2.svg';
import premierLeagueLogo from '@/assets/leagues/premier-league.svg';
import laLigaLogo from '@/assets/leagues/la-liga.svg';
import serieALogo from '@/assets/leagues/serie-a.svg';
import bundesligaLogo from '@/assets/leagues/bundesliga.svg';
import championsLeagueLogo from '@/assets/leagues/champions-league.svg';

interface LeagueInfo {
  id: string;
  name: { id: string; en: string };
  country: string;
  logo: string;
}

const leaguesData: LeagueInfo[] = [
  { id: 'liga-1', name: { id: 'Liga 1 Indonesia', en: 'Liga 1 Indonesia' }, country: 'Indonesia', logo: liga1Logo },
  { id: 'liga-2', name: { id: 'Liga 2 Indonesia', en: 'Liga 2 Indonesia' }, country: 'Indonesia', logo: liga2Logo },
  { id: 'premier-league', name: { id: 'Premier League', en: 'Premier League' }, country: 'England', logo: premierLeagueLogo },
  { id: 'la-liga', name: { id: 'La Liga', en: 'La Liga' }, country: 'Spain', logo: laLigaLogo },
  { id: 'serie-a', name: { id: 'Serie A', en: 'Serie A' }, country: 'Italy', logo: serieALogo },
  { id: 'bundesliga', name: { id: 'Bundesliga', en: 'Bundesliga' }, country: 'Germany', logo: bundesligaLogo },
  { id: 'champions-league', name: { id: 'Liga Champions', en: 'Champions League' }, country: 'Europe', logo: championsLeagueLogo },
];

const leagueColorClasses: Record<string, string> = {
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
  green: 'bg-primary',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500'
};

// Team Logo component for Liga page
interface TeamLogoProps {
  team: UpcomingFixture['homeTeam'];
  size?: 'sm' | 'md';
}

const TeamLogo: React.FC<TeamLogoProps> = ({ team, size = 'md' }) => {
  // Consistent size: 40px for all
  const sizeClasses = size === 'sm' ? 'w-10 h-10' : 'w-10 h-10 sm:w-12 sm:h-12';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  if (team.logo) {
    return (
      <div className={`${sizeClasses} flex items-center justify-center shrink-0`}>
        <img 
          src={team.logo} 
          alt={team.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className={`${textSize} font-bold text-muted-foreground hidden`}>
          {team.name.charAt(0)}
        </span>
      </div>
    );
  }

  // Fallback: show initial letter with circle background only when no logo
  return (
    <div className={`${sizeClasses} rounded-full bg-muted/50 flex items-center justify-center shrink-0`}>
      <span className={`${textSize} font-bold text-muted-foreground`}>
        {team.name.charAt(0)}
      </span>
    </div>
  );
};

const Liga: React.FC = () => {
  const { league } = useParams<{ league?: string }>();
  const { language, t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(8);

  const currentLeague = league ? leaguesData.find(l => l.id === league) : null;

  // Fetch articles from Supabase
  const { data: articles = [] } = useQuery({
    queryKey: ['liga-articles', league],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      
      if (league) {
        query = query.ilike('league', `%${league.replace('-', ' ')}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  // Fetch upcoming fixtures from Sportmonks API
  const { data: fixtures = [], isLoading: isLoadingFixtures } = useUpcomingFixtures(league);

  // Render league logo
  const renderLeagueLogo = (l: LeagueInfo, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-10 h-10',
      lg: 'w-8 h-8',
    };

    return (
      <img 
        src={l.logo} 
        alt={l.name[language]} 
        className={`${sizeClasses[size]} object-contain`}
      />
    );
  };

  const pageTitle = currentLeague 
    ? `${currentLeague.name[language]} - BOLAKAMI` 
    : (language === 'id' ? 'Semua Liga - BOLAKAMI' : 'All Leagues - BOLAKAMI');
  const pageDesc = currentLeague
    ? (language === 'id' ? `Berita, jadwal, dan update terbaru ${currentLeague.name[language]}` : `Latest news, fixtures, and updates for ${currentLeague.name[language]}`)
    : (language === 'id' ? 'Berita dan update terbaru dari semua liga sepak bola' : 'Latest news and updates from all football leagues');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content="https://bolakamibaru.lovable.app/og-bolakami.png" />
        <meta property="og:url" content={`https://bolakamibaru.lovable.app/liga${league ? `/${league}` : ''}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <link rel="canonical" href={`https://bolakamibaru.lovable.app/liga${league ? `/${league}` : ''}`} />
      </Helmet>
      <SidebarBanners />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/20 via-background to-background py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <Trophy className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {currentLeague 
                  ? currentLeague.name[language] 
                  : (language === 'id' ? 'Semua Liga' : 'All Leagues')}
              </h1>
              {currentLeague && renderLeagueLogo(currentLeague, 'lg')}
            </motion.div>
            <p className="text-muted-foreground">
              {language === 'id' 
                ? 'Berita dan update terbaru dari liga favorit kamu' 
                : 'Latest news and updates from your favorite leagues'}
            </p>
          </div>
        </section>

        {/* League Selector (shown on all leagues page) */}
        {!league && (
          <section className="py-6 sm:py-8 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
                {leaguesData.map((l, idx) => (
                  <Link key={l.id} to={`/liga/${l.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-card rounded-xl p-3 sm:p-5 text-center hover:border-primary border border-transparent transition-all hover:shadow-lg cursor-pointer group"
                    >
                      <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-transform group-hover:scale-110">
                        {renderLeagueLogo(l, 'md')}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1">{l.name[language]}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{l.country}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Sub Navigation for specific league */}
        {league && (
          <section className="py-3 sm:py-4 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
                <Link to="/liga">
                  <Button variant="ghost" size="sm" className="rounded-full text-xs sm:text-sm">
                    {language === 'id' ? 'Semua Liga' : 'All Leagues'}
                  </Button>
                </Link>
                {leaguesData.map(l => (
                  <Link key={l.id} to={`/liga/${l.id}`}>
                    <Button 
                      variant={l.id === league ? 'default' : 'ghost'} 
                      size="sm" 
                      className="rounded-full whitespace-nowrap gap-1.5 sm:gap-2 text-xs sm:text-sm"
                    >
                      {renderLeagueLogo(l, 'sm')}
                      <span className="hidden sm:inline">{l.name[language]}</span>
                      <span className="sm:hidden">{l.id === 'champions-league' ? 'UCL' : l.name[language].split(' ')[0]}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {language === 'id' ? 'Jadwal Mendatang' : 'Upcoming Fixtures'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {currentLeague 
                  ? (language === 'id' 
                      ? `Pertandingan ${currentLeague.name[language]} yang akan datang` 
                      : `Upcoming ${currentLeague.name[language]} fixtures`)
                  : (language === 'id' 
                      ? 'Pertandingan yang akan datang minggu ini' 
                      : 'Matches coming up this week')}
              </p>
            </div>
            
            {/* Loading State */}
            {isLoadingFixtures && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-2 mb-4">
                      <Skeleton className="w-16 h-5 rounded-full" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="w-16 h-4" />
                      </div>
                      <Skeleton className="w-6 h-4" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-16 h-4" />
                        <Skeleton className="w-10 h-10 rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="w-20 h-4" />
                      <Skeleton className="w-7 h-7 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fixtures Grid */}
            {!isLoadingFixtures && fixtures.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fixtures.slice(0, 4).map((fixture, idx) => (
                  <motion.div
                    key={fixture.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card rounded-xl p-4 md:p-5 hover:bg-card/80 transition-colors cursor-pointer"
                  >
                    {/* Top Row: League Badge & Time */}
                    <div className="flex flex-col gap-2 mb-4">
                      <span className={`px-2 py-0.5 text-[10px] md:text-xs font-bold rounded-full text-white w-fit ${leagueColorClasses[fixture.league.color] || 'bg-blue-500'}`}>
                        {fixture.league.shortCode || fixture.league.name}
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs md:text-sm">
                        <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span>{fixture.dateLabel[language]}, {fixture.time}</span>
                      </div>
                    </div>
                    
                    {/* Teams with Logos */}
                    <div className="flex items-center justify-between mb-4">
                      {/* Home Team */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TeamLogo team={fixture.homeTeam} />
                        <span className="text-foreground font-medium text-xs md:text-sm truncate">
                          {fixture.homeTeam.shortCode || fixture.homeTeam.name}
                        </span>
                      </div>
                      
                      {/* VS */}
                      <span className="text-muted-foreground text-xs font-bold px-2">VS</span>
                      
                      {/* Away Team */}
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-foreground font-medium text-xs md:text-sm truncate text-right">
                          {fixture.awayTeam.shortCode || fixture.awayTeam.name}
                        </span>
                        <TeamLogo team={fixture.awayTeam} />
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs md:text-sm">
                        {language === 'id' ? 'Analisa Cepat' : 'Quick Analysis'}
                      </span>
                      <button className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-muted-foreground/30 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoadingFixtures && fixtures.length === 0 && (
              <div className="text-center py-12 bg-card rounded-xl">
                <p className="text-muted-foreground">
                  {language === 'id' 
                    ? 'Tidak ada pertandingan dalam 7 hari ke depan.' 
                    : 'No matches in the next 7 days.'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* News Articles */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {language === 'id' ? 'Berita Terbaru' : 'Latest News'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {currentLeague 
                  ? (language === 'id' 
                      ? `Update terkini seputar ${currentLeague.name[language]}` 
                      : `Latest updates about ${currentLeague.name[language]}`)
                  : (language === 'id' 
                      ? 'Berita dan update terbaru dari semua liga' 
                      : 'News and updates from all leagues')}
              </p>
            </div>

            {visibleArticles.length > 0 ? (
              <>
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
                          <LazyImage
                            src={article.featured_image || '/placeholder.svg'}
                            alt={language === 'id' ? article.title_id : article.title_en}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            fallback="/placeholder.svg"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 text-xs font-semibold bg-primary/90 text-primary-foreground rounded-full">
                              {article.category}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {language === 'id' ? article.title_id : article.title_en}
                          </h3>
                          
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-muted rounded-full text-xs">
                                {article.publisher_icon || '📰'}
                              </span>
                              <span className="text-sm text-muted-foreground truncate max-w-[80px]">
                                {article.publisher_name || 'Bolakami'}
                              </span>
                              {article.publisher_verified && (
                                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-primary fill-primary/20" />
                              )}
                            </div>
                            <button className="p-1.5 hover:bg-muted rounded-md transition-colors flex-shrink-0">
                              <Bookmark className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    </Link>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button 
                      variant="outline" 
                      className="rounded-full px-8"
                      onClick={() => setVisibleCount(prev => prev + 8)}
                    >
                      {language === 'id' ? 'Muat Lebih Banyak' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-card rounded-xl">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === 'id' 
                    ? 'Belum ada berita untuk liga ini' 
                    : 'No news available for this league yet'}
                </p>
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

export default Liga;
