import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Loader2, RefreshCw, Clock, ChevronRight, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLiveScoresIndonesia, UpcomingMatchIndo } from '@/hooks/useLiveScoresIndonesia';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Team Logo component for Jadwal section
interface TeamLogoProps {
  logo: string | null;
  name: string;
  size?: 'sm' | 'md';
}

const TeamLogo: React.FC<TeamLogoProps> = ({ logo, name, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  if (logo) {
    return (
      <div className={`${sizeClasses} rounded-full bg-muted/50 flex items-center justify-center overflow-hidden`}>
        <img 
          src={logo} 
          alt={name}
          className="w-full h-full object-contain p-1"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className={`${textSize} font-bold text-muted-foreground hidden`}>
          {name.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} rounded-full bg-muted/50 flex items-center justify-center`}>
      <span className={`${textSize} font-bold text-muted-foreground`}>
        {name.charAt(0)}
      </span>
    </div>
  );
};

// Skeleton for fixture cards
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
  </div>
);

// Jadwal card with logos
interface JadwalCardProps {
  match: UpcomingMatchIndo;
  index: number;
}

const JadwalCard: React.FC<JadwalCardProps> = ({ match, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="bg-card rounded-xl p-4 md:p-5 hover:bg-card/80 transition-colors cursor-pointer"
    >
      {/* Top Row: League Badge & Time */}
      <div className="flex flex-col gap-2 mb-4">
        <span className="px-2 py-0.5 text-[10px] md:text-xs font-bold rounded-full text-white w-fit bg-red-600">
          Liga 1
        </span>
        
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs md:text-sm">
          <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
          <span>{match.date}, {match.time} WIB</span>
        </div>
      </div>
      
      {/* Teams with Logos */}
      <div className="flex items-center justify-between mb-4">
        {/* Home Team */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} />
          <span className="text-foreground font-medium text-xs md:text-sm truncate">
            {match.homeTeam.name}
          </span>
        </div>
        
        {/* VS */}
        <span className="text-muted-foreground text-xs font-bold px-2">VS</span>
        
        {/* Away Team */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-foreground font-medium text-xs md:text-sm truncate text-right">
            {match.awayTeam.name}
          </span>
          <TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} />
        </div>
      </div>
      
      {/* Action Button */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs md:text-sm">Analisa Cepat</span>
        <button className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-muted-foreground/30 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const LiveIndonesia: React.FC = () => {
  const { language } = useLanguage();
  const { liveMatches, upcomingMatches, recentMatches, isLoading, error, refetch } = useLiveScoresIndonesia();
  const [visibleUpcoming, setVisibleUpcoming] = useState(8);

  const hasMoreUpcoming = visibleUpcoming < upcomingMatches.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-600/20 via-background to-background py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="relative">
                <Radio className="w-8 h-8 text-red-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Livescore Liga 1 Indonesia
              </h1>
            </motion.div>
            <p className="text-muted-foreground">
              Pantau skor pertandingan Liga 1 Indonesia secara real-time
            </p>
          </div>
        </section>

        {/* Live Matches Section - NO LOGOS */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <h2 className="text-xl font-bold text-foreground">
                  Sedang Berlangsung
                </h2>
              </div>
              <button 
                onClick={refetch}
                disabled={isLoading}
                className="flex items-center gap-1 text-sm text-red-600 hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-16 bg-card rounded-xl">
                <Loader2 className="w-8 h-8 mx-auto text-red-600 animate-spin mb-4" />
                <p className="text-muted-foreground">Memuat data...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-card rounded-xl border border-destructive/30">
                <p className="text-destructive font-medium mb-2">Gagal memuat data</p>
                <p className="text-xs text-muted-foreground mb-4">{error.slice(0, 100)}</p>
                <button 
                  onClick={refetch}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                >
                  Coba Lagi
                </button>
              </div>
            ) : liveMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-xl p-6 border border-red-600/30"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-muted-foreground">{match.league}</span>
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        {match.minute}'
                      </span>
                    </div>
                    
                    {/* Teams without logos - using initials */}
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center text-lg font-bold mb-2">
                          {match.homeTeam.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-foreground">{match.homeTeam}</p>
                      </div>
                      
                      <div className="px-6">
                        <p className="text-3xl font-bold text-foreground">
                          {match.homeScore ?? 0} - {match.awayScore ?? 0}
                        </p>
                      </div>
                      
                      <div className="text-center flex-1">
                        <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center text-lg font-bold mb-2">
                          {match.awayTeam.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-foreground">{match.awayTeam}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-xl">
                <Radio className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Tidak ada pertandingan live saat ini
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Jadwal Terdekat Section - WITH LOGOS */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-foreground">
                Jadwal Terdekat
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <FixtureCardSkeleton key={i} />
                ))}
              </div>
            ) : upcomingMatches.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {upcomingMatches.slice(0, visibleUpcoming).map((match, index) => (
                    <JadwalCard key={match.id} match={match} index={index} />
                  ))}
                </div>

                {hasMoreUpcoming && (
                  <div className="flex justify-center mt-8">
                    <Button 
                      variant="outline" 
                      className="rounded-full px-8"
                      onClick={() => setVisibleUpcoming(prev => prev + 8)}
                    >
                      Lihat Lebih Banyak
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Tidak ada jadwal pertandingan dalam waktu dekat
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Results Section - NO LOGOS */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Hasil Terbaru
            </h2>

            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-6 h-6 mx-auto text-muted-foreground animate-spin" />
              </div>
            ) : recentMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentMatches.slice(0, 6).map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-muted-foreground">{match.league}</span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                        FT
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{match.homeTeam}</p>
                        <p className="text-sm font-medium text-foreground mt-1">{match.awayTeam}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{match.homeScore ?? 0}</p>
                        <p className="text-sm font-bold text-foreground mt-1">{match.awayScore ?? 0}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl">
                <p className="text-muted-foreground">
                  Belum ada hasil pertandingan
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

export default LiveIndonesia;
