import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, ChevronDown, Search, User } from 'lucide-react';
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
    <header className="sticky top-0 z-50">
      {/* Section 1: Top Banner Bar */}
      <div className="bg-header hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-8 text-xs text-header-foreground/80">
            <span>Official Partner: Liga 1 Indonesia 2025/26</span>
            <span className="mx-4 text-header-foreground/40">|</span>
            <span>Powered by BOLAKAMI Network</span>
          </div>
        </div>
      </div>

      {/* Section 2: Main Header with Logo & Navigation */}
      <div className="bg-gradient-to-b from-header to-header-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 text-2xl md:text-3xl font-black tracking-tight">
              <span className="text-header-foreground">BOLA</span>
              <span className="text-primary">KAMI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`relative px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                    isActive(item.path)
                      ? 'text-header-foreground'
                      : 'text-header-foreground/70 hover:text-header-foreground'
                  }`}
                >
                  {t(item.key)}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-header-foreground"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-header-foreground"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Utility Bar */}
      <div className="bg-header-secondary/90 backdrop-blur-sm border-b border-header-accent/30 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10">
            {/* Left: Quick Links */}
            <div className="flex items-center gap-6 text-xs text-header-foreground/70">
              <span className="hover:text-header-foreground cursor-pointer transition-colors">Transfer News</span>
              <span className="hover:text-header-foreground cursor-pointer transition-colors">Match Highlights</span>
              <span className="hover:text-header-foreground cursor-pointer transition-colors">Fantasy League</span>
            </div>

            {/* Right: Utilities */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <button className="flex items-center gap-2 text-header-foreground/70 hover:text-header-foreground transition-colors">
                <Search className="w-4 h-4" />
                <span className="text-xs">Search</span>
              </button>

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-header-accent/30 text-header-foreground text-xs font-semibold hover:bg-header-accent/50 transition-colors"
              >
                <span className={language === 'id' ? 'text-primary' : 'text-header-foreground/70'}>ID</span>
                <span className="text-header-foreground/40">/</span>
                <span className={language === 'en' ? 'text-primary' : 'text-header-foreground/70'}>EN</span>
              </button>

              {/* Location */}
              <button className="flex items-center gap-1.5 text-xs text-header-foreground/70 hover:text-header-foreground transition-colors">
                <MapPin className="w-3.5 h-3.5" />
                <span>JAKARTA</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* User */}
              <button className="flex items-center gap-1.5 text-xs text-header-foreground/70 hover:text-header-foreground transition-colors">
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-header-secondary border-b border-header-accent/30"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-bold uppercase tracking-wide py-3 px-4 rounded transition-colors ${
                    isActive(item.path)
                      ? 'text-header-foreground bg-header-accent/30'
                      : 'text-header-foreground/70 hover:bg-header-accent/20'
                  }`}
                >
                  {t(item.key)}
                </Link>
              ))}
              
              <div className="mt-4 pt-4 border-t border-header-accent/30 flex flex-col gap-3">
                {/* Mobile Quick Links */}
                <div className="flex flex-wrap gap-2 text-xs text-header-foreground/70">
                  <span className="px-3 py-1.5 bg-header-accent/20 rounded-full">Transfer News</span>
                  <span className="px-3 py-1.5 bg-header-accent/20 rounded-full">Highlights</span>
                  <span className="px-3 py-1.5 bg-header-accent/20 rounded-full">Fantasy</span>
                </div>

                {/* Mobile Utilities */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-header-accent/30 text-sm font-medium text-header-foreground"
                  >
                    <span className={language === 'id' ? 'text-primary font-bold' : 'text-header-foreground/70'}>ID</span>
                    <span className="text-header-foreground/40">/</span>
                    <span className={language === 'en' ? 'text-primary font-bold' : 'text-header-foreground/70'}>EN</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-header-foreground/70">
                    <MapPin className="w-4 h-4" />
                    <span>JAKARTA</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-header-foreground/70">
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
