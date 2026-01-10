import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Twitter, Instagram, Facebook, Youtube, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');

  const leagueLinks = [
    'Liga 1 Indonesia',
    'Premier League',
    'La Liga',
    'Serie A',
    'Bundesliga',
    'Ligue 1',
  ];

  const quickLinks = [
    { label: { id: 'Berita Terbaru', en: 'Latest News' }, path: '/news' },
    { label: { id: 'Jadwal Pertandingan', en: 'Match Schedule' }, path: '/fixtures' },
    { label: { id: 'Klasemen', en: 'Standings' }, path: '/standings' },
    { label: { id: 'Transfer', en: 'Transfers' }, path: '/transfers' },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success(language === 'id' ? 'Berhasil berlangganan newsletter!' : 'Successfully subscribed to newsletter!');
    setEmail('');
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10">
          {/* About */}
          <div className="lg:col-span-2">
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
                <li key={league}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {league}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {language === 'id' ? link.label.id : link.label.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {language === 'id' ? 'Download Aplikasi' : 'Download App'}
            </h4>
            <div className="flex flex-col gap-3">
              <a 
                href="#" 
                className="flex items-center gap-3 bg-secondary/50 hover:bg-secondary px-4 py-2.5 rounded-lg transition-colors group"
              >
                <svg className="w-6 h-6 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground leading-none">
                    {language === 'id' ? 'Unduh di' : 'Download on'}
                  </p>
                  <p className="text-sm font-semibold text-foreground">App Store</p>
                </div>
              </a>
              <a 
                href="#" 
                className="flex items-center gap-3 bg-secondary/50 hover:bg-secondary px-4 py-2.5 rounded-lg transition-colors group"
              >
                <svg className="w-6 h-6 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground leading-none">
                    {language === 'id' ? 'Tersedia di' : 'Get it on'}
                  </p>
                  <p className="text-sm font-semibold text-foreground">Google Play</p>
                </div>
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.social')}</h4>
            <div className="flex gap-3 flex-wrap">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
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
