import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { upcomingMatches } from '@/data/dummyData';
import { Button } from '@/components/ui/button';

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
              className="bg-card rounded-xl p-4"
            >
              <span className="text-xs text-muted-foreground">
                {match.dateLabel[language]}, {match.time}
              </span>
              <p className="text-sm font-semibold text-foreground mt-2">
                {match.homeTeam} vs {match.awayTeam}
              </p>
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
