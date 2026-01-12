import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, Target, ChevronRight, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { upcomingMatches } from '@/data/matchData';
import { Button } from '@/components/ui/button';

interface Prediction {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  prediction: string;
  confidence: number;
  homeWin: number;
  draw: number;
  awayWin: number;
  tips: string[];
}

// Mock AI predictions
const mockPredictions: Prediction[] = upcomingMatches.slice(0, 8).map((match, idx) => ({
  matchId: match.id,
  homeTeam: match.homeTeam,
  awayTeam: match.awayTeam,
  league: match.league,
  prediction: idx % 3 === 0 ? 'Home Win' : idx % 3 === 1 ? 'Draw' : 'Away Win',
  confidence: 65 + Math.floor(Math.random() * 25),
  homeWin: 30 + Math.floor(Math.random() * 40),
  draw: 20 + Math.floor(Math.random() * 20),
  awayWin: 25 + Math.floor(Math.random() * 35),
  tips: [
    idx % 2 === 0 ? 'Over 2.5 Goals' : 'Under 2.5 Goals',
    idx % 3 === 0 ? 'BTTS Yes' : 'Clean Sheet Home',
    idx % 4 === 0 ? 'First Half Draw' : 'Home Win HT'
  ]
}));

const PrediksiAI: React.FC = () => {
  const { language } = useLanguage();
  const [selectedMatch, setSelectedMatch] = useState<Prediction | null>(null);
  const [visibleCount, setVisibleCount] = useState(4);
  
  const visiblePredictions = mockPredictions.slice(0, visibleCount);
  const hasMore = visibleCount < mockPredictions.length;

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
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {language === 'id' ? 'Prediksi AI' : 'AI Predictions'}
              </h1>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </motion.div>
            <p className="text-muted-foreground max-w-2xl">
              {language === 'id' 
                ? 'Analisis prediksi pertandingan menggunakan kecerdasan buatan dengan akurasi tinggi berdasarkan data statistik komprehensif' 
                : 'Match prediction analysis using artificial intelligence with high accuracy based on comprehensive statistical data'}
            </p>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Target, label: language === 'id' ? 'Akurasi' : 'Accuracy', value: '78%' },
                { icon: TrendingUp, label: language === 'id' ? 'Win Rate' : 'Win Rate', value: '72%' },
                { icon: Zap, label: language === 'id' ? 'Prediksi Hari Ini' : 'Today\'s Picks', value: '12' },
                { icon: Brain, label: language === 'id' ? 'Data Dianalisis' : 'Data Analyzed', value: '50K+' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card rounded-xl p-4 text-center"
                >
                  <stat.icon className="w-6 h-6 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Predictions Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {language === 'id' ? 'Prediksi Pertandingan' : 'Match Predictions'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visiblePredictions.map((pred, index) => (
                <motion.div
                  key={pred.matchId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-6 cursor-pointer hover:border-primary/50 border border-transparent transition-colors"
                  onClick={() => setSelectedMatch(selectedMatch?.matchId === pred.matchId ? null : pred)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded-full">
                      {pred.league}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-primary">{pred.confidence}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <p className="font-semibold text-foreground">{pred.homeTeam}</p>
                    <span className="text-muted-foreground text-sm">vs</span>
                    <p className="font-semibold text-foreground">{pred.awayTeam}</p>
                  </div>

                  {/* Probability Bars */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-8">1</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pred.homeWin}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-10">{pred.homeWin}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-8">X</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full transition-all"
                          style={{ width: `${pred.draw}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-10">{pred.draw}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-8">2</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${pred.awayWin}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-10">{pred.awayWin}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{pred.prediction}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${selectedMatch?.matchId === pred.matchId ? 'rotate-90' : ''}`} />
                  </div>

                  {/* Expanded Tips */}
                  {selectedMatch?.matchId === pred.matchId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      <p className="text-sm font-medium text-foreground mb-2">
                        {language === 'id' ? 'Tips Tambahan:' : 'Additional Tips:'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pred.tips.map((tip, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                          >
                            {tip}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  className="rounded-full px-8"
                  onClick={() => setVisibleCount(prev => prev + 4)}
                >
                  {language === 'id' ? 'Muat Lebih Banyak' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-card/50">
          <div className="container mx-auto px-4">
            <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
              {language === 'id' 
                ? '⚠️ Prediksi ini hanya untuk hiburan dan referensi. Kami tidak bertanggung jawab atas keputusan yang diambil berdasarkan prediksi ini.' 
                : '⚠️ These predictions are for entertainment and reference only. We are not responsible for decisions made based on these predictions.'}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrediksiAI;
