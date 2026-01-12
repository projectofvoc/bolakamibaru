import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, ChevronDown, Search, User, Radio, Brain, Trophy, Newspaper, Settings, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoBolakami from '@/assets/logo-bolakami.png';
import SearchModal from './SearchModal';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ligaDropdownOpen, setLigaDropdownOpen] = useState(false);
  const [beritaDropdownOpen, setBeritaDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Global keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const navItems = [
    { key: 'nav.live', path: 'https://stream.bolakami.com/', icon: Radio, priority: 'high', isExternal: true },
    { key: 'nav.prediksiAI', path: '/prediksi-ai', icon: Brain, priority: 'high' },
    { key: 'nav.liga', path: '/liga', icon: Trophy, priority: 'medium', hasDropdown: true },
    { key: 'nav.berita', path: '/berita', icon: Newspaper, priority: 'medium', hasDropdown: true },
  ];

  const ligaSubmenu = [
    { key: 'liga.all', path: '/liga' },
    { key: 'liga.liga1', path: '/liga/liga-1' },
    { key: 'liga.premierLeague', path: '/liga/premier-league' },
    { key: 'liga.laLiga', path: '/liga/la-liga' },
    { key: 'liga.serieA', path: '/liga/serie-a' },
    { key: 'liga.bundesliga', path: '/liga/bundesliga' },
    { key: 'liga.championsLeague', path: '/liga/champions-league' },
  ];

  const beritaSubmenu = [
    { key: 'berita.trending', path: '/berita/trending' },
    { key: 'berita.daily', path: '/berita/daily' },
    { key: 'berita.analisa', path: '/berita/analisa' },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="sticky top-0 z-50">
      {/* Section 1: Top Banner Bar */}
      <div className="bg-card hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-8 text-xs text-muted-foreground">
            <span>Official Partner: Liga 1 Indonesia 2025/26</span>
            <span className="mx-4 text-muted-foreground/40">|</span>
            <span>Powered by BOLAKAMI Network</span>
          </div>
        </div>
      </div>

      {/* Section 2: Main Header with Logo & Navigation */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src={logoBolakami} alt="BOLAKAMI" className="h-8 md:h-10" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => {
                    if (item.key === 'nav.liga') setLigaDropdownOpen(true);
                    if (item.key === 'nav.berita') setBeritaDropdownOpen(true);
                  }}
                  onMouseLeave={() => {
                    if (item.key === 'nav.liga') setLigaDropdownOpen(false);
                    if (item.key === 'nav.berita') setBeritaDropdownOpen(false);
                  }}
                >
                  {item.isExternal ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-full text-foreground/80 hover:text-foreground hover:bg-secondary ${item.priority === 'high' ? 'text-primary' : ''}`}
                    >
                      <item.icon className="w-4 h-4" />
                      {t(item.key)}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-full ${
                        isActive(item.path)
                          ? 'text-primary-foreground bg-primary'
                          : 'text-foreground/80 hover:text-foreground hover:bg-secondary'
                      } ${item.priority === 'high' ? 'text-primary' : ''}`}
                    >
                      <item.icon className="w-4 h-4" />
                      {t(item.key)}
                      {item.hasDropdown && <ChevronDown className="w-3 h-3 ml-0.5" />}
                    </Link>
                  )}

                  {/* Liga Dropdown */}
                  {item.key === 'nav.liga' && ligaDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <div className="py-2">
                        {ligaSubmenu.map((sub) => (
                          <Link
                            key={sub.key}
                            to={sub.path}
                            className="flex items-center px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            {t(sub.key)}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Berita Dropdown */}
                  {item.key === 'nav.berita' && beritaDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <div className="py-2">
                        {beritaSubmenu.map((sub) => (
                          <Link
                            key={sub.key}
                            to={sub.path}
                            className="flex items-center px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            {t(sub.key)}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side Utilities */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs text-muted-foreground hidden lg:inline">⌘K</span>
              </button>

              <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors"
              >
                <span className={language === 'id' ? 'text-primary' : 'text-muted-foreground'}>ID</span>
                <span className="text-muted-foreground/40">/</span>
                <span className={language === 'en' ? 'text-primary' : 'text-muted-foreground'}>EN</span>
              </button>

              {/* User */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/bolakamicms"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>CMS</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-destructive/10 hover:bg-destructive/20 rounded-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Masuk</span>
                </Link>
              )}
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
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <div key={item.key}>
                  {item.isExternal ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide py-3 px-4 rounded-xl transition-colors text-foreground/80 hover:bg-secondary"
                    >
                      <item.icon className="w-5 h-5" />
                      {t(item.key)}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => !item.hasDropdown && setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 text-sm font-bold uppercase tracking-wide py-3 px-4 rounded-xl transition-colors ${
                        isActive(item.path)
                          ? 'text-primary-foreground bg-primary'
                          : 'text-foreground/80 hover:bg-secondary'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {t(item.key)}
                      {item.hasDropdown && <ChevronDown className="w-4 h-4 ml-auto" />}
                    </Link>
                  )}

                  {/* Mobile Liga Submenu */}
                  {item.key === 'nav.liga' && (
                    <div className="ml-8 mt-1 flex flex-col gap-1">
                      {ligaSubmenu.slice(0, 4).map((sub) => (
                        <Link
                          key={sub.key}
                          to={sub.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-sm text-muted-foreground hover:text-foreground py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
                        >
                          {t(sub.key)}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Mobile Berita Submenu */}
                  {item.key === 'nav.berita' && (
                    <div className="ml-8 mt-1 flex flex-col gap-1">
                      {beritaSubmenu.map((sub) => (
                        <Link
                          key={sub.key}
                          to={sub.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-sm text-muted-foreground hover:text-foreground py-2 px-3 rounded-lg hover:bg-secondary transition-colors"
                        >
                          {t(sub.key)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-sm font-medium text-foreground"
                >
                  <span className={language === 'id' ? 'text-primary font-bold' : 'text-muted-foreground'}>ID</span>
                  <span className="text-muted-foreground/40">/</span>
                  <span className={language === 'en' ? 'text-primary font-bold' : 'text-muted-foreground'}>EN</span>
                </button>
                {user ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/bolakamicms"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>CMS</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-destructive/10 hover:bg-destructive/20 rounded-full transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Masuk</span>
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
