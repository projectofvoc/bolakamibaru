import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUpcomingFixtures, UpcomingFixture } from '@/hooks/useUpcomingFixtures';

const leagueColorClasses: Record<string, string> = {
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
  green: 'bg-primary',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500'
};

interface TeamLogoProps {
  team: UpcomingFixture['homeTeam'];
  size?: 'sm' | 'md';
}

const TeamLogo: React.FC<TeamLogoProps> = ({ team, size = 'md' }) => {
  // Consistent size: 40px on mobile, 48px on desktop
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
            // Fallback to letter on error
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

const FixtureCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-xl p-4 md:p-5">
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
);

interface FixtureCardProps {
  fixture: UpcomingFixture;
  index: number;
}

const FixtureCard: React.FC<FixtureCardProps> = ({ fixture, index }) => {
  const { language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="bg-card rounded-xl p-3 sm:p-4 md:p-5 hover:bg-card/80 transition-colors cursor-pointer"
    >
      {/* Top Row: League Badge & Time */}
      <div className="flex flex-col gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        <span className={`px-2 py-0.5 text-[10px] md:text-xs font-bold rounded-full text-white w-fit ${leagueColorClasses[fixture.league.color] || 'bg-blue-500'}`}>
          {fixture.league.shortCode || fixture.league.name}
        </span>
        
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs md:text-sm">
          <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
          <span>{fixture.dateLabel[language]}, {fixture.time}</span>
        </div>
      </div>
      
      {/* Teams with Logos - Vertical stack on mobile */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamLogo team={fixture.homeTeam} />
          <span className="text-foreground font-medium text-[10px] sm:text-xs truncate text-center w-full">
            {fixture.homeTeam.shortCode || fixture.homeTeam.name.slice(0, 12)}
          </span>
        </div>
        
        {/* VS */}
        <span className="text-muted-foreground text-xs font-bold shrink-0">VS</span>
        
        {/* Away Team */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamLogo team={fixture.awayTeam} />
          <span className="text-foreground font-medium text-[10px] sm:text-xs truncate text-center w-full">
            {fixture.awayTeam.shortCode || fixture.awayTeam.name.slice(0, 12)}
          </span>
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
  );
};

const UpcomingMatches: React.FC = () => {
  const { t, language } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(8);
  
  const { data: fixtures = [], isLoading, isError } = useUpcomingFixtures();
  
  const visibleFixtures = fixtures.slice(0, visibleCount);
  const hasMore = visibleCount < fixtures.length;

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

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <FixtureCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="text-center py-12 bg-card rounded-xl">
            <p className="text-muted-foreground">
              {language === 'id' 
                ? 'Gagal memuat jadwal pertandingan. Silakan coba lagi nanti.' 
                : 'Failed to load fixtures. Please try again later.'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && fixtures.length === 0 && (
          <div className="text-center py-12 bg-card rounded-xl">
            <p className="text-muted-foreground">
              {language === 'id' 
                ? 'Tidak ada pertandingan dalam 7 hari ke depan.' 
                : 'No matches in the next 7 days.'}
            </p>
          </div>
        )}

        {/* Fixtures Grid */}
        {!isLoading && !isError && fixtures.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {visibleFixtures.map((fixture, index) => (
                <FixtureCard key={fixture.id} fixture={fixture} index={index} />
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
          </>
        )}
      </div>
    </section>
  );
};

export default UpcomingMatches;
