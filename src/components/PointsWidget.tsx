import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useUserPoints } from '@/hooks/useUserPoints';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import paviconBolakami from '@/assets/pavicon-bolakami.svg';

const PointsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { totalPoints, userId } = useUserPoints();
  const { progressPercentage, minutesUntilNextPoint, isTracking } = useActivityTracker();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPointAnimation, setShowPointAnimation] = useState(false);
  const [previousPoints, setPreviousPoints] = useState(totalPoints);

  // Check login status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Animate when points change
  useEffect(() => {
    if (totalPoints > previousPoints) {
      setShowPointAnimation(true);
      setTimeout(() => setShowPointAnimation(false), 2000);
    }
    setPreviousPoints(totalPoints);
  }, [totalPoints]);

  // Don't show if not logged in
  if (!isLoggedIn) return null;

  // Calculate SVG circle properties
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const handleClick = () => {
    navigate('/rewards');
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', delay: 0.5 }}
      className="fixed bottom-4 right-4 z-50 safe-area-inset-bottom"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
    >
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-card to-card/90 border-2 border-primary/30 shadow-lg shadow-primary/20 flex items-center justify-center group"
      >
        {/* Progress ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 64 64"
        >
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="3"
            opacity="0.3"
          />
          {/* Progress circle */}
          <motion.circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Inner content - BOLAKAMI icon with points */}
        <div className="relative flex flex-col items-center justify-center z-10">
          <img 
            src={paviconBolakami} 
            alt="BOLAKAMI" 
            className="w-6 h-6 object-contain"
          />
          <span className="text-[10px] font-bold text-foreground leading-none mt-0.5">
            {totalPoints}
          </span>
        </div>

        {/* Tracking indicator */}
        {isTracking && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Point earned animation */}
        <AnimatePresence>
          {showPointAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -30, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-primary rounded-full whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3 text-primary-foreground" />
              <span className="text-xs font-bold text-primary-foreground">+1</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip on hover */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-popover text-popover-foreground text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-border">
            <div className="font-semibold mb-1">
              {language === 'id' ? 'Read to Earn' : 'Read to Earn'}
            </div>
            <div className="text-muted-foreground">
              {language === 'id' 
                ? `${minutesUntilNextPoint} menit lagi untuk +1 poin`
                : `${minutesUntilNextPoint} min until +1 point`}
            </div>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
};

export default PointsWidget;
