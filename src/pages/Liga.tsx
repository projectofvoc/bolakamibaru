import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight, CheckCircle, Bookmark, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles, upcomingMatches } from '@/data/dummyData';
import { Button } from '@/components/ui/button';

interface LeagueInfo {
  id: string;
  name: { id: string; en: string };
  country: string;
  flag: string;
  color: string;
}

const leaguesData: LeagueInfo[] = [
  { id: 'liga-1', name: { id: 'Liga 1 Indonesia', en: 'Liga 1 Indonesia' }, country: 'Indonesia', flag: '🇮🇩', color: 'bg-green-500' },
  { id: 'premier-league', name: { id: 'Premier League', en: 'Premier League' }, country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: 'bg-purple-500' },
  { id: 'la-liga', name: { id: 'La Liga', en: 'La Liga' }, country: 'Spain', flag: '🇪🇸', color: 'bg-orange-500' },
  { id: 'serie-a', name: { id: 'Serie A', en: 'Serie A' }, country: 'Italy', flag: '🇮🇹', color: 'bg-blue-500' },
  { id: 'bundesliga', name: { id: 'Bundesliga', en: 'Bundesliga' }, country: 'Germany', flag: '🇩🇪', color: 'bg-red-500' },
  { id: 'champions-league', name: { id: 'Liga Champions', en: 'Champions League' }, country: 'Europe', flag: '🏆', color: 'bg-blue-600' },
];

const leagueColorClasses: Record<string, string> = {
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
  green: 'bg-primary',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500'
};

const Liga: React.FC = () => {
  const { league } = useParams<{ league?: string }>();
  const { language, t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(8);

  const currentLeague = league ? leaguesData.find(l => l.id === league) : null;
  
  // Filter articles by league/category
  const filteredArticles = league 
    ? articles.filter(a => {
        const category = a.category.toLowerCase();
        if (league === 'liga-1') return category.includes('liga 1') || category.includes('liga1');
        if (league === 'premier-league') return category.includes('premier') || category.includes('epl');
        if (league === 'la-liga') return category.includes('la liga') || category.includes('laliga');
        if (league === 'serie-a') return category.includes('serie a') || category.includes('seriea');
        if (league === 'bundesliga') return category.includes('bundesliga');
        if (league === 'champions-league') return category.includes('champions') || category.includes('ucl');
        return true;
      })
    : articles;

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  // Filter upcoming matches by league
  const filteredMatches = league 
    ? upcomingMatches.filter(m => {
        const matchLeague = m.league.toLowerCase();
        if (league === 'liga-1') return matchLeague.includes('liga 1');
        if (league === 'premier-league') return matchLeague.includes('epl') || matchLeague.includes('premier');
        if (league === 'la-liga') return matchLeague.includes('la liga');
        if (league === 'serie-a') return matchLeague.includes('serie a');
        if (league === 'bundesliga') return matchLeague.includes('bundesliga');
        if (league === 'champions-league') return matchLeague.includes('champions');
        return true;
      })
    : upcomingMatches;

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
              {currentLeague && <span className="text-2xl">{currentLeague.flag}</span>}
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
          <section className="py-8 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {leaguesData.map((l, idx) => (
                  <Link key={l.id} to={`/liga/${l.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-card rounded-xl p-4 text-center hover:border-primary border border-transparent transition-colors cursor-pointer"
                    >
                      <span className="text-3xl block mb-2">{l.flag}</span>
                      <p className="text-sm font-medium text-foreground">{l.name[language]}</p>
                      <p className="text-xs text-muted-foreground">{l.country}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Sub Navigation for specific league */}
        {league && (
          <section className="py-4 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Link to="/liga">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    {language === 'id' ? 'Semua Liga' : 'All Leagues'}
                  </Button>
                </Link>
                {leaguesData.map(l => (
                  <Link key={l.id} to={`/liga/${l.id}`}>
                    <Button 
                      variant={l.id === league ? 'default' : 'ghost'} 
                      size="sm" 
                      className="rounded-full whitespace-nowrap"
                    >
                      {l.flag} {l.name[language]}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        {filteredMatches.length > 0 && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {language === 'id' ? 'Jadwal Mendatang' : 'Upcoming Fixtures'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'id' ? 'Pertandingan yang akan datang minggu ini' : 'Matches coming up this week'}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredMatches.slice(0, 4).map((match, idx) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card rounded-xl p-4 md:p-5 hover:bg-card/80 transition-colors cursor-pointer"
                  >
                    {/* Top Row: League Badge */}
                    <div className="flex flex-col gap-2 mb-3">
                      <span className={`px-2 py-0.5 text-[10px] md:text-xs font-bold rounded-full text-white w-fit ${leagueColorClasses[match.leagueColor]}`}>
                        {match.league}
                      </span>
                      
                      {/* Time with Clock Icon */}
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs md:text-sm">
                        <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span>{match.dateLabel[language]}, {match.time}</span>
                      </div>
                    </div>
                    
                    {/* Team Names */}
                    <h3 className="text-foreground font-semibold text-sm md:text-base mb-3">
                      {match.homeTeam} vs {match.awayTeam}
                    </h3>
                    
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs md:text-sm">{language === 'id' ? 'Analisa Cepat' : 'Quick Analysis'}</span>
                      <button className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-muted-foreground/30 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* News Articles */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {language === 'id' ? 'Berita Terbaru' : 'Latest News'}
            </h2>

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
                          <img
                            src={article.image}
                            alt={article.title[language]}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 text-xs font-semibold bg-primary/90 text-primary-foreground rounded-full">
                              {article.category}
                            </span>
                          </div>
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

      <Footer />
    </div>
  );
};

export default Liga;
