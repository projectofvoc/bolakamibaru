import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, X, CheckCircle, Bookmark } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles, featuredArticle } from '@/data/dummyData';
import { Button } from '@/components/ui/button';

const BeritaTag: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(10);

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
  const allTags = Array.from(
    new Set(allArticles.flatMap(article => article.tags || []))
  ).sort();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/20 via-background to-background py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <Tag className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {tagDisplay 
                  ? <span className="capitalize">{tagDisplay}</span>
                  : (language === 'id' ? 'Semua Tag' : 'All Tags')}
              </h1>
            </motion.div>
            <p className="text-muted-foreground">
              {tagDisplay
                ? (language === 'id' 
                    ? `Menampilkan ${filteredArticles.length} artikel dengan tag "${tagDisplay}"` 
                    : `Showing ${filteredArticles.length} articles tagged "${tagDisplay}"`)
                : (language === 'id' 
                    ? 'Jelajahi berita berdasarkan topik' 
                    : 'Explore news by topic')}
            </p>
          </div>
        </section>

        {/* Active Tag Filter Badge */}
        {tagParam && (
          <section className="py-4 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Filter aktif:' : 'Active filter:'}
                </span>
                <Link
                  to="/berita"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <span className="capitalize">{tagDisplay}</span>
                  <X className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Popular Tags (show when no filter) */}
        {!tagParam && (
          <section className="py-6 border-b border-border">
            <div className="container mx-auto px-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                {language === 'id' ? 'Tag Populer' : 'Popular Tags'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 15).map((tag, index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link
                      to={`/berita?tag=${tag.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-4 py-2 bg-secondary text-muted-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {tag}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* News Articles Grid */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {tagDisplay 
                ? (language === 'id' ? `Berita tentang "${tagDisplay}"` : `News about "${tagDisplay}"`)
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

        {/* All Tags Section (show when filtering) */}
        {tagParam && (
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-bold text-foreground mb-6">
                {language === 'id' ? 'Jelajahi Tag Lainnya' : 'Explore Other Tags'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag, index) => {
                  const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
                  const isActive = tagSlug === tagParam;
                  
                  return (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Link
                        to={`/berita?tag=${tagSlug}`}
                        className={`px-4 py-2 rounded-full text-sm transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        {tag}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BeritaTag;
