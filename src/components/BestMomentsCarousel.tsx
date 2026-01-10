import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { bestMoments } from '@/data/dummyData';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Heart, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MomentType {
  id: string;
  title: { id: string; en: string };
  thumbnail: string;
}

const BestMomentsCarousel: React.FC = () => {
  const { language, t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const navigateMoment = useCallback((direction: 'prev' | 'next') => {
    if (selectedIndex === null) return;
    
    if (direction === 'prev' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (direction === 'next' && selectedIndex < bestMoments.length - 1) {
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
    
    // Swipe up = next, swipe down = prev (threshold 50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        navigateMoment('next');
      } else {
        navigateMoment('prev');
      }
    }
    setTouchStart(null);
  };

  const selectedMoment = selectedIndex !== null ? bestMoments[selectedIndex] : null;

  return (
    <>
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {t('section.bestMoments')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {bestMoments.map((moment, index) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-40 md:w-44 group cursor-pointer"
                onClick={() => setSelectedIndex(index)}
              >
                <div className="relative rounded-xl overflow-hidden bg-card aspect-[3/4]">
                  <img
                    src={moment.thumbnail}
                    alt={moment.title[language]}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* New Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded">
                      New
                    </span>
                  </div>
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

          {/* Navigation Buttons - Inside modal, visible on desktop only */}
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
                disabled={selectedIndex === bestMoments.length - 1}
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

export default BestMomentsCarousel;
