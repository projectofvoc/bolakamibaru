import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroDashboard from '@/components/HeroDashboard';
import BestMomentsCarousel from '@/components/BestMomentsCarousel';
import NewsGrid from '@/components/NewsGrid';
import UpcomingMatches from '@/components/UpcomingMatches';
import LatestUpdates from '@/components/LatestUpdates';
import AICompanion from '@/components/AICompanion';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroDashboard />
        <BestMomentsCarousel />
        <NewsGrid />
        <UpcomingMatches />
        <LatestUpdates />
        <AICompanion />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
