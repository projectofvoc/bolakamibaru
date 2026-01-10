import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { key: 'nav.home', path: '/' },
    { key: 'nav.fixtures', path: '/fixtures' },
    { key: 'nav.live', path: '/live' },
    { key: 'nav.news', path: '/news' },
    { key: 'nav.standings', path: '/standings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 text-2xl font-bold">
            <span className="text-foreground">BOLA</span>
            <span className="text-primary">KAMI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <span className={language === 'id' ? 'text-primary font-bold' : ''}>ID</span>
              <span className="text-muted-foreground">/</span>
              <span className={language === 'en' ? 'text-primary font-bold' : ''}>EN</span>
            </button>

            {/* Location */}
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <MapPin className="w-4 h-4" />
              <span>JAKARTA</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-semibold py-2 ${
                    isActive(item.path)
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {t(item.key)}
                </Link>
              ))}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button
                  onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-sm font-medium"
                >
                  <span className={language === 'id' ? 'text-primary font-bold' : ''}>ID</span>
                  <span className="text-muted-foreground">/</span>
                  <span className={language === 'en' ? 'text-primary font-bold' : ''}>EN</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>JAKARTA</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
