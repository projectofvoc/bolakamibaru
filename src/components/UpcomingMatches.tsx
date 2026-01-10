import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { upcomingMatches } from '@/data/dummyData';

const leagueColorClasses: Record<string, string> = {
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
  green: 'bg-primary',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500'
};

const UpcomingMatches: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
          {t('section.upcomingMatches')}
        </h2>

        {/* Horizontal Scroll Container */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {upcomingMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="min-w-[280px] md:min-w-[320px] bg-card rounded-xl p-5 flex-shrink-0 hover:bg-card/80 transition-colors cursor-pointer"
            >
              {/* Top Row: League Badge + Time */}
              <div className="flex items-center justify-between mb-4">
                {/* League Badge */}
                <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${leagueColorClasses[match.leagueColor]}`}>
                  {match.league}
                </span>
                
                {/* Time with Clock Icon */}
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{match.dateLabel[language]}, {match.time}</span>
                </div>
              </div>
              
              {/* Team Names */}
              <h3 className="text-foreground font-semibold text-base mb-4">
                {match.homeTeam} vs {match.awayTeam}
              </h3>
              
              {/* Action Button */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">{t('match.quickAnalysis')}</span>
                <button className="w-8 h-8 rounded-full border border-muted-foreground/30 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingMatches;
