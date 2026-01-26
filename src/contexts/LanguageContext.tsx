// Language context for bilingual support (ID/EN)
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
  'liga.liga2': { id: 'Liga 2 Indonesia', en: 'Liga 2 Indonesia' },
  'liga.premierLeague': { id: 'Premier League', en: 'Premier League' },
  'liga.laLiga': { id: 'La Liga', en: 'La Liga' },
  'liga.serieA': { id: 'Serie A', en: 'Serie A' },
  'liga.bundesliga': { id: 'Bundesliga', en: 'Bundesliga' },
  'liga.championsLeague': { id: 'Liga Champions', en: 'Champions League' },
  
  // Berita Submenu
  'berita.trending': { id: 'Trending', en: 'Trending' },
  'berita.daily': { id: 'Update Harian', en: 'Daily Updates' },
  'berita.analisa': { id: 'Analisa Klub', en: 'Club Analysis' },
  'berita.klasemen': { id: 'Klasemen', en: 'Standings' },
  'nav.standings': { id: 'KLASEMEN', en: 'STANDINGS' },
  
  // Klasemen Page
  'klasemen.title': { id: 'Klasemen', en: 'Standings' },
  'klasemen.selectLeague': { id: 'Pilih Liga', en: 'Select League' },
  'klasemen.position': { id: 'Pos', en: 'Pos' },
  'klasemen.team': { id: 'Tim', en: 'Team' },
  'klasemen.played': { id: 'Main', en: 'P' },
  'klasemen.won': { id: 'M', en: 'W' },
  'klasemen.drawn': { id: 'S', en: 'D' },
  'klasemen.lost': { id: 'K', en: 'L' },
  'klasemen.points': { id: 'Poin', en: 'Pts' },
  'klasemen.goalsFor': { id: 'GM', en: 'GF' },
  'klasemen.goalsAgainst': { id: 'GK', en: 'GA' },
  'klasemen.goalDiff': { id: '+/-', en: 'GD' },
  'klasemen.relegation': { id: 'Degradasi', en: 'Relegation' },
  'klasemen.noData': { id: 'Belum ada data klasemen untuk liga ini.', en: 'No standings data available for this league.' },
  'klasemen.loadError': { id: 'Gagal memuat data klasemen. Silakan coba lagi.', en: 'Failed to load standings. Please try again.' },
  
  // Hero
  'hero.readMore': { id: 'Baca Selengkapnya', en: 'Read More' },
  
  // Sections
  'section.bestMoments': { id: 'Momen Terbaik 2025/26', en: 'Best Moments of 2025/26' },
  'section.bestMomentsSubtitle': { id: 'Highlight dan aksi terbaik dari lapangan hijau', en: 'Highlights and best actions from the pitch' },
  'section.moreMoments': { id: 'Momen Lainnya', en: 'More Moments' },
  'section.moreNews': { id: 'Berita Lainnya', en: 'More News' },
  'section.fromClubs': { id: 'Dari Klub-Klub', en: 'From the Clubs' },
  'section.fromClubsSubtitle': { id: 'Berita dan update langsung dari klub favoritmu', en: 'News and updates directly from your favorite clubs' },
  'section.latestUpdates': { id: 'Update Terbaru', en: 'Latest Updates' },
  'section.seeMore': { id: 'Lihat Lebih Banyak', en: 'See More' },
  'section.upcomingMatches': { id: 'Jadwal Terdekat', en: 'Upcoming Matches' },
  'section.upcomingMatchesSubtitle': { id: 'Pertandingan yang akan datang minggu ini', en: 'Upcoming matches this week' },
  'match.quickAnalysis': { id: 'Analisa Cepat', en: 'Quick Analysis' },
  'button.loadMore': { id: 'Muat Lebih Banyak', en: 'Load More' },
  
  // Live Score Widget
  'liveScore.title': { id: 'Skor Live', en: 'Live Scores' },
  'liveScore.league': { id: 'Liga', en: 'League' },
  'liveScore.match': { id: 'Pertandingan', en: 'Match' },
  'liveScore.score': { id: 'Skor', en: 'Score' },
  'liveScore.status': { id: 'Status', en: 'Status' },
  'liveScore.viewAll': { id: 'Lihat semua', en: 'View all' },
  
  // AI Companion
  'ai.headline1': { id: 'Mau menang parlay?', en: 'Want to win parlay?' },
  'ai.headline2': { id: 'Gue bantu lu analisa!', en: 'Let me help you analyze!' },
  'ai.subtitle': { id: 'Live score + alert odds drop! Waktunya cuan!', en: 'Live score + odds drop alerts! Time to win!' },
  'ai.placeholder': { id: 'Contoh: Analisa MU vs Arsenal, fokus BTTS + odds...', en: 'Example: Analyze MU vs Arsenal, focus on BTTS + odds...' },
  'ai.prompt1': { id: 'Siapa pencetak gol terbanyak Liga 1?', en: 'Who is the top scorer in Liga 1?' },
  'ai.prompt2': { id: 'Jadwal pertandingan Persebaya', en: 'Persebaya match schedule' },
  'ai.prompt3': { id: 'Statistik pemain terbaik', en: 'Best player statistics' },
  'ai.chatTitle': { id: 'Predicto AI Assistant', en: 'Predicto AI Assistant' },
  'ai.chatSubtitle': { id: 'Siap bantu analisa parlay kamu', en: 'Ready to help analyze your parlay' },
  
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
  
  // Auth
  'auth.login': { id: 'Masuk', en: 'Login' },
  'auth.register': { id: 'Daftar', en: 'Register' },
  'auth.loginSubtitle': { id: 'Selamat datang kembali!', en: 'Welcome back!' },
  'auth.registerSubtitle': { id: 'Buat akun baru', en: 'Create a new account' },
  'auth.email': { id: 'Email', en: 'Email' },
  'auth.password': { id: 'Kata Sandi', en: 'Password' },
  'auth.whatsapp': { id: 'Nomor WhatsApp', en: 'WhatsApp Number' },
  'auth.whatsappHint': { id: 'Masukkan nomor tanpa angka 0 di depan', en: 'Enter number without leading 0' },
  'auth.loginButton': { id: 'Masuk', en: 'Sign In' },
  'auth.registerButton': { id: 'Daftar Sekarang', en: 'Sign Up Now' },
  'auth.forgotPassword': { id: 'Lupa kata sandi?', en: 'Forgot password?' },
  'auth.noAccount': { id: 'Belum punya akun?', en: "Don't have an account?" },
  'auth.hasAccount': { id: 'Sudah punya akun?', en: 'Already have an account?' },
  'auth.termsAgree': { id: 'Saya setuju dengan', en: 'I agree to the' },
  'auth.termsLink': { id: 'Syarat & Ketentuan', en: 'Terms & Conditions' },
  'auth.privacyLink': { id: 'Kebijakan Privasi', en: 'Privacy Policy' },
  'auth.and': { id: 'dan', en: 'and' },
  'auth.or': { id: 'atau', en: 'or' },
  'auth.continueWithGoogle': { id: 'Lanjutkan dengan Google', en: 'Continue with Google' },
  'auth.loginSuccess': { id: 'Login berhasil!', en: 'Login successful!' },
  'auth.registerSuccess': { id: 'Registrasi berhasil!', en: 'Registration successful!' },
  'auth.welcomeBack': { id: 'Selamat datang kembali di BOLAKAMI', en: 'Welcome back to BOLAKAMI' },
  'auth.accountCreated': { id: 'Akun kamu berhasil dibuat', en: 'Your account has been created' },
  'auth.forgotPasswordTitle': { id: 'Lupa kata sandi?', en: 'Forgot password?' },
  'auth.resetPassword': { id: 'Reset Kata Sandi', en: 'Reset Password' },
  'auth.resetPasswordDesc': { id: 'Masukkan email kamu dan kami akan mengirimkan link untuk reset kata sandi.', en: 'Enter your email and we will send you a link to reset your password.' },
  'auth.sendResetLink': { id: 'Kirim Link Reset', en: 'Send Reset Link' },
  'auth.backToLogin': { id: 'Kembali ke Login', en: 'Back to Login' },
  'auth.checkYourEmail': { id: 'Cek Email Kamu', en: 'Check Your Email' },
  'auth.resetEmailSent': { id: 'Email reset terkirim!', en: 'Reset email sent!' },
  'auth.resetEmailSentTo': { id: 'Kami sudah mengirimkan link reset ke', en: 'We have sent a reset link to' },
  'auth.checkInbox': { id: 'Silakan cek inbox email kamu', en: 'Please check your email inbox' },
  'auth.didntReceiveEmail': { id: 'Tidak menerima email? Kirim ulang', en: "Didn't receive email? Resend" },
  
  // News Detail
  'breadcrumb.home': { id: 'Beranda', en: 'Home' },
  'news.publishedOn': { id: 'Dipublikasikan pada', en: 'Published on' },
  'news.popularNews': { id: 'Berita Populer', en: 'Popular News' },
  'news.shares': { id: 'Shares', en: 'Shares' },
  'news.by': { id: 'Oleh', en: 'By' },
  'news.relatedNews': { id: 'Berita Terkait', en: 'Related News' },
  'news.relatedNewsSubtitle': { id: 'Artikel lain yang mungkin kamu suka', en: 'Other articles you might like' },
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
