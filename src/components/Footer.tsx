import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Twitter, Instagram, Facebook, Youtube, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { TikTokIcon, ThreadsIcon } from '@/components/icons/SocialIcons';

interface SocialLink {
  id: string;
  platform: string;
  display_name: string;
  url: string;
  icon_name: string;
  is_active: boolean;
  sort_order: number;
}

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');

  // Fetch social media links from database
  const { data: socialLinks } = useQuery({
    queryKey: ['social-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as SocialLink[];
    },
  });

  const getIcon = (iconName: string) => {
    const iconClass = "w-5 h-5";
    switch (iconName) {
      case 'instagram':
        return <Instagram className={iconClass} />;
      case 'twitter':
        return <Twitter className={iconClass} />;
      case 'facebook':
        return <Facebook className={iconClass} />;
      case 'youtube':
        return <Youtube className={iconClass} />;
      case 'tiktok':
        return <TikTokIcon className={iconClass} />;
      case 'threads':
        return <ThreadsIcon className={iconClass} />;
      default:
        return null;
    }
  };

  const leagueLinks = [
    { name: 'Liga 1 Indonesia', path: '/liga/liga-1' },
    { name: 'Liga 2 Indonesia', path: '/liga/liga-2' },
    { name: 'Premier League', path: '/liga/premier-league' },
    { name: 'La Liga', path: '/liga/la-liga' },
    { name: 'Serie A', path: '/liga/serie-a' },
    { name: 'Bundesliga', path: '/liga/bundesliga' },
    { name: 'Liga Champions', path: '/liga/champions-league' },
  ];

  const quickLinks = [
    { label: { id: 'Berita Terbaru', en: 'Latest News' }, path: '/berita', isExternal: false },
    { label: { id: 'Jadwal Pertandingan', en: 'Match Schedule' }, path: 'https://bolakamitv.up.railway.app/', isExternal: true },
    { label: { id: 'Skor Live', en: 'Live Scores' }, path: 'https://bolakamitv.up.railway.app/', isExternal: true },
    { label: { id: 'Prediksi AI', en: 'AI Predictions' }, path: 'https://parlay-predictor-pal.lovable.app', isExternal: true },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success(language === 'id' ? 'Berhasil berlangganan newsletter!' : 'Successfully subscribed to newsletter!');
    setEmail('');
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
          {/* About */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-1 text-xl font-bold mb-4">
              <span className="text-foreground">BOLA</span>
              <span className="text-primary">KAMI</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t('footer.aboutText')}
            </p>
            
            {/* Newsletter Form */}
            <div>
              <h5 className="font-semibold text-foreground mb-3 text-sm">
                {language === 'id' ? 'Berlangganan Newsletter' : 'Subscribe to Newsletter'}
              </h5>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder={language === 'id' ? 'Email kamu...' : 'Your email...'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/50 border-border text-sm h-10"
                />
                <Button type="submit" size="icon" className="h-10 w-10 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Leagues */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.leagues')}</h4>
            <ul className="space-y-2">
              {leagueLinks.map((league) => (
                <li key={league.path}>
                  <Link to={league.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {league.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  {link.isExternal ? (
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {language === 'id' ? link.label.id : link.label.en}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {language === 'id' ? link.label.id : link.label.en}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-semibold text-foreground mb-4">{t('footer.social')}</h4>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {socialLinks?.map((link) => (
                <a 
                  key={link.id}
                  href={link.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.display_name}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {getIcon(link.icon_name)}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
