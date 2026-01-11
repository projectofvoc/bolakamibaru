import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, Calendar, BarChart3, CheckCircle, Bookmark } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles, featuredArticle } from '@/data/dummyData';
import { Button } from '@/components/ui/button';

interface FilterInfo {
  id: string;
  name: { id: string; en: string };
  icon: React.ElementType;
  description: { id: string; en: string };
}

const filterTypes: FilterInfo[] = [
  { 
    id: 'trending', 
    name: { id: 'Trending', en: 'Trending' }, 
    icon: TrendingUp,
    description: { id: 'Berita paling populer dan viral', en: 'Most popular and viral news' }
  },
  { 
    id: 'daily', 
    name: { id: 'Update Harian', en: 'Daily Updates' }, 
    icon: Calendar,
    description: { id: 'Berita terbaru hari ini', en: 'Today\'s latest news' }
  },
  { 
    id: 'analisa', 
    name: { id: 'Analisa', en: 'Analysis' }, 
    icon: BarChart3,
    description: { id: 'Artikel analisa mendalam', en: 'In-depth analysis articles' }
  },
];

const Berita: React.FC = () => {
  const { filter } = useParams<{ filter?: string }>();
  const { language, t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(8);

  const currentFilter = filter ? filterTypes.find(f => f.id === filter) : null;
  
  // All articles (in real app, would filter by type)
  const allArticles = [featuredArticle, ...articles];
  const visibleArticles = allArticles.slice(0, visibleCount);
  const hasMore = visibleCount < allArticles.length;

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
              {currentFilter ? (
                <currentFilter.icon className="w-8 h-8 text-primary" />
              ) : (
                <Newspaper className="w-8 h-8 text-primary" />
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {currentFilter 
                  ? currentFilter.name[language] 
                  : (language === 'id' ? 'Berita' : 'News')}
              </h1>
            </motion.div>
            <p className="text-muted-foreground">
              {currentFilter 
                ? currentFilter.description[language]
                : (language === 'id' 
                    ? 'Semua berita dan artikel sepak bola terkini' 
                    : 'All the latest football news and articles')}
            </p>
          </div>
        </section>

        {/* Filter Navigation */}
        <section className="py-4 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {filterTypes.map((f, idx) => (
                <Link key={f.id} to={`/berita/${f.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Button 
                      variant={f.id === filter ? 'default' : 'ghost'} 
                      size="sm" 
                      className="rounded-full whitespace-nowrap gap-2"
                    >
                      <f.icon className="w-4 h-4" />
                      {f.name[language]}
                    </Button>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article (only on trending) */}
        {filter === 'trending' && featuredArticle && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <Link to={`/news/${featuredArticle.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative rounded-2xl overflow-hidden bg-card aspect-[21/9] group cursor-pointer"
                >
                  <img 
                    src={featuredArticle.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=500&fit=crop'}
                    alt={featuredArticle.title[language]}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <span className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full mb-4 inline-block">
                      {featuredArticle.category}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 line-clamp-2">
                      {featuredArticle.title[language]}
                    </h2>
                    <p className="text-white/80 text-sm md:text-base line-clamp-2 max-w-3xl">
                      {featuredArticle.excerpt[language]}
                    </p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </section>
        )}

        {/* News Articles Grid */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {currentFilter 
                ? currentFilter.name[language]
                : (language === 'id' ? 'Semua Berita' : 'All News')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleArticles.map((article, index) => (
                <Link key={article.id} to={`/news/${article.slug}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative rounded-lg overflow-hidden bg-card aspect-[4/3]">
                      <img
                        src={article.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop'}
                        alt={article.title[language]}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-xs font-semibold bg-primary/90 text-primary-foreground rounded-full">
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
                  onClick={() => setVisibleCount(prev => prev + 8)}
                >
                  {language === 'id' ? 'Muat Lebih Banyak' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Berita;
