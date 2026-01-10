import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { featuredArticle, matches } from '@/data/dummyData';
import { Clock, ChevronRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-stadium.jpg';

const HeroDashboard: React.FC = () => {
  const { language, t } = useLanguage();

  // Get live matches from all leagues
  const liveMatches = matches.filter(m => m.status === 'live').slice(0, 6);
  
  // Fallback to recent finished if no live matches
  const displayMatches = liveMatches.length > 0 
    ? liveMatches 
    : matches.filter(m => m.status === 'ft' || m.status === 'post').slice(0, 5);

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
    <section className="w-full bg-background py-6">
      <div className="container mx-auto px-4">
        {/* Main Container with 2 Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl overflow-hidden border border-border"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[450px]">
            
            {/* Card 1: Featured Article (Left - 8 cols) */}
            <div className="lg:col-span-8 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              
              <div className="relative h-full flex flex-col justify-end p-6">
                {/* Category Badge */}
                <span className="inline-flex items-center gap-1 w-fit px-3 py-1 mb-3 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                  <Play className="w-3 h-3" />
                  {featuredArticle.category}
                </span>
                
                {/* What We Learned Label */}
                <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2">
                  {language === 'id' ? 'APA YANG KITA PELAJARI' : 'WHAT WE LEARNED'}
                </span>
                
                {/* Headline */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight max-w-2xl">
                  {featuredArticle.title[language]}
                </h2>
                
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <span>{featuredArticle.author}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{featuredArticle.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>

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
              
              {/* Match Rows - Scrollable */}
              <div className="flex-1 overflow-y-auto max-h-[320px] divide-y divide-border">
                {displayMatches.map((match) => (
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
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroDashboard;
