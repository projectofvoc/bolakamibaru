import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Facebook, Twitter, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface ArticlePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title_id: string;
    title_en: string;
    excerpt_id: string;
    excerpt_en: string;
    content_id: string;
    content_en: string;
    featured_image: string;
    category: string;
    author_name: string;
    tags: string[];
    badges: string[];
  };
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ isOpen, onClose, article }) => {
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const title = language === 'id' ? article.title_id : article.title_en;
  const excerpt = language === 'id' ? article.excerpt_id : article.excerpt_en;
  const content = language === 'id' ? article.content_id : article.content_en;
  const currentDate = format(new Date(), 'dd MMMM yyyy');

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      trending: '🔥 Trending',
      daily: '📰 Update Harian',
      analisa: '📊 Analisa',
    };
    return labels[category] || category;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Preview Header */}
        <DialogHeader className="p-4 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Preview Artikel</DialogTitle>
            <div className="flex items-center gap-4 mr-8">
              {/* Language Toggle */}
              <Tabs value={language} onValueChange={(v) => setLanguage(v as 'id' | 'en')}>
                <TabsList className="h-8">
                  <TabsTrigger value="id" className="text-xs px-3 h-6">🇮🇩 ID</TabsTrigger>
                  <TabsTrigger value="en" className="text-xs px-3 h-6">🇬🇧 EN</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Device Toggle */}
              <Tabs value={device} onValueChange={(v) => setDevice(v as 'desktop' | 'mobile')}>
                <TabsList className="h-8">
                  <TabsTrigger value="desktop" className="text-xs px-3 h-6">
                    <Monitor className="w-3 h-3 mr-1" />
                    Desktop
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="text-xs px-3 h-6">
                    <Smartphone className="w-3 h-3 mr-1" />
                    Mobile
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className={`mx-auto transition-all duration-300 ${device === 'mobile' ? 'max-w-sm' : 'max-w-4xl'}`}>
            {/* Simulated Browser Chrome */}
            <div className="bg-muted/30 border-b border-border px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-primary/50" />
                </div>
                <div className="flex-1 bg-input rounded px-3 py-1 text-xs text-muted-foreground truncate">
                  bolakami.com/news/{article.title_id.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}
                </div>
              </div>
            </div>

            {/* Article Preview - Matching NewsDetail Layout */}
            <div className="p-4 md:p-8">
              {/* Breadcrumb */}
              <Breadcrumb className="mb-8">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <span className="text-muted-foreground">Beranda</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="w-4 h-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <span className="text-muted-foreground">{getCategoryLabel(article.category)}</span>
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

              {/* Category Badge */}
              <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-widest border border-primary text-primary rounded-full mb-6">
                {getCategoryLabel(article.category)}
              </span>

              {/* Badges */}
              {article.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.badges.map((badge) => (
                    <Badge key={badge} variant="secondary" className="text-xs">
                      {badge === 'new' && '🆕 NEW'}
                      {badge === 'viral' && '🔥 VIRAL'}
                      {badge === 'popular' && '⭐ POPULAR'}
                      {badge === 'trending' && '📈 TRENDING'}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className={`font-bold text-foreground leading-tight mb-6 ${device === 'mobile' ? 'text-2xl' : 'text-3xl md:text-4xl lg:text-5xl'}`}>
                {title || 'Judul Artikel...'}
              </h1>

              {/* Excerpt */}
              {excerpt && (
                <p className={`text-muted-foreground leading-relaxed mb-6 ${device === 'mobile' ? 'text-base' : 'text-lg md:text-xl'}`}>
                  {excerpt}
                </p>
              )}

              {/* Author & Date */}
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">By {article.author_name || 'Anonymous'}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{currentDate}</span>
                  </div>
                </div>
                
                {/* Share buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-1">Share</span>
                  <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <Twitter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Featured Image */}
              {article.featured_image && (
                <>
                  <div className="relative w-full aspect-[16/9] overflow-hidden mb-2">
                    <img
                      src={article.featured_image}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-10 text-center">
                    {article.author_name || 'BOLAKAMI'} / Gambar Utama
                  </p>
                </>
              )}

              {/* Article Content */}
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: content || '<p>Konten artikel akan muncul di sini...</p>' }}
              />

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-8 pt-8 border-t border-border">
                  <span className="text-sm text-muted-foreground mr-2">Tags:</span>
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-secondary text-sm text-muted-foreground rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticlePreview;
