import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Twitter, Instagram, Facebook, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useLanguage();

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

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <Link to="/" className="flex items-center gap-1 text-xl font-bold mb-4">
              <span className="text-foreground">BOLA</span>
              <span className="text-primary">KAMI</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('footer.aboutText')}
            </p>
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
                    {link.label.id}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.social')}</h4>
            <div className="flex gap-4">
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
