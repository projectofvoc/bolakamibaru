import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MoreNewsGrid from '@/components/MoreNewsGrid';
import { motion } from 'framer-motion';
import { ChevronRight, Facebook, Twitter, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();
  
  // Fetch article from database
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Increment view count when article is loaded
  useEffect(() => {
    if (article?.id) {
      supabase.rpc('increment_article_views', { article_id: article.id });
    }
  }, [article?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to 404 if article not found
  if (error || !article) {
    return <Navigate to="/not-found" replace />;
  }

  const title = language === 'id' ? article.title_id : article.title_en;
  const excerpt = language === 'id' ? article.excerpt_id : article.excerpt_en;
  const content = language === 'id' ? article.content_id : article.content_en;
  const authorName = article.author_name || 'BOLAKAMI';
  const publishedDate = article.published_at 
    ? format(new Date(article.published_at), 'dd MMMM yyyy')
    : format(new Date(article.created_at || new Date()), 'dd MMMM yyyy');

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      trending: '🔥 Trending',
      daily: '📰 Update Harian',
      analisa: '📊 Analisa',
    };
    return labels[category] || category;
  };

  // Share handlers
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = title;

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${currentUrl}`)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        {/* Centered Container - National Geographic Style */}
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-muted-foreground hover:text-primary">
                    {t('breadcrumb.home')}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-muted-foreground hover:text-primary cursor-pointer">
                  {getCategoryLabel(article.category)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground line-clamp-1 max-w-[200px]">
                  {title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Category Badge - Border style like NatGeo */}
            <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-widest border border-primary text-primary rounded-full mb-6">
              {getCategoryLabel(article.category)}
            </span>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              {title}
            </h1>
            
            {/* Lead Paragraph - Excerpt */}
            {excerpt && (
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                {excerpt}
              </p>
            )}
            
            {/* Author & Date with Share buttons - same line */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              {/* Left: Publisher Info */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t('news.by')} {authorName}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{publishedDate}</span>
                </div>
              </div>
              
              {/* Right: Share buttons - Footer style (no colors) */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-1">Share</span>
                <button 
                  onClick={handleShareFacebook}
                  aria-label="Share to Facebook"
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleShareTwitter}
                  aria-label="Share to Twitter"
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleShareWhatsApp}
                  aria-label="Share to WhatsApp"
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Featured Image - Full width */}
            {article.featured_image && (
              <>
                <div className="relative w-full aspect-[16/9] overflow-hidden mb-2">
                  <img
                    src={article.featured_image}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image Caption - Not italic, centered */}
                <p className="text-sm text-muted-foreground mb-10 text-center">
                  {article.publisher_name || 'BOLAKAMI'} / {authorName}
                </p>
              </>
            )}
            
            {/* Article Body - HTML Content */}
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            
            {/* Tags Section */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-8 pt-8 border-t border-border">
                <span className="text-sm text-muted-foreground mr-2">Tags:</span>
                {article.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/berita?tag=${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-3 py-1.5 bg-secondary text-sm text-muted-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </motion.article>
        </div>
        
        {/* Related News Section */}
        <div className="mt-16">
          <div className="container mx-auto px-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {t('news.relatedNews')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('news.relatedNewsSubtitle')}
            </p>
          </div>
          <MoreNewsGrid />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewsDetail;
