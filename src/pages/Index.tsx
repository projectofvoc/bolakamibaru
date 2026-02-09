import React from 'react';
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
import PointsWidget from '@/components/PointsWidget';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdvertisementPopup />
      <DailyCheckinPopup />
      <SidebarBanners />
      <PointsWidget />
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
