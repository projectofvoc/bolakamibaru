import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, X, CheckCircle, Bookmark, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles, featuredArticle } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BeritaTag: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(10);
  const [tagSearch, setTagSearch] = useState('');
  const tagParam = searchParams.get('tag');
  
  // Convert slug back to readable format
  const tagDisplay = tagParam ? tagParam.replace(/-/g, ' ') : null;
  
  // All articles
  const allArticles = [featuredArticle, ...articles];
  
  // Filter articles by tag (case-insensitive match)
  const filteredArticles = tagParam
    ? allArticles.filter(article => 
        article.tags?.some(t => 
          t.toLowerCase().replace(/\s+/g, '-') === tagParam.toLowerCase() ||
          t.toLowerCase() === tagParam.toLowerCase().replace(/-/g, ' ')
        )
      )
    : allArticles;

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  // Get all unique tags from articles
  const allTags = useMemo(() => 
    Array.from(
      new Set(allArticles.flatMap(article => article.tags || []))
    ).sort(),
    []
  );

  // Filter tags by search query
  const filteredTags = useMemo(() => 
    tagSearch.trim()
      ? allTags.filter(tag => 
          tag.toLowerCase().includes(tagSearch.toLowerCase())
        )
      : allTags,
    [allTags, tagSearch]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/20 via-background to-background py-10 md:py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-1"
            >
              <Tag className="w-7 h-7 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {tagDisplay 
                  ? <span className="capitalize">{tagDisplay}</span>
                  : (language === 'id' ? 'Semua Tag' : 'All Tags')}
              </h1>
            </motion.div>
            <p className="text-sm text-muted-foreground ml-10">
              {tagDisplay
                ? (language === 'id' 
                    ? `${filteredArticles.length} artikel ditemukan` 
                    : `${filteredArticles.length} articles found`)
                : (language === 'id' 
                    ? 'Jelajahi berita berdasarkan topik' 
                    : 'Explore news by topic')}
            </p>
          </div>
        </section>

        {/* Active Tag Filter Badge */}
        {tagParam && (
          <section className="py-3 border-b border-border/50">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {language === 'id' ? 'Filter:' : 'Filter:'}
                </span>
                <Link
                  to="/berita"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  <span className="capitalize">{tagDisplay}</span>
                  <X className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Tag Search & Popular Tags (show when no filter) */}
        {!tagParam && (
          <section className="py-6">
            <div className="container mx-auto px-4">
              {/* Search Input */}
              <div className="relative max-w-sm mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={language === 'id' ? 'Cari tag...' : 'Search tags...'}
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="pl-9 h-9 text-sm rounded-full bg-secondary border-0 focus-visible:ring-primary"
                />
                {tagSearch && (
                  <button
                    onClick={() => setTagSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Tags Label */}
              <p className="text-xs text-muted-foreground mb-3">
                {tagSearch 
                  ? (language === 'id' 
                      ? `${filteredTags.length} tag ditemukan` 
                      : `${filteredTags.length} tags found`)
                  : (language === 'id' ? `${allTags.length} tag tersedia` : `${allTags.length} tags available`)}
              </p>

              {/* Tags Grid */}
              {filteredTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredTags.map((tag, index) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(index * 0.015, 0.2) }}
                    >
                      <Link
                        to={`/berita?tag=${tag.toLowerCase().replace(/\s+/g, '-')}`}
                        className="inline-block px-3 py-1.5 bg-secondary text-muted-foreground rounded-full text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {tag}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Tag className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {language === 'id' 
                      ? `Tidak ada tag "${tagSearch}"` 
                      : `No tags matching "${tagSearch}"`}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* News Articles Grid */}
        <section className="py-8 md:py-10">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-bold text-foreground mb-5">
              {tagDisplay 
                ? (language === 'id' ? `Berita "${tagDisplay}"` : `"${tagDisplay}" News`)
                : (language === 'id' ? 'Semua Berita' : 'All News')}
            </h2>

            {filteredArticles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {visibleArticles.map((article, index) => (
                    <Link key={article.id} to={`/news/${article.slug}`}>
                      <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.03 }}
                        className="group cursor-pointer"
                      >
                        <div className="relative rounded-lg overflow-hidden bg-card aspect-[4/3]">
                          <img
                            src={article.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop'}
                            alt={article.title[language]}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 text-xs font-semibold bg-primary/90 text-primary-foreground rounded-full">
                              {article.category}
                            </span>
                          </div>
                          {article.club && (
                            <div className="absolute top-3 right-3">
                              <span className="w-8 h-8 flex items-center justify-center bg-background/80 rounded-full text-xs font-bold">
                                {article.club.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {article.title[language]}
                          </h3>
                          
                          {/* Tags preview */}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {article.tags.slice(0, 2).map((t, i) => (
                                <span 
                                  key={i}
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    t.toLowerCase().replace(/\s+/g, '-') === tagParam
                                      ? 'bg-primary/20 text-primary'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {t}
                                </span>
                              ))}
                              {article.tags.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{article.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-muted rounded-full text-xs">
                                {article.publisher.icon}
                              </span>
                              <span className="text-sm text-muted-foreground truncate max-w-[80px]">
                                {article.publisher.name}
                              </span>
                              {article.publisher.verified && (
                                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-primary fill-primary/20" />
                              )}
                              <span className="text-muted-foreground/50 flex-shrink-0">·</span>
                              <span className="text-sm text-muted-foreground truncate">
                                {article.timestamp}
                              </span>
                            </div>
                            <button className="p-1.5 hover:bg-muted rounded-md transition-colors flex-shrink-0">
                              <Bookmark className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    </Link>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button 
                      variant="outline" 
                      className="rounded-full px-8"
                      onClick={() => setVisibleCount(prev => prev + 10)}
                    >
                      {language === 'id' ? 'Muat Lebih Banyak' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Tag className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {language === 'id' 
                    ? 'Tidak ada artikel ditemukan' 
                    : 'No articles found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'id' 
                    ? `Tidak ada berita dengan tag "${tagDisplay}"` 
                    : `No news found with tag "${tagDisplay}"`}
                </p>
                <Link to="/berita">
                  <Button variant="outline" className="rounded-full">
                    {language === 'id' ? 'Lihat Semua Tag' : 'View All Tags'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* All Tags Section with Search (show when filtering) */}
        {tagParam && (
          <section className="py-8 border-t border-border/50">
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  {language === 'id' ? 'Tag Lainnya' : 'Other Tags'}
                </h2>
                
                {/* Search Input */}
                <div className="relative max-w-[200px] w-full">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={language === 'id' ? 'Cari...' : 'Search...'}
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="pl-8 h-8 text-xs rounded-full bg-secondary border-0 focus-visible:ring-primary"
                  />
                  {tagSearch && (
                    <button
                      onClick={() => setTagSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:bg-muted rounded-full transition-colors"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              {filteredTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {filteredTags.map((tag, index) => {
                    const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
                    const isActive = tagSlug === tagParam;
                    
                    return (
                      <Link
                        key={tag}
                        to={`/berita?tag=${tagSlug}`}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        {tag}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-3">
                  {language === 'id' 
                    ? `Tidak ada tag "${tagSearch}"` 
                    : `No tags "${tagSearch}"`}
                  <button
                    onClick={() => setTagSearch('')}
                    className="text-primary ml-2 hover:underline"
                  >
                    {language === 'id' ? 'Reset' : 'Reset'}
                  </button>
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BeritaTag;
