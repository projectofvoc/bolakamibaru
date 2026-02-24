import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FooterBanners from '@/components/FooterBanners';
import HeroDashboard from '@/components/HeroDashboard';
import BestMomentsCarousel from '@/components/BestMomentsCarousel';
import NewsGrid from '@/components/NewsGrid';
import UpcomingMatches from '@/components/UpcomingMatches';
import AICompanion from '@/components/AICompanion';
import MoreNewsGrid from '@/components/MoreNewsGrid';
import AdvertisementPopup from '@/components/AdvertisementPopup';
import SidebarBanners from '@/components/SidebarBanners';
import DailyCheckinPopup from '@/components/DailyCheckinPopup';


const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>BOLAKAMI - Portal Berita Sepak Bola Indonesia</title>
        <meta name="description" content="Berita sepak bola terbaru, live score, klasemen, dan jadwal pertandingan Liga 1 Indonesia, Premier League, La Liga, Serie A, Bundesliga, dan Liga Champions." />
        <meta property="og:title" content="BOLAKAMI - Portal Berita Sepak Bola Indonesia" />
        <meta property="og:description" content="Berita sepak bola terbaru, live score, klasemen, dan jadwal pertandingan dari liga-liga top dunia." />
        <meta property="og:image" content="https://bolakami.com/og-bolakami.png" />
        <meta property="og:url" content="https://bolakami.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="BOLAKAMI" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BOLAKAMI - Portal Berita Sepak Bola Indonesia" />
        <meta name="twitter:description" content="Berita sepak bola terbaru, live score, klasemen, dan jadwal pertandingan." />
        <meta name="twitter:image" content="https://bolakami.com/og-bolakami.png" />
        <link rel="canonical" href="https://bolakami.com/" />
      </Helmet>
      <AdvertisementPopup />
      <DailyCheckinPopup />
      <SidebarBanners />
      
      <Header />
      <main>
        <HeroDashboard />
        <BestMomentsCarousel />
        <NewsGrid />
        <UpcomingMatches />
        <AICompanion />
        <MoreNewsGrid />
      </main>
      <FooterBanners />
      <Footer />
    </div>
  );
};

export default Index;
