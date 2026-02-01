import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, X, CheckCircle, Bookmark, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FooterBanners from '@/components/FooterBanners';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { LazyImage } from '@/components/ui/LazyImage';

const BeritaTag: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(10);
  const [tagSearch, setTagSearch] = useState('');
  const tagParam = searchParams.get('tag');
  
  const tagDisplay = tagParam ? tagParam.replace(/-/g, ' ') : null;

  const { data: allArticles, isLoading } = useQuery({
    queryKey: ['berita-tag-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredArticles = tagParam
    ? (allArticles || []).filter(article => 
        article.tags?.some((t: string) => 
          t.toLowerCase().replace(/\s+/g, '-') === tagParam.toLowerCase() ||
          t.toLowerCase() === tagParam.toLowerCase().replace(/-/g, ' ')
        )
      )
    : allArticles || [];

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  const allTags = useMemo(() => 
    Array.from(new Set((allArticles || []).flatMap(article => article.tags || []))).sort() as string[],
    [allArticles]
  );

  const filteredTags = useMemo(() => 
    tagSearch.trim() ? allTags.filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase())) : allTags,
    [allTags, tagSearch]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-lg" />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/20 via-background to-background py-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-1">
              <Tag className="w-7 h-7 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground capitalize">
                {tagDisplay || (language === 'id' ? 'Semua Tag' : 'All Tags')}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              {tagDisplay ? `${filteredArticles.length} ${language === 'id' ? 'artikel' : 'articles'}` : `${allTags.length} tags`}
            </p>
          </div>
        </section>

        {!tagParam && (
          <section className="py-6 container mx-auto px-4">
            <div className="relative max-w-sm mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={language === 'id' ? 'Cari tag...' : 'Search tags...'} value={tagSearch} onChange={(e) => setTagSearch(e.target.value)} className="pl-9 h-9 rounded-full bg-secondary border-0" />
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => (
                <Link key={tag} to={`/berita?tag=${tag.toLowerCase().replace(/\s+/g, '-')}`} className="px-3 py-1.5 bg-secondary text-muted-foreground rounded-full text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
                  {tag}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="py-8 container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleArticles.map((article, index) => (
              <Link key={article.id} to={`/news/${article.slug}`}>
                <motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.03 }} className="group cursor-pointer">
                  <div className="relative rounded-lg overflow-hidden bg-card aspect-[4/3]">
                    <LazyImage src={article.featured_image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop'} alt={language === 'id' ? article.title_id : article.title_en} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" fallback="/placeholder.svg" />
                    <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold bg-primary/90 text-primary-foreground rounded-full">{article.category}</span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{language === 'id' ? article.title_id : article.title_en}</h3>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="rounded-full px-8" onClick={() => setVisibleCount(prev => prev + 10)}>{language === 'id' ? 'Muat Lebih' : 'Load More'}</Button>
            </div>
          )}
        </section>
      </main>
      <FooterBanners />
      <Footer />
    </div>
  );
};

export default BeritaTag;
