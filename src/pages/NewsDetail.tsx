import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { articles, featuredArticle } from '@/data/dummyData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { ChevronRight, Facebook, Twitter } from 'lucide-react';
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

  // Get first paragraph as lead/excerpt
  const paragraphs = article.content[language].split('\n\n');
  const leadParagraph = paragraphs[0];
  const bodyParagraphs = paragraphs.slice(1);

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
          
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Category Badge - Border style like NatGeo */}
            <span className="inline-block px-3 py-1.5 text-xs font-semibold uppercase tracking-widest border border-primary text-primary mb-6">
              {article.category}
            </span>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              {article.title[language]}
            </h1>
            
            {/* Lead Paragraph - Not italic */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
              {article.excerpt[language]}
            </p>
            
            {/* Author & Date - With publisher icon for consistency */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8">
              {/* Publisher Icon */}
              {article.publisher.icon.startsWith('http') ? (
                <img 
                  src={article.publisher.icon} 
                  alt={article.publisher.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg">{article.publisher.icon}</span>
              )}
              <span className="font-medium text-foreground">{t('news.by')} {article.author}</span>
              <span>•</span>
              <span>{article.date}</span>
            </div>
            
            {/* Featured Image - Full width */}
            <div className="relative w-full aspect-[16/9] overflow-hidden mb-2">
              <img
                src={article.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=675&fit=crop'}
                alt={article.title[language]}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Caption - Not italic, centered */}
            <p className="text-sm text-muted-foreground mb-10 text-center">
              {article.publisher.name} / {article.author}
            </p>
            
            {/* Article Body */}
            <div className="space-y-6">
              {/* First paragraph with drop cap effect */}
              <p className="text-foreground text-lg leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-primary">
                {leadParagraph}
              </p>
              
              {/* Remaining paragraphs */}
              {bodyParagraphs.map((paragraph, index) => (
                <p key={index} className="text-foreground text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {/* Social Share Bar - Bottom only */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Share</span>
                <div className="flex gap-3">
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewsDetail;
