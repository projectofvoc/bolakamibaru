import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Calendar, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserPoints } from '@/hooks/useUserPoints';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const DailyCheckinPopup: React.FC = () => {
  const { language } = useLanguage();
  const { 
    userId, 
    hasCheckedInToday, 
    isLoadingCheckin, 
    streak, 
    claimCheckin, 
    isClaimingCheckin 
  } = useUserPoints();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Show popup when user is logged in and hasn't checked in today
  useEffect(() => {
    if (userId && !isLoadingCheckin && !hasCheckedInToday) {
      // Delay showing popup slightly for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [userId, isLoadingCheckin, hasCheckedInToday]);

  const handleClaim = async () => {
    try {
      const result = await claimCheckin();
      if (result.success) {
        setEarnedPoints(result.points || 1);
        setShowSuccess(true);
        toast.success(language === 'id' ? 'Check-in berhasil!' : 'Check-in successful!');
        
        // Close popup after success animation
        setTimeout(() => {
          setIsOpen(false);
          setShowSuccess(false);
        }, 2000);
      } else {
        toast.error(result.message || 'Failed to claim check-in');
      }
    } catch (error) {
      toast.error(language === 'id' ? 'Gagal melakukan check-in' : 'Failed to check in');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!userId || hasCheckedInToday) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-sm bg-gradient-to-br from-card via-card to-primary/10 rounded-2xl shadow-2xl border border-primary/20 overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors z-10"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {/* Content */}
              <div className="p-6 pt-8">
                {!showSuccess ? (
                  <>
                    {/* Header with icon */}
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4"
                      >
                        <Gift className="w-10 h-10 text-primary" />
                      </motion.div>
                      
                      <h2 className="text-xl font-bold text-foreground mb-1">
                        {language === 'id' ? 'Daily Check-in' : 'Daily Check-in'}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {language === 'id' 
                          ? 'Klaim poin harianmu sekarang!' 
                          : 'Claim your daily points now!'}
                      </p>
                    </div>
                    
                    {/* Streak info */}
                    <div className="bg-muted/30 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span className="text-sm font-medium">
                            {language === 'id' ? 'Streak Saat Ini' : 'Current Streak'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-bold text-primary">{streak}</span>
                          <span className="text-sm text-muted-foreground">
                            {language === 'id' ? 'hari' : 'days'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Reward preview */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          +1 {language === 'id' ? 'Poin' : 'Point'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Claim button */}
                    <Button
                      onClick={handleClaim}
                      disabled={isClaimingCheckin}
                      className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                    >
                      {isClaimingCheckin ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          {language === 'id' ? 'Mengklaim...' : 'Claiming...'}
                        </span>
                      ) : (
                        <>
                          <Gift className="w-5 h-5 mr-2" />
                          {language === 'id' ? 'Klaim Poin' : 'Claim Points'}
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  // Success state
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-4"
                    >
                      <Check className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-bold text-foreground mb-2"
                    >
                      {language === 'id' ? 'Berhasil!' : 'Success!'}
                    </motion.h2>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
                    >
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="text-lg font-bold text-primary">
                        +{earnedPoints} {language === 'id' ? 'Poin' : 'Points'}
                      </span>
                    </motion.div>
                  </motion.div>
                )}
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DailyCheckinPopup;
