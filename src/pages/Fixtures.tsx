import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MatchCard from '@/components/MatchCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { matches, leagues } from '@/data/dummyData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'live' | 'finished' | 'scheduled';

const Fixtures: React.FC = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('fixtures.allUpdates') },
    { key: 'live', label: t('fixtures.live') },
    { key: 'finished', label: t('fixtures.finished') },
    { key: 'scheduled', label: t('fixtures.scheduled') },
  ];

  const filteredMatches = matches.filter(match => {
    if (selectedLeague && match.league !== selectedLeague) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return match.status === 'live';
    if (activeFilter === 'finished') return match.status === 'ft' || match.status === 'post';
    if (activeFilter === 'scheduled') return match.status === 'scheduled';
    return true;
  });

  const groupedMatches = filteredMatches.reduce((acc, match) => {
    if (!acc[match.league]) {
      acc[match.league] = [];
    }
    acc[match.league].push(match);
    return acc;
  }, {} as Record<string, typeof matches>);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return `${day}/${month} ${days[date.getDay()]}`;
  };

  const getLeagueFlag = (league: string) => {
    const found = leagues.find(l => l.name === league);
    return found?.icon || '⚽';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - League List */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-4">{t('footer.leagues')}</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => setSelectedLeague(null)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    selectedLeague === null
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <span>🌍</span>
                  <span>All Leagues</span>
                </button>
                {leagues.map(league => (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeague(league.name)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      selectedLeague === league.name
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <span>{league.icon}</span>
                    <span className="truncate">{league.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    activeFilter === filter.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-center gap-4 mb-8 p-4 bg-card rounded-xl border border-border">
              <button
                onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() - 1)))}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-semibold text-foreground min-w-[120px] text-center">
                {formatDate(currentDate)}
              </span>
              <button
                onClick={() => setCurrentDate(d => new Date(d.setDate(d.getDate() + 1)))}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Matches by League */}
            <div className="space-y-8">
              {Object.entries(groupedMatches).map(([league, leagueMatches]) => (
                <motion.div
                  key={league}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* League Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                    <span className="text-2xl">{getLeagueFlag(league)}</span>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {leagueMatches[0].leagueCountry}
                      </span>
                      <h3 className="font-semibold text-foreground">{league}</h3>
                    </div>
                  </div>

                  {/* Match List */}
                  <div className="space-y-2">
                    {leagueMatches.map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </motion.div>
              ))}

              {Object.keys(groupedMatches).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No matches found for the selected filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Fixtures;
