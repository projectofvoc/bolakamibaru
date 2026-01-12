import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { upcomingMatches } from '@/data/matchData';
import { Button } from '@/components/ui/button';

const leagueColorClasses: Record<string, string> = {
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
  green: 'bg-primary',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500'
};

const UpcomingMatches: React.FC = () => {
  const { t, language } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(8);
  
  const visibleMatches = upcomingMatches.slice(0, visibleCount);
  const hasMore = visibleCount < upcomingMatches.length;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {t('section.upcomingMatches')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('section.upcomingMatchesSubtitle')}
          </p>
        </div>

        {/* Grid Layout: 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {visibleMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
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

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button 
              variant="outline" 
              className="rounded-full px-8"
              onClick={() => setVisibleCount(prev => prev + 8)}
            >
              {t('button.loadMore')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingMatches;
