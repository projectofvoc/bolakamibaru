import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.live': { id: 'LIVE', en: 'LIVE' },
  'nav.prediksiAI': { id: 'PREDIKSI AI', en: 'AI PREDICTIONS' },
  'nav.liga': { id: 'LIGA', en: 'LEAGUES' },
  'nav.berita': { id: 'BERITA', en: 'NEWS' },
  
  // Liga Submenu
  'liga.all': { id: 'Semua Liga', en: 'All Leagues' },
  'liga.liga1': { id: 'Liga 1 Indonesia', en: 'Liga 1 Indonesia' },
  'liga.premierLeague': { id: 'Premier League', en: 'Premier League' },
  'liga.laLiga': { id: 'La Liga', en: 'La Liga' },
  'liga.serieA': { id: 'Serie A', en: 'Serie A' },
  'liga.bundesliga': { id: 'Bundesliga', en: 'Bundesliga' },
  'liga.championsLeague': { id: 'Liga Champions', en: 'Champions League' },
  
  // Berita Submenu
  'berita.trending': { id: 'Trending', en: 'Trending' },
  'berita.daily': { id: 'Update Harian', en: 'Daily Updates' },
  'berita.analisa': { id: 'Analisa Klub', en: 'Club Analysis' },
  'nav.standings': { id: 'KLASEMEN', en: 'STANDINGS' },
  
  // Hero
  'hero.readMore': { id: 'Baca Selengkapnya', en: 'Read More' },
  
  // Sections
  'section.bestMoments': { id: 'Momen Terbaik 2025/26', en: 'Best Moments of 2025/26' },
  'section.moreMoments': { id: 'Momen Lainnya', en: 'More Moments' },
  'section.moreNews': { id: 'Berita Lainnya', en: 'More News' },
  'section.fromClubs': { id: 'Dari Klub-Klub', en: 'From the Clubs' },
  'section.latestUpdates': { id: 'Update Terbaru', en: 'Latest Updates' },
  'section.seeMore': { id: 'Lihat Lebih Banyak', en: 'See More' },
  'section.upcomingMatches': { id: 'Jadwal Terdekat', en: 'Upcoming Matches' },
  'match.quickAnalysis': { id: 'Analisa Cepat', en: 'Quick Analysis' },
  'button.loadMore': { id: 'Muat Lebih Banyak', en: 'Load More' },
  
  // AI Companion
  'ai.headline1': { id: 'Mau menang parlay?', en: 'Want to win parlay?' },
  'ai.headline2': { id: 'Gue bantu lu analisa!', en: 'Let me help you analyze!' },
  'ai.subtitle': { id: 'Live score + alert odds drop! Waktunya cuan!', en: 'Live score + odds drop alerts! Time to win!' },
  'ai.placeholder': { id: 'Contoh: Analisa MU vs Arsenal, fokus BTTS + odds...', en: 'Example: Analyze MU vs Arsenal, focus on BTTS + odds...' },
  'ai.prompt1': { id: 'Siapa pencetak gol terbanyak Liga 1?', en: 'Who is the top scorer in Liga 1?' },
  'ai.prompt2': { id: 'Jadwal pertandingan Persebaya', en: 'Persebaya match schedule' },
  'ai.prompt3': { id: 'Statistik pemain terbaik', en: 'Best player statistics' },
  
  // Fixtures
  'fixtures.allUpdates': { id: 'SEMUA UPDATE', en: 'ALL UPDATES' },
  'fixtures.live': { id: 'LANGSUNG', en: 'LIVE' },
  'fixtures.finished': { id: 'SELESAI', en: 'FINISHED' },
  'fixtures.scheduled': { id: 'TERJADWAL', en: 'SCHEDULED' },
  'fixtures.today': { id: 'Hari Ini', en: 'Today' },
  
  // Match Status
  'status.live': { id: 'LANGSUNG', en: 'LIVE' },
  'status.ft': { id: 'FT', en: 'FT' },
  'status.post': { id: 'POST', en: 'POST' },
  
  // Footer
  'footer.about': { id: 'Tentang Kami', en: 'About Us' },
  'footer.leagues': { id: 'Liga', en: 'Leagues' },
  'footer.quickLinks': { id: 'Tautan Cepat', en: 'Quick Links' },
  'footer.social': { id: 'Media Sosial', en: 'Social Media' },
  'footer.copyright': { id: '© 2025 BOLAKAMI. Semua hak dilindungi.', en: '© 2025 BOLAKAMI. All rights reserved.' },
  'footer.aboutText': { id: 'Bolakami adalah portal sepak bola terlengkap di Indonesia yang menyajikan update skor, jadwal, dan berita terbaru, plus prediksi parlay berbasis AI yang cerdas dan live streaming pertandingan favoritmu — semua dalam satu tempat', en: 'Bolakami is the most complete football portal in Indonesia, delivering live scores, fixtures, and the latest news, plus smart AI-powered parlay predictions and live streaming of your favorite matches — all in one place' },
  
  // Common
  'common.search': { id: 'Cari...', en: 'Search...' },
  'common.minutes': { id: 'menit', en: 'minutes' },
  'common.hours': { id: 'jam', en: 'hours' },
  'common.ago': { id: 'yang lalu', en: 'ago' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bolakami-lang');
    return (saved as Language) || 'id';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bolakami-lang', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
