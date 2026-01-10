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
    id: 'Derby Jawa Timur selalu menjadi pertandingan yang ditunggu-tunggu oleh para pecinta sepak bola Indonesia. Kali ini, Persebaya Surabaya berhasil meraih kemenangan dramatis dengan skor 2-1 atas rival abadi mereka, Arema FC. Pertandingan yang berlangsung di Stadion Gelora Bung Tomo ini disaksikan oleh lebih dari 40.000 suporter fanatik Bonek yang memenuhi setiap sudut stadion. Atmosfer yang tercipta sangat luar biasa, dengan nyanyian dan teriakan dukungan yang tidak pernah berhenti sejak kedua tim memasuki lapangan. Rivalitas antara Persebaya dan Arema memang sudah terkenal sebagai salah satu yang paling panas di Indonesia.\n\nPertandingan berjalan ketat sejak menit awal dengan kedua tim saling jual beli serangan. Arema FC berhasil membuka keunggulan terlebih dahulu melalui gol dari tendangan bebas spektakuler di menit ke-35 yang dilakukan oleh gelandang serang mereka. Bola meluncur indah melewati pagar betis dan masuk ke sudut kiri atas gawang Persebaya. Para pemain Arema merayakan gol tersebut dengan penuh semangat, sementara para Bonek terdiam sesaat sebelum kembali memberikan dukungan kepada tim kesayangan mereka. Persebaya tidak menyerah dan terus menekan pertahanan lawan dengan serangan-serangan berbahaya.\n\nDi babak kedua, Persebaya bermain jauh lebih agresif dengan mengubah formasi menjadi lebih menyerang. Pelatih melakukan pergantian pemain strategis dengan memasukkan dua pemain sayap yang memiliki kecepatan tinggi. Gol penyeimbang akhirnya datang di menit ke-67 melalui sundulan maut dari bek tengah yang naik saat tendangan sudut. Bola menghujam keras ke gawang Arema dan tidak bisa dijangkau oleh kiper. Stadion langsung meledak dalam kegembiraan, dan momentum permainan berubah total menjadi milik tuan rumah. Para pemain Persebaya bermain dengan penuh percaya diri.\n\nDrama sesungguhnya terjadi di injury time ketika pertandingan sudah memasuki menit ke-90. David da Silva, striker andalan Persebaya, menjadi pahlawan ketika ia berhasil menyambar bola liar di kotak penalti hasil dari kemelut tendangan sudut. Dengan kaki kanannya, ia menjebol gawang Arema di menit ke-90+3 dan membuat seluruh Stadion Gelora Bung Tomo meledak dalam euforia yang luar biasa. Para pemain berlari ke arah tribun untuk merayakan bersama suporter, sementara pemain Arema tertunduk lesu di lapangan. Momen tersebut akan dikenang sebagai salah satu momen paling dramatis dalam sejarah Derby Jawa Timur.\n\nKemenangan ini membawa Persebaya naik ke posisi tiga klasemen sementara Liga 1 dengan poin 38, hanya terpaut empat poin dari pemuncak klasemen. Pelatih menyatakan sangat bangga dengan perjuangan tim yang tidak pernah menyerah hingga menit terakhir. Dalam konferensi pers pasca pertandingan, ia memuji mentalitas para pemain dan dukungan luar biasa dari suporter Bonek. Sementara itu, pelatih Arema mengakui timnya kalah dalam pertarungan mental di menit-menit akhir. Dengan kemenangan ini, Persebaya semakin optimis bisa bersaing untuk gelar juara Liga 1 musim ini.',
    en: 'The East Java Derby is always an anticipated match for Indonesian football fans. This time, Persebaya Surabaya secured a dramatic 2-1 victory over their eternal rivals, Arema FC. The match held at Gelora Bung Tomo Stadium was witnessed by more than 40,000 fanatical Bonek supporters who filled every corner of the stadium. The atmosphere created was extraordinary, with songs and cheers of support that never stopped since both teams entered the field. The rivalry between Persebaya and Arema is indeed known as one of the hottest in Indonesia.\n\nThe match was tight from the opening minutes with both teams exchanging attacks. Arema FC took the lead first through a spectacular free-kick goal in the 35th minute by their attacking midfielder. The ball curved beautifully over the wall and into the top left corner of Persebaya\'s goal. Arema players celebrated the goal with full spirit, while the Bonek fell silent for a moment before returning to support their beloved team. Persebaya did not give up and continued to pressure the opponent\'s defense with dangerous attacks.\n\nIn the second half, Persebaya played much more aggressively by changing to a more attacking formation. The coach made strategic substitutions by bringing in two wingers with high speed. The equalizer finally came in the 67th minute through a deadly header from the center-back who rose during a corner kick. The ball slammed hard into Arema\'s goal and could not be reached by the goalkeeper. The stadium immediately erupted in joy, and the momentum of the game completely shifted to the home team. Persebaya players played with full confidence.\n\nThe real drama unfolded in injury time when the match had entered the 90th minute. David da Silva, Persebaya\'s main striker, became the hero when he managed to pounce on a loose ball in the penalty area from a corner kick scramble. With his right foot, he beat the Arema goalkeeper in the 90+3 minute and made the entire Gelora Bung Tomo Stadium erupt in extraordinary euphoria. The players ran towards the stands to celebrate with the supporters, while Arema players hung their heads on the field. That moment will be remembered as one of the most dramatic moments in the history of the East Java Derby.\n\nThis victory brought Persebaya up to third place in the temporary Liga 1 standings with 38 points, only four points behind the table leaders. The coach expressed great pride in the team\'s fight that never gave up until the last minute. In the post-match press conference, he praised the mentality of the players and the extraordinary support from Bonek supporters. Meanwhile, the Arema coach admitted his team lost the mental battle in the final minutes. With this victory, Persebaya is increasingly optimistic about competing for the Liga 1 title this season.'
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
      id: 'Persija Jakarta akhirnya resmi mengumumkan pelatih baru yang akan memimpin tim di musim 2026/27. Keputusan ini diambil setelah evaluasi panjang terhadap performa tim di musim sebelumnya yang dianggap mengecewakan. Manajemen melakukan pencarian intensif selama dua bulan terakhir untuk menemukan sosok yang tepat. Kandidat dari berbagai negara dipertimbangkan, termasuk pelatih dari Eropa, Amerika Selatan, dan Asia.\n\nPelatih baru ini membawa pengalaman panjang di level internasional dengan catatan prestasi yang sangat mengesankan. Sebelumnya, ia pernah menangani klub-klub besar di liga Eropa dan berhasil membawa timnya meraih gelar juara nasional. Filosofi sepak bolanya yang menekankan pressing tinggi dan permainan menyerang dipercaya cocok dengan karakter pemain Persija dan ekspektasi suporter Jakmania.\n\nDalam konferensi pers perkenalan yang digelar di Stadion Patriot Candrabhaga, pelatih baru menyampaikan visi dan misinya untuk Persija. Ia berjanji akan membangun tim yang kompetitif dan mampu bersaing di level Asia. Target utama musim depan adalah meraih gelar juara Liga 1 sekaligus tampil maksimal di ajang AFC. Manajemen juga mengumumkan bahwa pelatih akan didukung dengan anggaran transfer yang memadai.\n\nReaksi suporter Jakmania terhadap pengumuman ini sangat positif. Banyak yang menyambut gembira dan berharap era baru Persija akan segera dimulai. Media sosial dipenuhi dengan ucapan selamat datang dan harapan tinggi dari para pendukung setia Macan Kemayoran. Beberapa mantan pemain juga memberikan dukungan dan optimisme terhadap kepemimpinan baru ini.\n\nPersiapan untuk musim depan akan segera dimulai dengan menggelar training camp di luar negeri. Beberapa pemain baru juga sedang dalam proses negosiasi untuk memperkuat skuad. Pelatih baru diharapkan dapat membawa Persija kembali bersaing di papan atas Liga 1 Indonesia dan mengakhiri puasa gelar yang sudah berlangsung beberapa musim terakhir.',
      en: 'Persija Jakarta has officially announced a new coach who will lead the team in the 2026/27 season. This decision was made after a long evaluation of the team\'s performance in the previous season which was considered disappointing. Management conducted an intensive search over the last two months to find the right figure. Candidates from various countries were considered, including coaches from Europe, South America, and Asia.\n\nThe new coach brings extensive international experience with a very impressive track record. Previously, he has managed major clubs in European leagues and successfully led his teams to national championship titles. His football philosophy emphasizing high pressing and attacking play is believed to match the character of Persija players and the expectations of Jakmania supporters.\n\nIn the introduction press conference held at Patriot Candrabhaga Stadium, the new coach conveyed his vision and mission for Persija. He promised to build a competitive team capable of competing at the Asian level. The main target for next season is to win the Liga 1 title while performing maximally in AFC competitions. Management also announced that the coach will be supported with an adequate transfer budget.\n\nThe reaction from Jakmania supporters to this announcement has been very positive. Many welcomed it joyfully and hope that a new era for Persija will soon begin. Social media was filled with welcome messages and high hopes from the loyal supporters of Macan Kemayoran. Several former players also gave support and optimism for this new leadership.\n\nPreparations for next season will begin soon with a training camp abroad. Several new players are also in the negotiation process to strengthen the squad. The new coach is expected to bring Persija back to competing at the top of Liga 1 Indonesia and end the title drought that has lasted for several recent seasons.'
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
      id: 'Madura United resmi mengumumkan kedatangan striker baru asal Brasil untuk memperkuat lini depan tim menjelang putaran kedua Liga 1. Pemain berusia 28 tahun ini sebelumnya bermain di Campeonato Brasileiro Série A dan tercatat sebagai salah satu pencetak gol terbanyak klubnya musim lalu. Proses negosiasi berlangsung selama tiga minggu sebelum akhirnya mencapai kesepakatan dengan nilai transfer yang dirahasiakan.\n\nStriker bertinggi 185 cm ini dikenal dengan kemampuan finishing yang sangat baik dan pergerakan tanpa bola yang cerdas di dalam kotak penalti. Ia mampu bermain sebagai striker tunggal maupun berdampingan dengan penyerang lain dalam formasi dua striker. Kelebihannya dalam permainan udara juga menjadi nilai tambah mengingat karakteristik permainan Liga 1 yang banyak mengandalkan crossing dan bola-bola panjang.\n\nManajemen Madura United berharap kehadiran striker baru ini dapat meningkatkan produktivitas gol tim yang masih minim di musim ini. Sejauh ini, Madura United baru mencetak 18 gol dari 17 pertandingan, menjadikan mereka sebagai salah satu tim dengan catatan gol terburuk di papan atas klasemen. Dengan tambahan pemain berkualitas di lini depan, target finis di empat besar klasemen diyakini masih bisa tercapai.\n\nPemain baru ini sudah tiba di Indonesia dan langsung menjalani tes medis di rumah sakit yang ditunjuk klub. Semua hasil pemeriksaan menunjukkan kondisi fisik yang prima dan siap untuk langsung bergabung dengan latihan tim. Rencananya, ia akan diperkenalkan secara resmi kepada suporter dalam laga kandang terdekat melawan Barito Putera. Antusiasme suporter Madura United menyambut kedatangan pemain ini terlihat dari banyaknya pesan dukungan di media sosial resmi klub.\n\nDengan kedatangan striker Brasil ini, Madura United kini memiliki tiga pemain asing di skuad mereka, memaksimalkan kuota yang diperbolehkan. Pelatih menyatakan optimis bahwa kombinasi pemain lokal dan asing yang mumpuni akan membuat tim semakin kompetitif di sisa musim.',
      en: 'Madura United officially announced the arrival of a new Brazilian striker to strengthen the team\'s front line ahead of the second round of Liga 1. The 28-year-old player previously played in Campeonato Brasileiro Série A and was recorded as one of the top scorers for his club last season. The negotiation process lasted for three weeks before finally reaching an agreement with an undisclosed transfer fee.\n\nThe 185 cm tall striker is known for his excellent finishing ability and intelligent off-the-ball movement inside the penalty area. He can play as a lone striker or alongside another forward in a two-striker formation. His advantage in aerial play is also an added value considering the characteristics of Liga 1 which relies heavily on crossing and long balls.\n\nMadura United management hopes the presence of this new striker can improve the team\'s goal productivity which has been lacking this season. So far, Madura United has only scored 18 goals from 17 matches, making them one of the teams with the worst goal record in the upper standings. With the addition of quality players in the front line, the target of finishing in the top four is believed to still be achievable.\n\nThe new player has arrived in Indonesia and immediately underwent medical tests at the club-designated hospital. All examination results showed prime physical condition and readiness to immediately join team training. The plan is to officially introduce him to supporters in the nearest home match against Barito Putera. The enthusiasm of Madura United supporters welcoming this player\'s arrival is evident from the many supportive messages on the club\'s official social media.\n\nWith the arrival of this Brazilian striker, Madura United now has three foreign players in their squad, maximizing the allowed quota. The coach expressed optimism that the combination of capable local and foreign players will make the team more competitive for the rest of the season.'
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
      id: 'PSIM Yogyakarta menargetkan promosi ke Liga 1 di akhir musim ini setelah sempat gagal di musim sebelumnya. Tim berjuluk Laskar Mataram ini telah mempersiapkan strategi khusus untuk mencapai target tersebut dengan melakukan pembenahan di berbagai lini. Manajemen telah melakukan evaluasi menyeluruh terhadap performa tim dan mengidentifikasi area-area yang perlu ditingkatkan untuk memastikan target promosi tercapai.\n\nPersiapan menjelang putaran kedua Liga 2 dilakukan dengan sangat serius. PSIM telah mendatangkan beberapa pemain baru yang dianggap mampu memberikan kontribusi signifikan. Di antaranya adalah mantan pemain Liga 1 yang memiliki pengalaman bermain di level tertinggi. Selain itu, pemain-pemain muda dari akademi juga mulai dipromosikan ke tim utama untuk memberikan kesegaran dan energi baru.\n\nDukungan penuh dari suporter setia Brajamusti menjadi modal penting bagi tim dalam mengejar target promosi. Setiap pertandingan kandang di Stadion Mandala Krida selalu dipenuhi oleh ribuan suporter yang memberikan dukungan tanpa henti. Atmosfer yang tercipta menjadi motivasi tambahan bagi para pemain untuk tampil maksimal dan meraih hasil positif di setiap pertandingan.\n\nPelatih menyampaikan optimismenya bahwa dengan persiapan yang matang dan dukungan suporter, PSIM memiliki peluang besar untuk meraih promosi. Ia menekankan pentingnya menjaga konsistensi performa dan mentalitas juara di setiap pertandingan. Target minimal adalah finis di posisi dua besar klasemen yang memberikan tiket langsung ke Liga 1 tanpa harus melalui babak playoff.\n\nDengan dukungan penuh dari suporter setia dan persiapan yang telah dilakukan, PSIM yakin bisa meraih tiket promosi ke kasta tertinggi sepak bola Indonesia. Ini akan menjadi pencapaian bersejarah mengingat PSIM sudah lama absen dari kompetisi Liga 1. Seluruh elemen klub berkomitmen untuk bekerja keras demi mewujudkan mimpi tersebut.',
      en: 'PSIM Yogyakarta is targeting promotion to Liga 1 at the end of this season after failing in the previous season. The team nicknamed Laskar Mataram has prepared a special strategy to achieve this target by making improvements in various areas. Management has conducted a thorough evaluation of the team\'s performance and identified areas that need improvement to ensure the promotion target is achieved.\n\nPreparations ahead of the second round of Liga 2 are being done very seriously. PSIM has brought in several new players who are considered capable of making significant contributions. Among them are former Liga 1 players who have experience playing at the highest level. In addition, young players from the academy have also begun to be promoted to the first team to provide freshness and new energy.\n\nFull support from loyal Brajamusti supporters is an important asset for the team in pursuing the promotion target. Every home match at Mandala Krida Stadium is always filled with thousands of supporters who provide non-stop support. The atmosphere created becomes additional motivation for the players to perform at their best and achieve positive results in every match.\n\nThe coach conveyed his optimism that with mature preparation and supporter support, PSIM has a great chance of achieving promotion. He emphasized the importance of maintaining consistency in performance and a championship mentality in every match. The minimum target is to finish in the top two of the standings which provides a direct ticket to Liga 1 without having to go through the playoff round.\n\nWith full support from loyal supporters and the preparations that have been made, PSIM is confident they can secure a promotion ticket to the highest caste of Indonesian football. This will be a historic achievement considering PSIM has been absent from Liga 1 competition for a long time. All elements of the club are committed to working hard to realize this dream.'
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
      id: 'Manchester City terus menunjukkan dominasinya di Premier League dengan meraih kemenangan meyakinkan 4-0 di pekan ke-20 melawan salah satu tim papan tengah. Tim asuhan Pep Guardiola ini bermain dengan sangat apik dan sulit dihentikan oleh lawan manapun musim ini. Penguasaan bola yang mencapai 70% menunjukkan betapa dominannya City dalam setiap pertandingan yang mereka mainkan.\n\nErling Haaland kembali menjadi bintang dengan mencetak dua gol yang memperlebar keunggulan City. Striker asal Norwegia ini sudah mengoleksi 25 gol di semua kompetisi musim ini dan menjadi top skor sementara Premier League. Duet mautnya dengan Kevin De Bruyne terus menjadi momok menakutkan bagi pertahanan lawan. Kreativitas De Bruyne dalam menciptakan peluang sangat sulit untuk diantisipasi.\n\nDi lini belakang, City juga tampil sangat solid dengan hanya kebobolan 12 gol sepanjang musim. Kehadiran Ruben Dias dan John Stones sebagai duo bek tengah memberikan keamanan ekstra. Ederson di bawah mistar juga tampil konsisten dengan beberapa penyelamatan gemilang. Organisasi pertahanan yang dibangun Guardiola membuat City sulit ditembus.\n\nDengan keunggulan poin yang cukup signifikan di puncak klasemen, City semakin dekat dengan gelar juara Premier League. Mereka kini unggul 8 poin dari pesaing terdekat dengan satu pertandingan lebih sedikit. Jika konsistensi ini terus terjaga, City berpotensi mengunci gelar juara lebih awal dari jadwal. Para rival mulai pesimis bisa mengejar ketinggalan poin.\n\nGuardiola menyatakan timnya tidak boleh cepat puas meski sudah memimpin klasemen dengan nyaman. Ia mengingatkan bahwa kompetisi masih panjang dan setiap pertandingan harus ditaklukkan dengan serius. Target utama tetap meraih treble dengan memenangkan Premier League, FA Cup, dan Champions League musim ini.',
      en: 'Manchester City continues to show their dominance in the Premier League with a convincing 4-0 victory in week 20 against one of the mid-table teams. Pep Guardiola\'s team played very well and was hard to stop by any opponent this season. Ball possession reaching 70% shows how dominant City is in every match they play.\n\nErling Haaland became the star again by scoring two goals that extended City\'s lead. The Norwegian striker has now collected 25 goals in all competitions this season and is the current Premier League top scorer. His deadly partnership with Kevin De Bruyne continues to be a frightening threat to opposing defenses. De Bruyne\'s creativity in creating chances is very difficult to anticipate.\n\nAt the back, City also looked very solid with only 12 goals conceded throughout the season. The presence of Ruben Dias and John Stones as the center-back duo provides extra security. Ederson under the bar also performed consistently with several brilliant saves. The defensive organization built by Guardiola makes City hard to penetrate.\n\nWith a significant point advantage at the top of the standings, City is getting closer to the Premier League title. They are now 8 points ahead of their closest rivals with one game in hand. If this consistency continues, City could potentially clinch the title earlier than scheduled. Rivals are starting to be pessimistic about catching up.\n\nGuardiola stated that his team should not be complacent even though they are leading the standings comfortably. He reminded that the competition is still long and every match must be conquered seriously. The main target remains to achieve a treble by winning the Premier League, FA Cup, and Champions League this season.'
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
      id: 'Real Madrid resmi mengumumkan perpanjangan kontrak Vinicius Jr hingga tahun 2030 dengan nilai kontrak yang fantastis. Winger asal Brasil berusia 25 tahun ini telah menjadi salah satu pemain kunci Los Blancos dalam beberapa musim terakhir dan dianggap sebagai aset tak ternilai bagi klub. Pengumuman dilakukan dalam konferensi pers khusus di Santiago Bernabeu yang dihadiri oleh presiden klub dan perwakilan pemain.\n\nVinicius telah menunjukkan perkembangan luar biasa sejak bergabung dengan Real Madrid pada 2018 dari Flamengo. Dari pemain muda yang masih kasar, ia kini menjelma menjadi salah satu winger terbaik dunia. Kecepatan, dribbling, dan kemampuan menuntaskan peluang menjadi senjata utamanya. Musim lalu ia mencetak 24 gol dan memberikan 12 assist di semua kompetisi.\n\nKontrak baru ini menegaskan komitmen kedua belah pihak untuk terus bersama meraih prestasi di level tertinggi. Real Madrid memasang klausul pelepasan senilai 1 miliar euro untuk melindungi aset berharga mereka dari incaran klub-klub kaya. Vinicius menyatakan bahwa Santiago Bernabeu adalah rumahnya dan ia bermimpi memenangkan lebih banyak gelar bersama klub legendaris ini.\n\nPerpanjangan kontrak ini disambut gembira oleh para Madridistas di seluruh dunia. Media sosial dipenuhi dengan ucapan selamat dan harapan agar Vinicius bisa terus bersinar dengan jersey putih Los Blancos. Banyak yang membandingkan perjalanan karirnya dengan legenda-legenda Brasil yang pernah membela Real Madrid seperti Ronaldo, Roberto Carlos, dan Ronaldinho.\n\nDengan kontrak baru ini, Vinicius akan menjadi salah satu pemain dengan bayaran tertinggi di dunia. Ia diharapkan dapat terus menjadi pemain kunci dan membantu Real Madrid meraih gelar La Liga dan Champions League di musim-musim mendatang. Kombinasinya dengan Jude Bellingham dan Kylian Mbappe diprediksi akan mendominasi sepak bola Eropa.',
      en: 'Real Madrid officially announced the extension of Vinicius Jr\'s contract until 2030 with a fantastic contract value. The 25-year-old Brazilian winger has become one of Los Blancos\' key players in recent seasons and is considered a priceless asset for the club. The announcement was made in a special press conference at Santiago Bernabeu attended by the club president and player representatives.\n\nVinicius has shown tremendous development since joining Real Madrid in 2018 from Flamengo. From a raw young player, he has now transformed into one of the best wingers in the world. Speed, dribbling, and finishing ability are his main weapons. Last season he scored 24 goals and provided 12 assists in all competitions.\n\nThis new contract affirms the commitment of both parties to continue achieving success at the highest level together. Real Madrid has set a 1 billion euro release clause to protect their valuable asset from the interest of wealthy clubs. Vinicius stated that Santiago Bernabeu is his home and he dreams of winning more titles with this legendary club.\n\nThis contract extension was welcomed joyfully by Madridistas around the world. Social media was filled with congratulations and hopes that Vinicius can continue to shine with the white jersey of Los Blancos. Many compared his career journey with Brazilian legends who have played for Real Madrid such as Ronaldo, Roberto Carlos, and Ronaldinho.\n\nWith this new contract, Vinicius will become one of the highest-paid players in the world. He is expected to continue to be a key player and help Real Madrid win La Liga and Champions League titles in the coming seasons. His combination with Jude Bellingham and Kylian Mbappe is predicted to dominate European football.'
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
      id: 'Bayern Munich berhasil mengalahkan Borussia Dortmund dengan skor telak 4-1 dalam pertandingan Der Klassiker yang selalu dinanti para pecinta sepak bola Jerman. Pertandingan yang berlangsung di Allianz Arena ini disaksikan oleh 75.000 penonton yang memenuhi stadion. Atmosfer yang tercipta sangat luar biasa dengan kedua kubu suporter saling adu chant sepanjang 90 menit.\n\nBayern tampil dominan sejak menit awal dengan menekan pertahanan Dortmund secara agresif. Gol pertama datang di menit ke-15 melalui tendangan voli spektakuler dari luar kotak penalti. Dortmund sempat menyamakan kedudukan di menit ke-25 melalui serangan balik cepat, namun keunggulan tersebut tidak bertahan lama. Bayern kembali unggul sebelum turun minum melalui sundulan maut di menit ke-40.\n\nDi babak kedua, Bayern semakin menggila dengan menambah dua gol lagi yang membuat pertandingan tidak bisa dikejar oleh Dortmund. Performa lini tengah Bayern yang diperkuat oleh pemain-pemain berkualitas dunia membuat mereka sulit ditembus. Penguasaan bola mencapai 65% menunjukkan dominasi total tuan rumah. Dortmund hanya bisa melakukan damage control untuk mencegah kekalahan lebih memalukan.\n\nKemenangan telak ini semakin mengukuhkan posisi Bayern di puncak klasemen Bundesliga dengan keunggulan 6 poin dari pesaing terdekat. Ini adalah kemenangan ke-15 mereka di liga musim ini dari 18 pertandingan yang sudah dimainkan. Konsistensi yang ditunjukkan membuat mereka menjadi favorit kuat untuk meraih gelar juara Bundesliga musim ini.\n\nPelatih Bayern menyampaikan kepuasannya terhadap performa tim yang tampil sangat solid di kedua lini. Ia memuji mentalitas para pemain yang tidak pernah puas dan selalu lapar akan kemenangan. Sementara pelatih Dortmund mengakui timnya kalah kelas dalam pertandingan ini dan berjanji akan melakukan evaluasi untuk pertandingan-pertandingan selanjutnya.',
      en: 'Bayern Munich managed to defeat Borussia Dortmund with a convincing 4-1 score in the always anticipated Der Klassiker for German football fans. The match held at Allianz Arena was witnessed by 75,000 spectators who filled the stadium. The atmosphere created was extraordinary with both groups of supporters exchanging chants throughout the 90 minutes.\n\nBayern looked dominant from the opening minutes by pressing Dortmund\'s defense aggressively. The first goal came in the 15th minute through a spectacular volley from outside the penalty area. Dortmund managed to equalize in the 25th minute through a quick counter-attack, but that advantage did not last long. Bayern regained the lead before halftime through a deadly header in the 40th minute.\n\nIn the second half, Bayern went even crazier by adding two more goals that made the match impossible for Dortmund to catch up. Bayern\'s midfield performance, strengthened by world-class players, made them hard to penetrate. Ball possession reaching 65% showed the total dominance of the home team. Dortmund could only do damage control to prevent a more embarrassing defeat.\n\nThis convincing victory further solidifies Bayern\'s position at the top of the Bundesliga standings with a 6-point advantage over the closest rival. This is their 15th league win this season from 18 matches played. The consistency shown makes them strong favorites to win the Bundesliga title this season.\n\nThe Bayern coach expressed his satisfaction with the team\'s performance which looked very solid in both lines. He praised the mentality of the players who are never satisfied and always hungry for victory. Meanwhile, the Dortmund coach admitted his team was outclassed in this match and promised to conduct an evaluation for the next matches.'
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
      id: 'Inter Milan terus menunjukkan konsistensi luar biasa di Serie A musim ini dengan meraih kemenangan ke-14 dari 18 pertandingan liga. Tim berjuluk Nerazzurri ini berhasil mempertahankan posisi puncak klasemen dengan performa yang sangat solid dan meyakinkan. Kombinasi antara lini pertahanan yang kokoh dan serangan yang produktif membuat Inter sulit dikalahkan oleh tim manapun.\n\nLini pertahanan Inter menjadi yang terbaik di Serie A musim ini dengan hanya kebobolan 10 gol. Trio bek yang dikawal oleh kapten tim tampil sangat solid dan kompak dalam mengamankan gawang. Kiper mereka juga tampil dalam performa terbaik dengan beberapa penyelamatan gemilang di pertandingan-pertandingan penting. Organisasi pertahanan yang rapi membuat lawan kesulitan menciptakan peluang.\n\nDi lini depan, duet striker Inter menjadi mesin gol yang sangat produktif. Keduanya sudah mengumpulkan 28 gol gabungan di liga musim ini. Kerjasama apik mereka di dalam kotak penalti sering kali menjadi mimpi buruk bagi para bek lawan. Ditambah dukungan dari lini tengah yang kreatif, Inter memiliki banyak opsi dalam mencetak gol.\n\nDengan lini pertahanan yang kokoh dan serangan yang tajam, Inter menjadi kandidat kuat juara Serie A. Mereka saat ini unggul 5 poin dari Juventus di posisi kedua dan sepertinya akan sulit dikejar jika konsistensi ini terus terjaga. Para analis sepak bola Italia memprediksi Inter akan mengamankan gelar Scudetto bahkan sebelum musim berakhir.\n\nPelatih Inter menyatakan timnya harus tetap fokus dan tidak boleh terlena dengan posisi di klasemen. Ia mengingatkan bahwa masih ada separuh musim yang harus dilalui dan kompetisi bisa berubah kapan saja. Target utama adalah meraih gelar Scudetto sekaligus tampil maksimal di Liga Champions untuk memberikan kebanggaan bagi tifosi Nerazzurri.',
      en: 'Inter Milan continues to show extraordinary consistency in Serie A this season by winning their 14th victory from 18 league matches. The team nicknamed Nerazzurri has managed to maintain the top position with a very solid and convincing performance. The combination of a solid defense and productive attack makes Inter hard to beat by any team.\n\nInter\'s defense line is the best in Serie A this season with only 10 goals conceded. The back three guarded by the team captain looked very solid and compact in securing the goal. Their goalkeeper also performed at his best with several brilliant saves in important matches. The neat defensive organization makes opponents struggle to create chances.\n\nUp front, Inter\'s striker duo has become a very productive goal-scoring machine. The two have already collected 28 combined goals in the league this season. Their excellent partnership inside the penalty area often becomes a nightmare for opposing defenders. With support from a creative midfield, Inter has many options in scoring goals.\n\nWith a solid defense line and sharp attack, Inter is a strong candidate for the Serie A title. They are currently 5 points ahead of Juventus in second place and seem hard to catch if this consistency continues. Italian football analysts predict Inter will secure the Scudetto title even before the season ends.\n\nThe Inter coach stated that his team must stay focused and not be complacent with their position in the standings. He reminded that there is still half a season to go through and the competition can change at any time. The main target is to win the Scudetto title while performing maximally in the Champions League to give pride to the Nerazzurri tifosi.'
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
      id: 'Liverpool berhasil meraih kemenangan tipis 2-1 atas Newcastle United di kandang mereka, Anfield, dalam pertandingan pekan ke-20 Premier League. Pertandingan berjalan ketat dengan kedua tim saling serang dan menciptakan peluang-peluang berbahaya. Atmosfer Anfield yang legendaris memberikan dukungan luar biasa bagi The Reds sepanjang 90 menit.\n\nNewcastle tampil sangat kompetitif dan berhasil membuka keunggulan terlebih dahulu di menit ke-28 melalui serangan balik cepat. Liverpool tidak patah arang dan terus menekan pertahanan lawan. Gol penyeimbang datang di menit ke-55 melalui sundulan dari tendangan sudut. Stadion langsung bergemuruh menyambut gol tersebut.\n\nPertandingan semakin panas di 20 menit terakhir dengan kedua tim mengerahkan seluruh kemampuan untuk meraih kemenangan. Liverpool mendominasi penguasaan bola namun Newcastle berbahaya dalam serangan balik. Momen krusial terjadi di menit ke-82 ketika Liverpool mendapatkan tendangan penalti setelah pemain mereka dijatuhkan di kotak penalti.\n\nPenalti dieksekusi dengan sempurna oleh striker andalan Liverpool yang mengirim bola ke sudut kiri bawah gawang. Kiper Newcastle sudah bergerak ke arah yang benar namun tidak mampu menjangkau bola. Gol tersebut membuat Anfield meledak dalam kegembiraan dan Liverpool berhasil mengamankan tiga poin penting.\n\nKemenangan ini sangat penting bagi Liverpool dalam persaingan ketat di papan atas Premier League musim ini. Mereka kini berada di posisi kedua klasemen, hanya terpaut 4 poin dari Manchester City. Pelatih Liverpool menyatakan bangga dengan mentalitas tim yang tidak pernah menyerah meski tertinggal terlebih dahulu. Target utama adalah terus menekan City dan merebut gelar juara.',
      en: 'Liverpool managed to secure a narrow 2-1 victory over Newcastle United at their home ground, Anfield, in a Premier League week 20 match. The match was tight with both teams attacking each other and creating dangerous chances. The legendary Anfield atmosphere provided tremendous support for The Reds throughout the 90 minutes.\n\nNewcastle performed very competitively and managed to take the lead first in the 28th minute through a quick counter-attack. Liverpool did not give up and continued to pressure the opponent\'s defense. The equalizer came in the 55th minute through a header from a corner kick. The stadium immediately roared welcoming the goal.\n\nThe match got hotter in the last 20 minutes with both teams exerting all their abilities to win. Liverpool dominated ball possession but Newcastle was dangerous on the counter. A crucial moment occurred in the 82nd minute when Liverpool was awarded a penalty after their player was brought down in the penalty area.\n\nThe penalty was executed perfectly by Liverpool\'s main striker who sent the ball into the bottom left corner of the goal. The Newcastle goalkeeper moved in the right direction but was unable to reach the ball. That goal made Anfield erupt in joy and Liverpool successfully secured the crucial three points.\n\nThis victory is very important for Liverpool in the tight competition at the top of the Premier League this season. They are now in second place in the standings, only 4 points behind Manchester City. The Liverpool coach expressed pride in the team\'s mentality that never gave up even when trailing first. The main target is to continue pressing City and seize the championship title.'
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
