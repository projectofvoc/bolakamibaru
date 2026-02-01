import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface FooterBanner {
  id: string;
  title: string;
  position: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const FooterBanners: React.FC = () => {
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['footer-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('footer_banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as FooterBanner[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Get banners by position
  const leftBanner = banners.find(b => b.position === 'left');
  const rightBanner = banners.find(b => b.position === 'right');

  // Don't render if no banners
  if (!isLoading && !leftBanner && !rightBanner) {
    return null;
  }

  const BannerImage = ({ banner }: { banner: FooterBanner }) => {
    const image = (
      <img
        src={banner.image_url}
        alt={banner.title}
        className="w-full h-full object-cover rounded-lg"
        loading="lazy"
      />
    );

    if (banner.link_url) {
      return (
        <a
          href={banner.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full aspect-[3/1] overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
        >
          {image}
        </a>
      );
    }

    return (
      <div className="w-full aspect-[3/1] overflow-hidden rounded-lg">
        {image}
      </div>
    );
  };

  return (
    <section className="py-6 md:py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Banner (Top on Mobile) */}
          <div className="w-full">
            {isLoading ? (
              <Skeleton className="w-full aspect-[3/1] rounded-lg" />
            ) : leftBanner ? (
              <BannerImage banner={leftBanner} />
            ) : (
              <div className="w-full aspect-[3/1] rounded-lg bg-muted/30 flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Banner Kiri</span>
              </div>
            )}
          </div>

          {/* Right Banner (Bottom on Mobile) */}
          <div className="w-full">
            {isLoading ? (
              <Skeleton className="w-full aspect-[3/1] rounded-lg" />
            ) : rightBanner ? (
              <BannerImage banner={rightBanner} />
            ) : (
              <div className="w-full aspect-[3/1] rounded-lg bg-muted/30 flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Banner Kanan</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterBanners;
