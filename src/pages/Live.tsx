import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { matches } from '@/data/dummyData';

const Live: React.FC = () => {
  const { t, language } = useLanguage();
  
  // Filter live matches
  const liveMatches = matches.filter(m => m.status === 'live');
  const recentMatches = matches.filter(m => m.status === 'ft').slice(0, 6);

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
              <div className="relative">
                <Radio className="w-8 h-8 text-primary" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {language === 'id' ? 'Skor Live' : 'Live Scores'}
              </h1>
            </motion.div>
            <p className="text-muted-foreground">
              {language === 'id' 
                ? 'Pantau skor pertandingan secara real-time' 
                : 'Track match scores in real-time'}
            </p>
          </div>
        </section>

        {/* Live Matches Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-xl font-bold text-foreground">
                {language === 'id' ? 'Sedang Berlangsung' : 'In Progress'}
              </h2>
            </div>

            {liveMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-xl p-6 border border-primary/30"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-muted-foreground">{match.league}</span>
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        {match.minute}'
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center text-lg font-bold mb-2">
                          {match.homeTeam.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-foreground">{match.homeTeam}</p>
                      </div>
                      
                      <div className="px-6">
                        <p className="text-3xl font-bold text-foreground">
                          {match.homeScore} - {match.awayScore}
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
                  {language === 'id' 
                    ? 'Tidak ada pertandingan live saat ini' 
                    : 'No live matches at the moment'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Results Section */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {language === 'id' ? 'Hasil Terbaru' : 'Recent Results'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentMatches.map((match, index) => (
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
                      <p className="text-sm font-bold text-foreground">{match.homeScore}</p>
                      <p className="text-sm font-bold text-foreground mt-1">{match.awayScore}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Live;
