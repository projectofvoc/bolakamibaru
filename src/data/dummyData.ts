export interface Article {
  id: string;
  title: { id: string; en: string };
  excerpt: { id: string; en: string };
  image: string;
  category: string;
  author: string;
  timestamp: string;
  club?: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  time: string;
  status: 'live' | 'ft' | 'scheduled' | 'post';
  league: string;
  leagueCountry: string;
  minute?: number;
}

export interface League {
  id: string;
  name: string;
  country: string;
  icon: string;
}

export const featuredArticle: Article = {
  id: '1',
  title: {
    id: 'Persebaya Raih Kemenangan Dramatis di Menit Akhir Melawan Arema',
    en: 'Persebaya Secures Dramatic Last-Minute Victory Against Arema'
  },
  excerpt: {
    id: 'Gol injury time dari David da Silva membawa Persebaya meraih tiga poin penting dalam Derby Jawa Timur.',
    en: 'Injury time goal from David da Silva brings Persebaya crucial three points in East Java Derby.'
  },
  image: '',
  category: 'Liga 1',
  author: 'Ahmad Rizky',
  timestamp: '2 jam lalu'
};

export const articles: Article[] = [
  {
    id: '2',
    title: {
      id: 'Persija Umumkan Pelatih Baru Untuk Musim Depan',
      en: 'Persija Announces New Coach For Next Season'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
    category: 'Transfer',
    author: 'Budi Santoso',
    timestamp: '3 jam lalu',
    club: 'Persija'
  },
  {
    id: '3',
    title: {
      id: 'Madura United Perkuat Lini Depan dengan Striker Asing',
      en: 'Madura United Strengthens Attack with Foreign Striker'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=250&fit=crop',
    category: 'Transfer',
    author: 'Dewi Lestari',
    timestamp: '5 jam lalu',
    club: 'Madura United'
  },
  {
    id: '4',
    title: {
      id: 'PSIM Yogyakarta Targetkan Promosi ke Liga 1',
      en: 'PSIM Yogyakarta Targets Promotion to Liga 1'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop',
    category: 'Liga 2',
    author: 'Eko Prasetyo',
    timestamp: '6 jam lalu',
    club: 'PSIM'
  },
  {
    id: '5',
    title: {
      id: 'Manchester City Dominasi Premier League Pekan Ke-20',
      en: 'Manchester City Dominates Premier League Week 20'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&h=250&fit=crop',
    category: 'Premier League',
    author: 'Michael Owen',
    timestamp: '7 jam lalu',
    club: 'Man City'
  },
  {
    id: '6',
    title: {
      id: 'Real Madrid Perpanjang Kontrak Vinicius Jr Hingga 2030',
      en: 'Real Madrid Extends Vinicius Jr Contract Until 2030'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=250&fit=crop',
    category: 'La Liga',
    author: 'Carlos Martinez',
    timestamp: '8 jam lalu',
    club: 'Real Madrid'
  },
  {
    id: '7',
    title: {
      id: 'Bayern Munich Kalahkan Dortmund dalam Der Klassiker',
      en: 'Bayern Munich Defeats Dortmund in Der Klassiker'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=250&fit=crop',
    category: 'Bundesliga',
    author: 'Hans Mueller',
    timestamp: '10 jam lalu',
    club: 'Bayern'
  },
  {
    id: '8',
    title: {
      id: 'Inter Milan Kokoh di Puncak Klasemen Serie A',
      en: 'Inter Milan Solid at Top of Serie A Standings'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=250&fit=crop',
    category: 'Serie A',
    author: 'Marco Rossi',
    timestamp: '12 jam lalu',
    club: 'Inter'
  }
];

export const bestMoments = [
  { id: '1', title: { id: 'Gol Spektakuler Ronaldo', en: 'Spectacular Ronaldo Goal' }, thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&h=120&fit=crop' },
  { id: '2', title: { id: 'Penyelamatan Gemilang Courtois', en: 'Brilliant Courtois Save' }, thumbnail: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=200&h=120&fit=crop' },
  { id: '3', title: { id: 'Free Kick Messi yang Indah', en: 'Beautiful Messi Free Kick' }, thumbnail: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200&h=120&fit=crop' },
  { id: '4', title: { id: 'Dribbling Mbappe Menembus Pertahanan', en: 'Mbappe Dribbling Through Defense' }, thumbnail: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=200&h=120&fit=crop' },
  { id: '5', title: { id: 'Header Memukau Haaland', en: 'Stunning Haaland Header' }, thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=120&fit=crop' },
  { id: '6', title: { id: 'Assist Jenius De Bruyne', en: 'Genius De Bruyne Assist' }, thumbnail: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=200&h=120&fit=crop' },
];

export const leagues: League[] = [
  { id: 'ucl', name: 'Champions League', country: 'Europe', icon: '🏆' },
  { id: 'uel', name: 'Europa League', country: 'Europe', icon: '🥈' },
  { id: 'liga1', name: 'Liga 1 Indonesia', country: 'Indonesia', icon: '🇮🇩' },
  { id: 'epl', name: 'Premier League', country: 'England', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'laliga', name: 'La Liga', country: 'Spain', icon: '🇪🇸' },
  { id: 'seriea', name: 'Serie A', country: 'Italy', icon: '🇮🇹' },
  { id: 'bundesliga', name: 'Bundesliga', country: 'Germany', icon: '🇩🇪' },
  { id: 'ligue1', name: 'Ligue 1', country: 'France', icon: '🇫🇷' },
];

export const matches: Match[] = [
  // Liga 1 Indonesia
  { id: '1', homeTeam: 'Persebaya Surabaya', awayTeam: 'Arema FC', homeScore: 2, awayScore: 1, time: '20:30', status: 'ft', league: 'Liga 1 Indonesia', leagueCountry: 'Indonesia' },
  { id: '2', homeTeam: 'Persija Jakarta', awayTeam: 'Madura United', time: '19:00', status: 'live', league: 'Liga 1 Indonesia', leagueCountry: 'Indonesia', minute: 67 },
  { id: '3', homeTeam: 'PSM Makassar', awayTeam: 'Bali United', time: '15:30', status: 'scheduled', league: 'Liga 1 Indonesia', leagueCountry: 'Indonesia' },
  { id: '4', homeTeam: 'Persib Bandung', awayTeam: 'PSIS Semarang', homeScore: 3, awayScore: 0, time: '16:00', status: 'ft', league: 'Liga 1 Indonesia', leagueCountry: 'Indonesia' },
  
  // Premier League
  { id: '5', homeTeam: 'Manchester City', awayTeam: 'Liverpool', time: '22:00', status: 'scheduled', league: 'Premier League', leagueCountry: 'England' },
  { id: '6', homeTeam: 'Arsenal', awayTeam: 'Chelsea', homeScore: 2, awayScore: 2, time: '19:30', status: 'ft', league: 'Premier League', leagueCountry: 'England' },
  { id: '7', homeTeam: 'Manchester United', awayTeam: 'Tottenham', time: '21:00', status: 'live', league: 'Premier League', leagueCountry: 'England', minute: 34 },
  
  // La Liga
  { id: '8', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', time: '03:00', status: 'scheduled', league: 'La Liga', leagueCountry: 'Spain' },
  { id: '9', homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla', homeScore: 1, awayScore: 0, time: '23:00', status: 'post', league: 'La Liga', leagueCountry: 'Spain' },
  
  // Serie A
  { id: '10', homeTeam: 'Inter Milan', awayTeam: 'AC Milan', homeScore: 2, awayScore: 1, time: '02:45', status: 'ft', league: 'Serie A', leagueCountry: 'Italy' },
  { id: '11', homeTeam: 'Juventus', awayTeam: 'Napoli', time: '23:45', status: 'scheduled', league: 'Serie A', leagueCountry: 'Italy' },
  
  // Bundesliga
  { id: '12', homeTeam: 'Bayern Munich', awayTeam: 'Borussia Dortmund', homeScore: 4, awayScore: 2, time: '00:30', status: 'ft', league: 'Bundesliga', leagueCountry: 'Germany' },
];
