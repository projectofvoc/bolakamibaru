import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SidebarBanner {
  id: string;
  title: string;
  position: 'left' | 'right';
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const SidebarBanners = () => {
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

  const leftBanner = banners.find(b => b.position === 'left');
  const rightBanner = banners.find(b => b.position === 'right');

  if (!leftBanner && !rightBanner) return null;

  return (
    <>
      {/* Left Banner - Fixed position, only visible on large screens (>= 1440px) */}
      {leftBanner && (
        <div className="hidden min-[1440px]:block fixed left-4 top-24 z-40">
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

      {/* Right Banner - Fixed position, only visible on large screens (>= 1440px) */}
      {rightBanner && (
        <div className="hidden min-[1440px]:block fixed right-4 top-24 z-40">
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
