import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles, featuredArticle } from '@/data/dummyData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PopularNewsSidebar from '@/components/PopularNewsSidebar';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, Calendar, CheckCircle, Share2, Bookmark, Facebook, Twitter } from 'lucide-react';
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
  
  // Find article by slug
  const allArticles = [featuredArticle, ...articles];
  const article = allArticles.find(a => a.slug === slug);
  
  // Redirect to 404 if article not found
  if (!article) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
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
                  {article.category}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground line-clamp-1 max-w-[200px]">
                  {article.title[language]}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          {/* Category Badge */}
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full mb-4">
            {article.category}
          </span>
          
          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
            {article.title[language]}
          </h1>
          
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Publisher */}
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-muted rounded-full text-sm">
                {article.publisher.icon}
              </span>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground">
                    {article.publisher.name}
                  </span>
                  {article.publisher.verified && (
                    <CheckCircle className="w-3.5 h-3.5 text-primary fill-primary/20" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {t('news.by')} {article.author}
                </span>
              </div>
            </div>
            
            {/* Separator */}
            <span className="text-muted-foreground">•</span>
            
            {/* Date */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{article.date}</span>
            </div>
            
            {/* Timestamp */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{article.timestamp}</span>
            </div>
            
            {/* Share buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                <Share2 className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                <Bookmark className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          
          {/* Main Content Grid - starts at image level */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Main Content */}
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-8"
            >
              {/* Featured Image */}
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-8">
                <img
                  src={article.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=675&fit=crop'}
                  alt={article.title[language]}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                {article.content[language].split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-foreground/90 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {/* Social Share Bar */}
              <div className="mt-10 pt-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Share:</span>
                  <div className="flex gap-2">
                    <button className="p-2.5 bg-[#1877F2] hover:bg-[#1877F2]/90 rounded-full transition-colors">
                      <Facebook className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-2.5 bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 rounded-full transition-colors">
                      <Twitter className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-2.5 bg-[#25D366] hover:bg-[#25D366]/90 rounded-full transition-colors">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
            
            {/* Right Column - Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24">
                <PopularNewsSidebar />
              </div>
            </aside>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewsDetail;
