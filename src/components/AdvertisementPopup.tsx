import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface Advertisement {
  id: string;
  title: string;
  media_type: string;
  media_url: string;
  link_url: string | null;
  is_active: boolean;
}

const AdvertisementPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Fetch active advertisement
  const { data: ad } = useQuery({
    queryKey: ['active-advertisement'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Advertisement | null;
    },
  });

  useEffect(() => {
    // Check sessionStorage to prevent ad showing repeatedly in same session
    const seenAd = sessionStorage.getItem('ad_seen');

    if (!seenAd && ad) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ad]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('ad_seen', 'true');
  };

  const handleMediaClick = () => {
    if (ad?.link_url) {
      let url = ad.link_url;
      // Ensure URL has a protocol (https:// or http://)
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank');
    }
  };

  if (!ad) return null;

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg p-0 border-0 bg-transparent shadow-2xl [&>button]:hidden">
        {/* Container untuk button dan media */}
        <div className="relative">
          {/* Close button - positioned outside with white circle frame */}
          <button
            onClick={handleClose}
            className="absolute -top-3 -right-3 z-50 bg-white hover:bg-gray-100 rounded-full p-1.5 shadow-lg border-2 border-gray-200 transition-colors"
            aria-label="Tutup iklan"
          >
            <X className="w-5 h-5 text-gray-800" />
          </button>

          {/* Media content - locked to 1:1 aspect ratio */}
          <div 
            className={`relative rounded-lg overflow-hidden aspect-square ${ad.link_url ? 'cursor-pointer' : ''}`}
            onClick={handleMediaClick}
          >
            {ad.media_type === 'image' ? (
              <img
                src={ad.media_url}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={ad.media_url}
                autoPlay
                muted
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvertisementPopup;
