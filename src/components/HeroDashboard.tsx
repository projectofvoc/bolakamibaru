import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { featuredArticle, articles, matches } from '@/data/dummyData';
import { Clock, ChevronRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-stadium.jpg';

const HeroDashboard: React.FC = () => {
  const { language, t } = useLanguage();

  // Get Liga 1 matches for the widget
  const liga1Matches = matches.filter(m => m.league === 'Liga 1 Indonesia').slice(0, 4);
  
  // Get news articles for the middle section
  const newsArticles = articles.slice(0, 5);

  const getStatusBadge = (status: string, minute?: number) => {
    switch (status) {
      case 'live':
        return (
          <span className="px-2 py-0.5 text-xs font-bold bg-live text-live-foreground rounded live-pulse">
            {minute}'
          </span>
        );
      case 'ft':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">
            FT
          </span>
        );
      case 'post':
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-warning/20 text-warning rounded">
            POST
          </span>
        );
      default:
        return null;
    }
  };

  const getTeamShortName = (team: string) => {
    const words = team.split(' ');
    if (words.length > 1) {
      return words[0];
    }
    return team;
  };

  return (
    <section className="w-full bg-background py-6 px-4">
      <div className="container mx-auto">
        {/* Main Container with 3 Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl overflow-hidden border border-border"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[450px]">
            
            {/* Card 1: Featured Article (Left - 5 cols) */}
            <div className="lg:col-span-5 relative overflow-hidden">
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
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
                  {featuredArticle.title[language]}
                </h2>
                
                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-white/70">
                  <span>{featuredArticle.author}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{featuredArticle.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: News List (Middle - 4 cols) */}
            <div className="lg:col-span-4 bg-card border-x border-border">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  {language === 'id' ? 'BERITA TERBARU' : 'LATEST NEWS'}
                </h3>
              </div>
              
              <div className="divide-y divide-border">
                {newsArticles.map((article, index) => (
                  <motion.a
                    key={article.id}
                    href="#"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-16 h-12 rounded overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title[language]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title[language]}
                      </h4>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {article.category}
                      </span>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Card 3: Match Widget (Right - 3 cols) */}
            <div className="lg:col-span-3 bg-card">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇮🇩</span>
                  <span className="text-sm font-bold text-foreground">Liga 1</span>
                </div>
                <a
                  href="/fixtures"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {language === 'id' ? 'Lihat semua' : 'View all'}
                  <ChevronRight className="w-3 h-3" />
                </a>
              </div>
              
              {/* Date Header */}
              <div className="px-4 py-2 bg-muted/50">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {language === 'id' ? 'Hari Ini' : 'Today'}
                </span>
              </div>
              
              {/* Matches */}
              <div className="divide-y divide-border">
                {liga1Matches.map((match) => (
                  <div
                    key={match.id}
                    className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    {/* Home Team */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm ${match.homeScore !== undefined && match.homeScore > (match.awayScore || 0) ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {getTeamShortName(match.homeTeam)}
                      </span>
                      <span className={`text-sm font-bold ${match.homeScore !== undefined && match.homeScore > (match.awayScore || 0) ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {match.homeScore ?? '-'}
                      </span>
                    </div>
                    
                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${match.awayScore !== undefined && match.awayScore > (match.homeScore || 0) ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {getTeamShortName(match.awayTeam)}
                      </span>
                      <span className={`text-sm font-bold ${match.awayScore !== undefined && match.awayScore > (match.homeScore || 0) ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {match.awayScore ?? '-'}
                      </span>
                    </div>
                    
                    {/* Status */}
                    <div className="flex justify-end mt-1">
                      {match.status === 'scheduled' ? (
                        <span className="text-xs text-muted-foreground">{match.time}</span>
                      ) : (
                        getStatusBadge(match.status, match.minute)
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
