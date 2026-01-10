import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronUp, ChevronDown, Heart, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MomentType {
  id: string;
  title: { id: string; en: string };
  thumbnail: string;
}

const moreMoments: MomentType[] = [
  { id: 'm1', title: { id: 'Tendangan Bebas Spektakuler', en: 'Spectacular Free Kick' }, thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&h=400&fit=crop' },
  { id: 'm2', title: { id: 'Gol Menit Akhir Dramatis', en: 'Dramatic Last Minute Goal' }, thumbnail: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=300&h=400&fit=crop' },
  { id: 'm3', title: { id: 'Umpan Jenius Modric', en: 'Genius Modric Pass' }, thumbnail: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&h=400&fit=crop' },
  { id: 'm4', title: { id: 'Solo Run Saka', en: 'Saka Solo Run' }, thumbnail: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=300&h=400&fit=crop' },
  { id: 'm5', title: { id: 'Penyelamatan Heroik Donnarumma', en: 'Heroic Donnarumma Save' }, thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=400&fit=crop' },
  { id: 'm6', title: { id: 'Gol Akrobatik Ibrahimovic', en: 'Ibrahimovic Acrobatic Goal' }, thumbnail: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=300&h=400&fit=crop' },
  { id: 'm7', title: { id: 'Umpan Panjang Trent', en: 'Trent Long Pass' }, thumbnail: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300&h=400&fit=crop' },
  { id: 'm8', title: { id: 'Header Maut Van Dijk', en: 'Van Dijk Deadly Header' }, thumbnail: 'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=300&h=400&fit=crop' },
  { id: 'm9', title: { id: 'Chip Elegan Benzema', en: 'Elegant Benzema Chip' }, thumbnail: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=300&h=400&fit=crop' },
  { id: 'm10', title: { id: 'Dribbling Ajaib Neymar', en: 'Magical Neymar Dribbling' }, thumbnail: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&h=400&fit=crop' },
];

const MoreMomentsGrid: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const navigateMoment = useCallback((direction: 'prev' | 'next') => {
    if (selectedIndex === null) return;
    
    if (direction === 'prev' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (direction === 'next' && selectedIndex < moreMoments.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateMoment('prev');
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        navigateMoment('next');
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, navigateMoment]);

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        navigateMoment('next');
      } else {
        navigateMoment('prev');
      }
    }
    setTouchStart(null);
  };

  const selectedMoment = selectedIndex !== null ? moreMoments[selectedIndex] : null;

  return (
    <>
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            {t('section.moreMoments')}
          </h2>

          {/* Grid Layout: 2 cols mobile, 5 cols desktop */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {moreMoments.map((moment, index) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                onClick={() => setSelectedIndex(index)}
              >
                <div className="relative rounded-xl overflow-hidden bg-card aspect-[3/4]">
                  <img
                    src={moment.thumbnail}
                    alt={moment.title[language]}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="mt-2 text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {moment.title[language]}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-md p-0 bg-background border-none overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedMoment && (
              <motion.div
                key={selectedMoment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                {/* Video/Image Area - Portrait */}
                <div 
                  className="relative aspect-[9/16] bg-card"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={selectedMoment.thumbnail}
                    alt={selectedMoment.title[language]}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Close Button */}
                  <button 
                    onClick={() => setSelectedIndex(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/50 flex items-center justify-center hover:bg-background/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>

                  {/* League Logo Placeholder */}
                  <div className="absolute top-20 right-4 w-10 h-10 rounded-full bg-background/20 flex items-center justify-center">
                    <span className="text-lg">⚽</span>
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/80 to-transparent">
                    {/* Title */}
                    <p className="text-sm text-foreground font-medium mb-3">
                      {selectedMoment.title[language]}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-0.5 bg-muted rounded-full mb-4">
                      <div className="w-1/3 h-full bg-foreground rounded-full" />
                    </div>
                  </div>

                  {/* Right Side Actions */}
                  <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4">
                    <button className="flex flex-col items-center gap-1">
                      <Heart className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-foreground">1.1K</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                      <Send className="w-6 h-6 text-foreground" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {selectedIndex !== null && (
            <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-2 z-50">
              <button
                onClick={() => navigateMoment('prev')}
                disabled={selectedIndex === 0}
                className="w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateMoment('next')}
                disabled={selectedIndex === moreMoments.length - 1}
                className="w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Swipe indicator for mobile */}
          {selectedIndex !== null && (
            <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
              Swipe up/down to navigate
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MoreMomentsGrid;
