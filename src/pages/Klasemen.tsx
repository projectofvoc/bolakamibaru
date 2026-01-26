import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStandings, availableLeagues } from '@/hooks/useStandings';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Klasemen: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedLeague, setSelectedLeague] = useState('premier-league');
  
  const { data, isLoading, error } = useStandings(selectedLeague);

  const getLeagueName = (slug: string) => {
    const league = availableLeagues.find(l => l.slug === slug);
    return language === 'id' ? league?.nameId : league?.nameEn;
  };

  // Determine zone colors based on league
  const getZoneColor = (position: number, totalTeams: number) => {
    // Champions League zone (top 4 for major leagues)
    if (position <= 4) {
      return 'border-l-4 border-l-emerald-500';
    }
    // Europa League zone (5-6)
    if (position <= 6) {
      return 'border-l-4 border-l-blue-500';
    }
    // Conference League (7)
    if (position === 7) {
      return 'border-l-4 border-l-sky-400';
    }
    // Relegation zone (bottom 3)
    if (position > totalTeams - 3) {
      return 'border-l-4 border-l-red-500';
    }
    return 'border-l-4 border-l-transparent';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight">
                    {language === 'id' ? 'Klasemen' : 'Standings'}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {getLeagueName(selectedLeague)} {data?.seasonLabel || '2025/26'}
                  </p>
                </div>
              </div>

              {/* League Selector */}
              <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                <SelectTrigger className="w-full md:w-[280px] bg-card border-border">
                  <SelectValue placeholder={language === 'id' ? 'Pilih Liga' : 'Select League'} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {availableLeagues.map((league) => (
                    <SelectItem 
                      key={league.slug} 
                      value={league.slug}
                      className="cursor-pointer"
                    >
                      {language === 'id' ? league.nameId : league.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Standings Table */}
        <section className="py-6 md:py-8">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Zone Legend */}
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span className="text-muted-foreground">Champions League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-blue-500" />
                  <span className="text-muted-foreground">Europa League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-sky-400" />
                  <span className="text-muted-foreground">Conference League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-red-500" />
                  <span className="text-muted-foreground">{language === 'id' ? 'Degradasi' : 'Relegation'}</span>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'id' 
                      ? 'Gagal memuat data klasemen. Silakan coba lagi.' 
                      : 'Failed to load standings. Please try again.'}
                  </p>
                </div>
              )}

              {/* Standings Table */}
              {!isLoading && !error && data?.standings && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-12 text-center font-semibold text-xs uppercase">
                          {language === 'id' ? 'Pos' : 'Pos'}
                        </TableHead>
                        <TableHead className="font-semibold text-xs uppercase min-w-[180px]">
                          {language === 'id' ? 'Tim' : 'Team'}
                        </TableHead>
                        <TableHead className="w-12 text-center font-semibold text-xs uppercase">
                          {language === 'id' ? 'Main' : 'P'}
                        </TableHead>
                        <TableHead className="w-12 text-center font-semibold text-xs uppercase">
                          {language === 'id' ? 'M' : 'W'}
                        </TableHead>
                        <TableHead className="w-12 text-center font-semibold text-xs uppercase">
                          {language === 'id' ? 'S' : 'D'}
                        </TableHead>
                        <TableHead className="w-12 text-center font-semibold text-xs uppercase">
                          {language === 'id' ? 'K' : 'L'}
                        </TableHead>
                        <TableHead className="w-16 text-center font-semibold text-xs uppercase hidden sm:table-cell">
                          {language === 'id' ? 'GM' : 'GF'}
                        </TableHead>
                        <TableHead className="w-16 text-center font-semibold text-xs uppercase hidden sm:table-cell">
                          {language === 'id' ? 'GK' : 'GA'}
                        </TableHead>
                        <TableHead className="w-12 text-center font-semibold text-xs uppercase">
                          {language === 'id' ? '+/-' : 'GD'}
                        </TableHead>
                        <TableHead className="w-14 text-center font-bold text-xs uppercase">
                          {language === 'id' ? 'Poin' : 'Pts'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.standings.map((team) => (
                        <TableRow 
                          key={team.teamId}
                          className={cn(
                            "transition-colors hover:bg-muted/30",
                            getZoneColor(team.position, data.totalTeams)
                          )}
                        >
                          <TableCell className="text-center font-medium text-sm">
                            {team.position}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {team.teamLogo ? (
                                <img 
                                  src={team.teamLogo} 
                                  alt={team.teamName}
                                  className="w-7 h-7 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center">
                                  <Trophy className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium text-sm truncate max-w-[140px] sm:max-w-none">
                                {team.teamName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {team.played}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {team.won}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {team.drawn}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {team.lost}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground hidden sm:table-cell">
                            {team.goalsFor}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground hidden sm:table-cell">
                            {team.goalsAgainst}
                          </TableCell>
                          <TableCell className={cn(
                            "text-center text-sm font-medium",
                            team.goalDifference > 0 ? "text-emerald-500" : 
                            team.goalDifference < 0 ? "text-red-500" : "text-muted-foreground"
                          )}>
                            {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm">
                            {team.points}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && (!data?.standings || data.standings.length === 0) && (
                <div className="p-8 text-center">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'id' 
                      ? 'Belum ada data klasemen untuk liga ini.' 
                      : 'No standings data available for this league.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Klasemen;
