import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Newspaper, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const leagues = [
  { id: 'liga-1', name: { id: 'Liga 1 Indonesia', en: 'Liga 1 Indonesia' }, path: '/liga/liga-1' },
  { id: 'premier-league', name: { id: 'Premier League', en: 'Premier League' }, path: '/liga/premier-league' },
  { id: 'la-liga', name: { id: 'La Liga', en: 'La Liga' }, path: '/liga/la-liga' },
  { id: 'serie-a', name: { id: 'Serie A', en: 'Serie A' }, path: '/liga/serie-a' },
  { id: 'bundesliga', name: { id: 'Bundesliga', en: 'Bundesliga' }, path: '/liga/bundesliga' },
  { id: 'champions-league', name: { id: 'Champions League', en: 'Champions League' }, path: '/liga/champions-league' },
];

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Fetch articles for search
  const { data: articles } = useQuery({
    queryKey: ['search-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen
  });

  // Reset query when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim() || !articles) {
      return { news: [], leagues: [] };
    }

    const searchTerm = query.toLowerCase();

    const filteredNews = articles
      .filter(article => 
        (language === 'id' ? article.title_id : article.title_en).toLowerCase().includes(searchTerm) ||
        article.category.toLowerCase().includes(searchTerm) ||
        article.club?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 4);

    const filteredLeagues = leagues
      .filter(league =>
        league.name[language].toLowerCase().includes(searchTerm)
      )
      .slice(0, 3);

    return {
      news: filteredNews,
      leagues: filteredLeagues
    };
  }, [query, language, articles]);

  const hasResults = searchResults.news.length > 0 || searchResults.leagues.length > 0;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-[101]"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={language === 'id' ? 'Cari berita, tim, atau liga...' : 'Search news, teams, or leagues...'}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 rounded-full hover:bg-secondary transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query.trim() === '' ? (
                  /* Quick Links when no query */
                  <div className="p-4">
                    <p className="text-xs uppercase font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {language === 'id' ? 'Cari Cepat' : 'Quick Search'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Persebaya', 'Persija', 'Liga 1', 'Premier League', 'Transfer'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 text-foreground rounded-full transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : !hasResults ? (
                  /* No Results */
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {language === 'id' ? 'Tidak ada hasil ditemukan' : 'No results found'}
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      {language === 'id' ? `Coba kata kunci lain untuk "${query}"` : `Try different keywords for "${query}"`}
                    </p>
                  </div>
                ) : (
                  /* Results List */
                  <div className="p-2">
                    {/* News Results */}
                    {searchResults.news.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs uppercase font-medium text-muted-foreground px-3 py-2 flex items-center gap-2">
                          <Newspaper className="w-3.5 h-3.5" />
                          {language === 'id' ? 'Berita' : 'News'}
                        </p>
                        {searchResults.news.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => handleNavigate(`/news/${article.slug}`)}
                            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-left"
                          >
                            {article.featured_image ? (
                              <img
                                src={article.featured_image}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                                <Newspaper className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground line-clamp-2">
                                {language === 'id' ? article.title_id : article.title_en}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {article.category} • {article.published_at 
                                  ? new Date(article.published_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })
                                  : ''}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Leagues Results */}
                    {searchResults.leagues.length > 0 && (
                      <div>
                        <p className="text-xs uppercase font-medium text-muted-foreground px-3 py-2 flex items-center gap-2">
                          <Trophy className="w-3.5 h-3.5" />
                          {language === 'id' ? 'Liga' : 'Leagues'}
                        </p>
                        {searchResults.leagues.map((league) => (
                          <button
                            key={league.id}
                            onClick={() => handleNavigate(league.path)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-left"
                          >
                            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                              <Trophy className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {league.name[language]}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {language === 'id' ? 'Lihat jadwal dan berita' : 'View schedule and news'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer with Keyboard Hints */}
              <div className="hidden md:flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">ESC</kbd>
                    {language === 'id' ? 'untuk tutup' : 'to close'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[10px]">⌘K</kbd>
                    {language === 'id' ? 'untuk buka' : 'to open'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
