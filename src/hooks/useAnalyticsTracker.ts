import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview, trackSessionEnd } from '@/lib/analytics';

export function useAnalyticsTracker() {
  const location = useLocation();
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    // Track pageview on route change
    trackPageview(location.pathname);
    
    // Only set up beforeunload handler on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      const handleBeforeUnload = () => {
        trackSessionEnd();
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [location.pathname]);
}
