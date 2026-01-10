import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import BestMomentsCarousel from '@/components/BestMomentsCarousel';
import NewsGrid from '@/components/NewsGrid';
import LatestUpdates from '@/components/LatestUpdates';
import AICompanion from '@/components/AICompanion';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <BestMomentsCarousel />
        <NewsGrid />
        <LatestUpdates />
        <AICompanion />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
