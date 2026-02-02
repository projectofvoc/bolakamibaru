import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

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

  // Hide banners when approaching footer/related content area
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate the banner height (aspect ratio 4:15, width 120px = height 450px)
      const bannerHeight = 450;
      
      // Hide banner when the bottom of the visible banner would overlap
      // with the last 500px of the page (footer/related news area)
      const hideThreshold = documentHeight - windowHeight - 400;
      
      setIsVisible(scrollY < hideThreshold);
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
    if (variant === 'article') {
      // For article pages with max-w-4xl (896px)
      return side === 'left' 
        ? { left: 'calc(50% - 448px - 140px)' }
        : { right: 'calc(50% - 448px - 140px)' };
    }
    // Default for homepage with max-w-7xl (1280px) + wider content area
    return side === 'left'
      ? { left: 'calc(50% - 720px - 130px)' }
      : { right: 'calc(50% - 720px - 130px)' };
  };

  return (
    <>
      {/* Left Banner - Fixed position, aligned with content edge */}
      {leftBanner && (
        <div 
          className={`hidden min-[1440px]:block fixed top-24 z-40 transition-opacity duration-300 ${
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
            <div className="w-[120px] aspect-[4/15] rounded-lg overflow-hidden shadow-lg bg-muted">
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

      {/* Right Banner - Fixed position, aligned with content edge */}
      {rightBanner && (
        <div 
          className={`hidden min-[1440px]:block fixed top-24 z-40 transition-opacity duration-300 ${
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
            <div className="w-[120px] aspect-[4/15] rounded-lg overflow-hidden shadow-lg bg-muted">
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
