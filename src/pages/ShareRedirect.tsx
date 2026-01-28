import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

// Helper to update meta tags for OG crawlers
const updateMetaTags = (article: { 
  title_id: string; 
  title_en: string; 
  excerpt_id?: string | null; 
  excerpt_en?: string | null; 
  featured_image?: string | null; 
  slug: string 
}) => {
  const title = article.title_id; // Default to Indonesian for share
  const description = article.excerpt_id || article.excerpt_en || 'Baca berita terbaru di BOLAKAMI';
  const ogImage = article.featured_image || 'https://bolakamibaru.lovable.app/og-bolakami.png';
  const articleUrl = `https://bolakamibaru.lovable.app/news/${article.slug}`;

  // Update document title
  document.title = `${title} | BOLAKAMI`;

  // Helper to set or create meta tag
  const setMetaTag = (property: string, content: string, isName = false) => {
    const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      if (isName) {
        meta.setAttribute('name', property);
      } else {
        meta.setAttribute('property', property);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  // Update Open Graph meta tags
  setMetaTag('og:title', title);
  setMetaTag('og:description', description);
  setMetaTag('og:image', ogImage);
  setMetaTag('og:url', articleUrl);
  setMetaTag('og:type', 'article');
  setMetaTag('og:site_name', 'BOLAKAMI');

  // Update Twitter Card meta tags
  setMetaTag('twitter:card', 'summary_large_image', true);
  setMetaTag('twitter:title', title, true);
  setMetaTag('twitter:description', description, true);
  setMetaTag('twitter:image', ogImage, true);

  // Update description meta tag
  setMetaTag('description', description, true);
};

const ShareRedirect: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Fetch article from database
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['share-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, title_id, title_en, excerpt_id, excerpt_en, featured_image')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Update meta tags and redirect when article loads
  useEffect(() => {
    if (article) {
      // Set OG meta tags for crawlers
      updateMetaTags(article);
      
      // Small delay to let crawlers read meta tags before redirect
      const timer = setTimeout(() => {
        navigate(`/news/${slug}`, { replace: true });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [article, slug, navigate]);

  // Handle error - redirect to article page anyway
  useEffect(() => {
    if (error && slug) {
      navigate(`/news/${slug}`, { replace: true });
    }
  }, [error, slug, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Memuat berita...</p>
    </div>
  );
};

export default ShareRedirect;
