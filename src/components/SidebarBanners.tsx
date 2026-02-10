import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState, useCallback } from 'react';

interface SidebarBanner {
  id: string;
  title: string;
  position: 'left' | 'right';
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

interface SidebarBannersProps {
  variant?: 'default' | 'article';
}

const SidebarBanners = ({ variant = 'default' }: SidebarBannersProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const { data: banners = [] } = useQuery({
    queryKey: ['sidebar-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sidebar_banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as SidebarBanner[];
    },
  });

  // Hide banners when approaching related news section or footer
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Banner position: fixed top-24 (96px) + banner height (600px for 160px width)
      const bannerBottom = scrollY + 96 + 600;
      
      // Find the related news section or fallback elements
      const relatedSection = document.querySelector('[data-section="related-news"]');
      
      if (relatedSection) {
        // Get the absolute position of the related news section
        const sectionTop = relatedSection.getBoundingClientRect().top + scrollY;
        // Hide banner 100px before reaching the section
        setIsVisible(bannerBottom < sectionTop - 100);
      } else {
        // Fallback: hide at 600px from bottom of page
        const hideThreshold = documentHeight - windowHeight - 600;
        setIsVisible(scrollY < hideThreshold);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const leftBanner = banners.find(b => b.position === 'left');
  const rightBanner = banners.find(b => b.position === 'right');

  if (!leftBanner && !rightBanner) return null;

  // Different positioning based on variant
  // Default: aligned with max-w-7xl container (1280px / 2 = 640px from center + banner width + gap)
  // Article: aligned with max-w-4xl container (896px / 2 = 448px from center + banner width + gap)
  const getPositionStyle = (side: 'left' | 'right') => {
    const isLargeScreen = windowWidth >= 1800;
    
    if (variant === 'article') {
      // Article max-w-4xl (896px): 448 + 10 + banner
      const offset = isLargeScreen ? 628 : 558; // 448+10+100=558 for small, 448+20+160=628 for large
      return side === 'left' 
        ? { left: `max(16px, calc(50% - ${offset}px))` }
        : { right: `max(16px, calc(50% - ${offset}px))` };
    }
    // Home container (1400px): 700 + 10 + banner
    const offset = isLargeScreen ? 880 : 810; // 700+10+100=810 for small, 700+20+160=880 for large
    return side === 'left'
      ? { left: `max(16px, calc(50% - ${offset}px))` }
      : { right: `max(16px, calc(50% - ${offset}px))` };
  };

  return (
    <>
      {/* Left Banner */}
      {leftBanner && (
        <div 
          className={`hidden min-[1700px]:block fixed top-24 z-40 transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={getPositionStyle('left')}
        >
          <a 
            href={leftBanner.link_url || '#'} 
            target={leftBanner.link_url ? '_blank' : undefined}
            rel={leftBanner.link_url ? 'noopener noreferrer' : undefined}
            className="block transition-opacity hover:opacity-90"
          >
            <div className="w-[100px] min-[1800px]:w-[160px] aspect-[4/15] rounded-lg overflow-hidden shadow-lg bg-muted">
              <img
                src={leftBanner.image_url}
                alt={leftBanner.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </a>
        </div>
      )}

      {/* Right Banner */}
      {rightBanner && (
        <div 
          className={`hidden min-[1700px]:block fixed top-24 z-40 transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={getPositionStyle('right')}
        >
          <a 
            href={rightBanner.link_url || '#'} 
            target={rightBanner.link_url ? '_blank' : undefined}
            rel={rightBanner.link_url ? 'noopener noreferrer' : undefined}
            className="block transition-opacity hover:opacity-90"
          >
            <div className="w-[100px] min-[1800px]:w-[160px] aspect-[4/15] rounded-lg overflow-hidden shadow-lg bg-muted">
              <img
                src={rightBanner.image_url}
                alt={rightBanner.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </a>
        </div>
      )}
    </>
  );
};

export default SidebarBanners;
