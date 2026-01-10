export interface Publisher {
  name: string;
  icon: string;
  verified?: boolean;
}

export interface Article {
  id: string;
  slug: string;
  title: { id: string; en: string };
  excerpt: { id: string; en: string };
  content: { id: string; en: string };
  image: string;
  category: string;
  author: string;
  timestamp: string;
  date: string;
  club?: string;
  publisher: Publisher;
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

export interface UpcomingMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  leagueColor: 'orange' | 'blue' | 'green' | 'red' | 'yellow';
  dateLabel: { id: string; en: string };
  time: string;
}

export const upcomingMatches: UpcomingMatch[] = [
  {
    id: '1',
    homeTeam: 'Fiorentina',
    awayTeam: 'AC Milan',
    league: 'Serie A',
    leagueColor: 'orange',
    dateLabel: { id: 'Besok', en: 'Tomorrow' },
    time: '21.00 WIB'
  },
  {
    id: '2',
    homeTeam: 'Inter',
    awayTeam: 'Napoli',
    league: 'Serie A',
    leagueColor: 'orange',
    dateLabel: { id: 'Lusa', en: 'Day after' },
    time: '02.45 WIB'
  },
  {
    id: '3',
    homeTeam: 'Persebaya',
    awayTeam: 'Persija',
    league: 'Liga 1',
    leagueColor: 'green',
    dateLabel: { id: 'Besok', en: 'Tomorrow' },
    time: '19.30 WIB'
  },
  {
    id: '4',
    homeTeam: 'Arsenal',
    awayTeam: 'Man United',
    league: 'EPL',
    leagueColor: 'blue',
    dateLabel: { id: 'Sabtu', en: 'Saturday' },
    time: '22.00 WIB'
  },
  {
    id: '5',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    league: 'La Liga',
    leagueColor: 'red',
    dateLabel: { id: 'Minggu', en: 'Sunday' },
    time: '03.00 WIB'
  },
  {
    id: '6',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Dortmund',
    league: 'Bundesliga',
    leagueColor: 'yellow',
    dateLabel: { id: 'Senin', en: 'Monday' },
    time: '01.30 WIB'
  },
  {
    id: '7',
    homeTeam: 'PSG',
    awayTeam: 'Lyon',
    league: 'Ligue 1',
    leagueColor: 'blue',
    dateLabel: { id: 'Selasa', en: 'Tuesday' },
    time: '02.00 WIB'
  },
  {
    id: '8',
    homeTeam: 'Persib',
    awayTeam: 'PSM Makassar',
    league: 'Liga 1',
    leagueColor: 'green',
    dateLabel: { id: 'Rabu', en: 'Wednesday' },
    time: '20.00 WIB'
  },
  {
    id: '9',
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    league: 'EPL',
    leagueColor: 'blue',
    dateLabel: { id: 'Kamis', en: 'Thursday' },
    time: '02.30 WIB'
  },
  {
    id: '10',
    homeTeam: 'Juventus',
    awayTeam: 'Roma',
    league: 'Serie A',
    leagueColor: 'orange',
    dateLabel: { id: 'Jumat', en: 'Friday' },
    time: '02.45 WIB'
  },
  {
    id: '11',
    homeTeam: 'Arema FC',
    awayTeam: 'Bali United',
    league: 'Liga 1',
    leagueColor: 'green',
    dateLabel: { id: 'Sabtu', en: 'Saturday' },
    time: '15.30 WIB'
  },
  {
    id: '12',
    homeTeam: 'Atletico Madrid',
    awayTeam: 'Sevilla',
    league: 'La Liga',
    leagueColor: 'red',
    dateLabel: { id: 'Minggu', en: 'Sunday' },
    time: '22.00 WIB'
  }
];

export const featuredArticle: Article = {
  id: '1',
  slug: 'persebaya-raih-kemenangan-dramatis-di-menit-akhir-melawan-arema',
  title: {
    id: 'Persebaya Raih Kemenangan Dramatis di Menit Akhir Melawan Arema',
    en: 'Persebaya Secures Dramatic Last-Minute Victory Against Arema'
  },
  excerpt: {
    id: 'Gol injury time dari David da Silva membawa Persebaya meraih tiga poin penting dalam Derby Jawa Timur.',
    en: 'Injury time goal from David da Silva brings Persebaya crucial three points in East Java Derby.'
  },
  content: {
    id: 'Derby Jawa Timur selalu menjadi pertandingan yang ditunggu-tunggu oleh para pecinta sepak bola Indonesia. Kali ini, Persebaya Surabaya berhasil meraih kemenangan dramatis dengan skor 2-1 atas rival abadi mereka, Arema FC.\n\nPertandingan berjalan ketat sejak menit awal. Arema FC berhasil membuka keunggulan terlebih dahulu melalui gol dari tendangan bebas di menit ke-35. Persebaya tidak menyerah dan terus menekan pertahanan lawan.\n\nDi babak kedua, Persebaya bermain lebih agresif. Gol penyeimbang datang di menit ke-67 melalui sundulan dari bek tengah. Namun, drama sesungguhnya terjadi di injury time.\n\nDavid da Silva menjadi pahlawan ketika ia berhasil menyambar bola liar di kotak penalti dan menjebol gawang Arema di menit ke-90+3. Stadion Gelora Bung Tomo meledak dalam euforia.\n\nKemenangan ini membawa Persebaya naik ke posisi tiga klasemen sementara Liga 1. Pelatih menyatakan bangga dengan perjuangan tim yang tidak pernah menyerah hingga menit terakhir.',
    en: 'The East Java Derby is always an anticipated match for Indonesian football fans. This time, Persebaya Surabaya secured a dramatic 2-1 victory over their eternal rivals, Arema FC.\n\nThe match was tight from the opening minutes. Arema FC took the lead first through a free-kick goal in the 35th minute. Persebaya did not give up and continued to pressure the opponent\'s defense.\n\nIn the second half, Persebaya played more aggressively. The equalizer came in the 67th minute through a header from the center-back. However, the real drama unfolded in injury time.\n\nDavid da Silva became the hero when he managed to pounce on a loose ball in the penalty area and beat the Arema goalkeeper in the 90+3 minute. Gelora Bung Tomo Stadium erupted in euphoria.\n\nThis victory brought Persebaya up to third place in the temporary Liga 1 standings. The coach expressed pride in the team\'s fight that never gave up until the last minute.'
  },
  image: '',
  category: 'Liga 1',
  author: 'Ahmad Rizky',
  timestamp: '2 jam lalu',
  date: '10 Januari 2026',
  publisher: { name: 'Kompas Bola', icon: '📰', verified: true }
};

export const articles: Article[] = [
  {
    id: '2',
    slug: 'persija-umumkan-pelatih-baru-untuk-musim-depan',
    title: {
      id: 'Persija Umumkan Pelatih Baru Untuk Musim Depan',
      en: 'Persija Announces New Coach For Next Season'
    },
    excerpt: { id: 'Manajemen Persija resmi mengumumkan pelatih baru yang akan menangani tim di musim depan.', en: 'Persija management officially announces new coach who will handle the team next season.' },
    content: {
      id: 'Persija Jakarta akhirnya resmi mengumumkan pelatih baru yang akan memimpin tim di musim 2026/27. Keputusan ini diambil setelah evaluasi panjang terhadap performa tim di musim sebelumnya.\n\nPelatih baru ini membawa pengalaman panjang di level internasional dan diharapkan dapat membawa Persija kembali bersaing di papan atas Liga 1 Indonesia.',
      en: 'Persija Jakarta has officially announced a new coach who will lead the team in the 2026/27 season. This decision was made after a long evaluation of the team\'s performance in the previous season.\n\nThe new coach brings extensive international experience and is expected to bring Persija back to competing at the top of Liga 1 Indonesia.'
    },
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
    category: 'Transfer',
    author: 'Budi Santoso',
    timestamp: '3 jam lalu',
    date: '10 Januari 2026',
    club: 'Persija',
    publisher: { name: 'Detik Sport', icon: '⚽', verified: true }
  },
  {
    id: '3',
    slug: 'madura-united-perkuat-lini-depan-dengan-striker-asing',
    title: {
      id: 'Madura United Perkuat Lini Depan dengan Striker Asing',
      en: 'Madura United Strengthens Attack with Foreign Striker'
    },
    excerpt: { id: 'Striker asal Brasil resmi bergabung dengan Madura United.', en: 'Brazilian striker officially joins Madura United.' },
    content: {
      id: 'Madura United mengumumkan kedatangan striker baru asal Brasil untuk memperkuat lini depan tim. Pemain berusia 28 tahun ini sebelumnya bermain di liga Brasil dan memiliki catatan gol yang impresif.\n\nManajemen berharap kehadiran striker baru ini dapat meningkatkan produktivitas gol tim yang masih minim di musim ini.',
      en: 'Madura United announced the arrival of a new Brazilian striker to strengthen the team\'s front line. The 28-year-old player previously played in the Brazilian league and has an impressive goal-scoring record.\n\nManagement hopes the presence of this new striker can improve the team\'s goal productivity which has been lacking this season.'
    },
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=250&fit=crop',
    category: 'Transfer',
    author: 'Dewi Lestari',
    timestamp: '5 jam lalu',
    date: '10 Januari 2026',
    club: 'Madura United',
    publisher: { name: 'Bola.com', icon: '🏟️', verified: true }
  },
  {
    id: '4',
    slug: 'psim-yogyakarta-targetkan-promosi-ke-liga-1',
    title: {
      id: 'PSIM Yogyakarta Targetkan Promosi ke Liga 1',
      en: 'PSIM Yogyakarta Targets Promotion to Liga 1'
    },
    excerpt: { id: 'PSIM optimis bisa naik kasta musim ini.', en: 'PSIM is optimistic about promotion this season.' },
    content: {
      id: 'PSIM Yogyakarta menargetkan promosi ke Liga 1 di akhir musim ini. Tim berjuluk Laskar Mataram ini telah mempersiapkan strategi khusus untuk mencapai target tersebut.\n\nDengan dukungan penuh dari suporter setia, PSIM yakin bisa meraih tiket promosi ke kasta tertinggi sepak bola Indonesia.',
      en: 'PSIM Yogyakarta is targeting promotion to Liga 1 at the end of this season. The team nicknamed Laskar Mataram has prepared a special strategy to achieve this target.\n\nWith full support from loyal supporters, PSIM is confident they can secure a promotion ticket to the highest caste of Indonesian football.'
    },
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop',
    category: 'Liga 2',
    author: 'Eko Prasetyo',
    timestamp: '6 jam lalu',
    date: '10 Januari 2026',
    club: 'PSIM',
    publisher: { name: 'Goal Indonesia', icon: '🎯', verified: false }
  },
  {
    id: '5',
    slug: 'manchester-city-dominasi-premier-league-pekan-ke-20',
    title: {
      id: 'Manchester City Dominasi Premier League Pekan Ke-20',
      en: 'Manchester City Dominates Premier League Week 20'
    },
    excerpt: { id: 'City terus memimpin klasemen dengan performa gemilang.', en: 'City continues to lead the standings with brilliant performance.' },
    content: {
      id: 'Manchester City terus menunjukkan dominasinya di Premier League dengan meraih kemenangan meyakinkan di pekan ke-20. Tim asuhan Pep Guardiola ini bermain dengan sangat apik dan sulit dihentikan.\n\nDengan keunggulan poin yang cukup signifikan di puncak klasemen, City semakin dekat dengan gelar juara Premier League.',
      en: 'Manchester City continues to show their dominance in the Premier League with a convincing victory in week 20. Pep Guardiola\'s team played very well and was hard to stop.\n\nWith a significant point advantage at the top of the standings, City is getting closer to the Premier League title.'
    },
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&h=250&fit=crop',
    category: 'Premier League',
    author: 'Michael Owen',
    timestamp: '7 jam lalu',
    date: '10 Januari 2026',
    club: 'Man City',
    publisher: { name: 'Sky Sports', icon: '📺', verified: true }
  },
  {
    id: '6',
    slug: 'real-madrid-perpanjang-kontrak-vinicius-jr-hingga-2030',
    title: {
      id: 'Real Madrid Perpanjang Kontrak Vinicius Jr Hingga 2030',
      en: 'Real Madrid Extends Vinicius Jr Contract Until 2030'
    },
    excerpt: { id: 'Vini Jr resmi bertahan di Santiago Bernabeu hingga 2030.', en: 'Vini Jr officially stays at Santiago Bernabeu until 2030.' },
    content: {
      id: 'Real Madrid resmi mengumumkan perpanjangan kontrak Vinicius Jr hingga tahun 2030. Winger asal Brasil ini telah menjadi salah satu pemain kunci Los Blancos dalam beberapa musim terakhir.\n\nKontrak baru ini menegaskan komitmen kedua belah pihak untuk terus bersama meraih prestasi di level tertinggi.',
      en: 'Real Madrid officially announced the extension of Vinicius Jr\'s contract until 2030. The Brazilian winger has become one of Los Blancos\' key players in recent seasons.\n\nThis new contract affirms the commitment of both parties to continue achieving success at the highest level together.'
    },
    image: 'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=400&h=250&fit=crop',
    category: 'La Liga',
    author: 'Carlos Martinez',
    timestamp: '8 jam lalu',
    date: '10 Januari 2026',
    club: 'Real Madrid',
    publisher: { name: 'Marca', icon: '📰', verified: true }
  },
  {
    id: '7',
    slug: 'bayern-munich-kalahkan-dortmund-dalam-der-klassiker',
    title: {
      id: 'Bayern Munich Kalahkan Dortmund dalam Der Klassiker',
      en: 'Bayern Munich Defeats Dortmund in Der Klassiker'
    },
    excerpt: { id: 'Bayern menang telak dalam pertandingan klasik Jerman.', en: 'Bayern wins convincingly in the German classic match.' },
    content: {
      id: 'Bayern Munich berhasil mengalahkan Borussia Dortmund dalam pertandingan Der Klassiker yang selalu dinanti. Pertandingan berlangsung sengit dengan Bayern yang tampil lebih dominan.\n\nKemenangan ini semakin mengukuhkan posisi Bayern di puncak klasemen Bundesliga musim ini.',
      en: 'Bayern Munich managed to defeat Borussia Dortmund in the always anticipated Der Klassiker match. The match was intense with Bayern appearing more dominant.\n\nThis victory further solidifies Bayern\'s position at the top of the Bundesliga standings this season.'
    },
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=250&fit=crop',
    category: 'Bundesliga',
    author: 'Hans Mueller',
    timestamp: '10 jam lalu',
    date: '9 Januari 2026',
    club: 'Bayern',
    publisher: { name: 'Kicker', icon: '⚽', verified: true }
  },
  {
    id: '8',
    slug: 'inter-milan-kokoh-di-puncak-klasemen-serie-a',
    title: {
      id: 'Inter Milan Kokoh di Puncak Klasemen Serie A',
      en: 'Inter Milan Solid at Top of Serie A Standings'
    },
    excerpt: { id: 'Nerazzurri terus mempertahankan posisi puncak.', en: 'Nerazzurri continues to maintain top position.' },
    content: {
      id: 'Inter Milan terus menunjukkan konsistensi luar biasa di Serie A musim ini. Tim berjuluk Nerazzurri ini berhasil mempertahankan posisi puncak klasemen dengan performa yang sangat solid.\n\nDengan lini pertahanan yang kokoh dan serangan yang tajam, Inter menjadi kandidat kuat juara Serie A.',
      en: 'Inter Milan continues to show extraordinary consistency in Serie A this season. The team nicknamed Nerazzurri has managed to maintain the top position with a very solid performance.\n\nWith a solid defense line and sharp attack, Inter is a strong candidate for the Serie A title.'
    },
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=250&fit=crop',
    category: 'Serie A',
    author: 'Marco Rossi',
    timestamp: '12 jam lalu',
    date: '9 Januari 2026',
    club: 'Inter',
    publisher: { name: 'Gazzetta', icon: '🇮🇹', verified: true }
  },
  {
    id: '9',
    slug: 'liverpool-menang-tipis-atas-newcastle-di-anfield',
    title: {
      id: 'Liverpool Menang Tipis Atas Newcastle di Anfield',
      en: 'Liverpool Edges Past Newcastle at Anfield'
    },
    excerpt: { id: 'The Reds raih tiga poin penting di kandang.', en: 'The Reds secure crucial three points at home.' },
    content: {
      id: 'Liverpool berhasil meraih kemenangan tipis atas Newcastle United di kandang mereka, Anfield. Pertandingan berjalan ketat dengan kedua tim saling serang.\n\nKemenangan ini sangat penting bagi Liverpool dalam persaingan ketat di papan atas Premier League musim ini.',
      en: 'Liverpool managed to secure a narrow victory over Newcastle United at their home ground, Anfield. The match was tight with both teams attacking each other.\n\nThis victory is very important for Liverpool in the tight competition at the top of the Premier League this season.'
    },
    image: 'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=400&h=250&fit=crop',
    category: 'Premier League',
    author: 'James Wilson',
    timestamp: '14 jam lalu',
    date: '9 Januari 2026',
    club: 'Liverpool',
    publisher: { name: 'BBC Sport', icon: '📻', verified: true }
  }
];

export const bestMoments = [
  { id: '1', title: { id: 'Gol Spektakuler Ronaldo', en: 'Spectacular Ronaldo Goal' }, thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&h=400&fit=crop' },
  { id: '2', title: { id: 'Penyelamatan Gemilang Courtois', en: 'Brilliant Courtois Save' }, thumbnail: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=300&h=400&fit=crop' },
  { id: '3', title: { id: 'Free Kick Messi yang Indah', en: 'Beautiful Messi Free Kick' }, thumbnail: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&h=400&fit=crop' },
  { id: '4', title: { id: 'Dribbling Mbappe Menembus Pertahanan', en: 'Mbappe Dribbling Through Defense' }, thumbnail: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=300&h=400&fit=crop' },
  { id: '5', title: { id: 'Header Memukau Haaland', en: 'Stunning Haaland Header' }, thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=400&fit=crop' },
  { id: '6', title: { id: 'Assist Jenius De Bruyne', en: 'Genius De Bruyne Assist' }, thumbnail: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=300&h=400&fit=crop' },
  { id: '7', title: { id: 'Tendangan Voli Spektakuler', en: 'Spectacular Volley Shot' }, thumbnail: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300&h=400&fit=crop' },
  { id: '8', title: { id: 'Umpan Terobos Kroos', en: 'Kroos Through Ball' }, thumbnail: 'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=300&h=400&fit=crop' },
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
  { id: '2', homeTeam: 'Persija Jakarta', awayTeam: 'Madura United', homeScore: 1, awayScore: 1, time: '19:00', status: 'live', league: 'Liga 1 Indonesia', leagueCountry: 'Indonesia', minute: 67 },
  { id: '3', homeTeam: 'PSM Makassar', awayTeam: 'Bali United', time: '15:30', status: 'scheduled', league: 'Liga 1 Indonesia', leagueCountry: 'Indonesia' },
  { id: '4', homeTeam: 'Persib Bandung', awayTeam: 'PSIS Semarang', homeScore: 3, awayScore: 0, time: '16:00', status: 'ft', league: 'Liga 1 Indonesia', leagueCountry: 'Indonesia' },
  
  // Premier League
  { id: '5', homeTeam: 'Manchester City', awayTeam: 'Liverpool', time: '22:00', status: 'scheduled', league: 'Premier League', leagueCountry: 'England' },
  { id: '6', homeTeam: 'Arsenal', awayTeam: 'Chelsea', homeScore: 2, awayScore: 2, time: '19:30', status: 'ft', league: 'Premier League', leagueCountry: 'England' },
  { id: '7', homeTeam: 'Manchester United', awayTeam: 'Tottenham', homeScore: 0, awayScore: 0, time: '21:00', status: 'live', league: 'Premier League', leagueCountry: 'England', minute: 34 },
  
  // La Liga
  { id: '8', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', time: '03:00', status: 'scheduled', league: 'La Liga', leagueCountry: 'Spain' },
  { id: '9', homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla', homeScore: 1, awayScore: 0, time: '23:00', status: 'post', league: 'La Liga', leagueCountry: 'Spain' },
  { id: '13', homeTeam: 'Real Oviedo', awayTeam: 'Real Betis', homeScore: 1, awayScore: 1, time: '21:00', status: 'live', league: 'La Liga', leagueCountry: 'Spain', minute: 45 },
  
  // Serie A
  { id: '10', homeTeam: 'Inter Milan', awayTeam: 'AC Milan', homeScore: 2, awayScore: 1, time: '02:45', status: 'ft', league: 'Serie A', leagueCountry: 'Italy' },
  { id: '11', homeTeam: 'Juventus', awayTeam: 'Napoli', time: '23:45', status: 'scheduled', league: 'Serie A', leagueCountry: 'Italy' },
  { id: '14', homeTeam: 'Como', awayTeam: 'Bologna', homeScore: 0, awayScore: 0, time: '21:00', status: 'live', league: 'Serie A', leagueCountry: 'Italy', minute: 32 },
  { id: '15', homeTeam: 'Udinese', awayTeam: 'Pisa', homeScore: 2, awayScore: 1, time: '21:00', status: 'live', league: 'Serie A', leagueCountry: 'Italy', minute: 78 },
  
  // Bundesliga
  { id: '12', homeTeam: 'Bayern Munich', awayTeam: 'Borussia Dortmund', homeScore: 4, awayScore: 2, time: '00:30', status: 'ft', league: 'Bundesliga', leagueCountry: 'Germany' },
  { id: '16', homeTeam: 'FC Union Berlin', awayTeam: 'FSV Mainz 05', homeScore: 0, awayScore: 0, time: '20:30', status: 'live', league: 'Bundesliga', leagueCountry: 'Germany', minute: 23 },
  { id: '17', homeTeam: 'SC Freiburg', awayTeam: 'Hamburger SV', homeScore: 0, awayScore: 0, time: '20:30', status: 'live', league: 'Bundesliga', leagueCountry: 'Germany', minute: 18 },
];
