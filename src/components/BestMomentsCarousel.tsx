import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Play, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
interface MomentType {
  id: string;
  title_id: string;
  title_en: string;
  thumbnail_url: string;
  video_url: string | null;
  is_active: boolean;
  sort_order: number;
}

// Custom SVG icons for share platforms
const TikTokIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>;
const TelegramIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>;
const BestMomentsCarousel: React.FC = () => {
  const {
    language,
    t
  } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // Fetch moments from database
  const {
    data: moments = [],
    isLoading
  } = useQuery({
    queryKey: ['best-moments'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('best_moments').select('*').eq('is_active', true).order('sort_order', {
        ascending: true
      });
      if (error) throw error;
      return data as MomentType[];
    }
  });
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  const navigateMoment = useCallback((direction: 'prev' | 'next') => {
    if (selectedIndex === null) return;
    if (direction === 'prev' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setShowShareSheet(false);
    } else if (direction === 'next' && selectedIndex < moments.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setShowShareSheet(false);
    }
  }, [selectedIndex, moments.length]);

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
        if (showShareSheet) {
          setShowShareSheet(false);
        } else {
          setSelectedIndex(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, navigateMoment, showShareSheet]);

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (showShareSheet) return;
    setTouchStart(e.touches[0].clientY);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || showShareSheet) return;
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

  // Share handlers
  const getShareUrl = () => {
    const moment = selectedIndex !== null ? moments[selectedIndex] : null;
    if (!moment) return '';
    return `${window.location.origin}/moments/${moment.id}`;
  };
  const getShareTitle = () => {
    const moment = selectedIndex !== null ? moments[selectedIndex] : null;
    if (!moment) return '';
    return language === 'id' ? moment.title_id : moment.title_en;
  };
  const handleShareTikTok = () => {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl);
    // Try to open TikTok app
    window.location.href = 'tiktok://';
    setTimeout(() => {
      window.open('https://www.tiktok.com/', '_blank');
    }, 500);
    toast.success('Link disalin! Paste di TikTok');
    setShowShareSheet(false);
  };
  const handleShareTelegram = () => {
    const shareUrl = getShareUrl();
    const shareTitle = getShareTitle();
    // Try deep link first
    window.location.href = `tg://msg_url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    // Fallback to web
    setTimeout(() => {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
    }, 500);
    setShowShareSheet(false);
  };
  const handleShareInstagram = () => {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl);
    // Try to open Instagram app
    window.location.href = 'instagram://';
    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank');
    }, 500);
    toast.success('Link disalin! Paste di Instagram');
    setShowShareSheet(false);
  };
  const selectedMoment = selectedIndex !== null ? moments[selectedIndex] : null;
  if (isLoading) {
    return <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map(i => <div key={i} className="flex-shrink-0 w-40 md:w-44 aspect-[3/4] bg-muted rounded-xl animate-pulse" />)}
          </div>
        </div>
      </section>;
  }
  if (moments.length === 0) {
    return null;
  }
  return <>
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {t('section.bestMoments')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('section.bestMomentsSubtitle')}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Carousel */}
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
            {moments.map((moment, index) => <motion.div key={moment.id} initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: index * 0.1
          }} className="flex-shrink-0 w-40 md:w-44 group cursor-pointer" onClick={() => setSelectedIndex(index)}>
                <div className="relative rounded-xl overflow-hidden bg-card aspect-[3/4]">
                  <img src={moment.thumbnail_url} alt={language === 'id' ? moment.title_id : moment.title_en} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  {/* Video indicator */}
                  {moment.video_url && <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                      </div>
                    </div>}
                  {/* New Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                      New
                    </span>
                  </div>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="mt-2 text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {language === 'id' ? moment.title_id : moment.title_en}
                </h3>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => {
      setSelectedIndex(null);
      setShowShareSheet(false);
    }}>
        <DialogContent className="max-w-md p-0 bg-background border-none overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedMoment && <motion.div key={selectedMoment.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }} transition={{
            duration: 0.2
          }} className="relative">
                {/* Video/Image Area - Portrait */}
                <div className="relative aspect-[9/16] bg-card" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                  {/* Green Loading Spinner */}
                  {isVideoLoading && selectedMoment.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                      <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    </div>
                  )}
                  {selectedMoment.video_url ? (
                    <video 
                      src={selectedMoment.video_url} 
                      className="w-full h-full object-cover" 
                      autoPlay 
                      loop 
                      muted
                      playsInline
                      onLoadedData={() => setIsVideoLoading(false)}
                      onWaiting={() => setIsVideoLoading(true)}
                      onPlaying={() => setIsVideoLoading(false)}
                    />
                  ) : (
                    <img src={selectedMoment.thumbnail_url} alt={language === 'id' ? selectedMoment.title_id : selectedMoment.title_en} className="w-full h-full object-cover" />
                  )}
                  
                  {/* Close Button */}
                  

                  {/* League Logo Placeholder */}
                  

                  {/* Share Button - Bottom Right */}
                  <button onClick={() => setShowShareSheet(true)} className="absolute right-4 bottom-20 w-11 h-11 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center hover:bg-background/70 transition-colors z-10">
                    <Share2 className="w-5 h-5 text-foreground" />
                  </button>

                  {/* Bottom Content - Only show for images */}
                  {!selectedMoment.video_url && <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/80 to-transparent">
                      {/* Title */}
                      <p className="text-sm text-foreground font-medium mb-3">
                        {language === 'id' ? selectedMoment.title_id : selectedMoment.title_en}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="w-full h-0.5 bg-muted rounded-full mb-4">
                        <div className="w-1/3 h-full bg-foreground rounded-full" />
                      </div>
                    </div>}

                  {/* Share Sheet */}
                  <AnimatePresence>
                    {showShareSheet && <>
                        {/* Backdrop */}
                        <motion.div initial={{
                    opacity: 0
                  }} animate={{
                    opacity: 1
                  }} exit={{
                    opacity: 0
                  }} className="absolute inset-0 bg-background/40 z-20" onClick={() => setShowShareSheet(false)} />
                        
                        {/* Share Sheet Content */}
                        <motion.div initial={{
                    y: '100%'
                  }} animate={{
                    y: 0
                  }} exit={{
                    y: '100%'
                  }} transition={{
                    type: 'spring',
                    damping: 25,
                    stiffness: 300
                  }} className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl p-6 z-30">
                          {/* Handle */}
                          <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
                          
                          {/* Header */}
                          <div className="flex justify-between items-center mb-6">
                            <span className="font-semibold text-foreground">Share to</span>
                            <button onClick={() => setShowShareSheet(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                              <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                          
                          {/* Share Options */}
                          <div className="flex justify-center gap-10">
                            {/* TikTok */}
                            <button onClick={handleShareTikTok} className="flex flex-col items-center gap-2 group">
                              <div className="w-14 h-14 rounded-full bg-[#000000] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <TikTokIcon />
                              </div>
                              <span className="text-xs text-muted-foreground">TikTok</span>
                            </button>
                            
                            {/* Telegram */}
                            <button onClick={handleShareTelegram} className="flex flex-col items-center gap-2 group">
                              <div className="w-14 h-14 rounded-full bg-[#0088cc] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <TelegramIcon />
                              </div>
                              <span className="text-xs text-muted-foreground">Telegram</span>
                            </button>
                            
                            {/* Instagram */}
                            <button onClick={handleShareInstagram} className="flex flex-col items-center gap-2 group">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <InstagramIcon />
                              </div>
                              <span className="text-xs text-muted-foreground">Instagram</span>
                            </button>
                          </div>
                        </motion.div>
                      </>}
                  </AnimatePresence>
                </div>
              </motion.div>}
          </AnimatePresence>

          {/* Navigation Buttons - Inside modal, visible on desktop only */}
          {selectedIndex !== null && !showShareSheet && <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-2 z-50">
              <button onClick={() => navigateMoment('prev')} disabled={selectedIndex === 0} className="w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronUp className="w-5 h-5" />
              </button>
              <button onClick={() => navigateMoment('next')} disabled={selectedIndex === moments.length - 1} className="w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>}

          {/* Swipe indicator for mobile */}
          {selectedIndex !== null && !showShareSheet && <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
              Swipe up/down to navigate
            </div>}
        </DialogContent>
      </Dialog>
    </>;
};
export default BestMomentsCarousel;