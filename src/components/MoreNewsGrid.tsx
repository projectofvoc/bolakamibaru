import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { CheckCircle, Bookmark } from 'lucide-react';
import { Article, Publisher } from '@/data/dummyData';
import { Button } from '@/components/ui/button';

// Additional articles for this section
const moreArticles: Article[] = [
  {
    id: 'm1',
    slug: 'persebaya-siapkan-strategi-khusus-hadapi-derby-jatim',
    title: {
      id: 'Persebaya Siapkan Strategi Khusus Hadapi Derby Jatim',
      en: 'Persebaya Prepares Special Strategy for East Java Derby'
    },
    excerpt: { id: '', en: '' },
    content: { id: 'Persebaya Surabaya telah menyiapkan strategi khusus untuk menghadapi Derby Jawa Timur.', en: 'Persebaya Surabaya has prepared a special strategy for the East Java Derby.' },
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
    category: 'Liga 1',
    author: 'Ahmad Rizky',
    timestamp: '1 jam lalu',
    date: '10 Januari 2026',
    club: 'Persebaya',
    publisher: { name: 'Kompas Bola', icon: '📰', verified: true },
    tags: ['liga 1', 'persebaya', 'derby jawa timur', 'strategi', 'arema']
  },
  {
    id: 'm2',
    slug: 'tottenham-taklukkan-aston-villa-di-kandang',
    title: {
      id: 'Tottenham Taklukkan Aston Villa di Kandang',
      en: 'Tottenham Beats Aston Villa at Home'
    },
    excerpt: { id: '', en: '' },
    content: { id: 'Tottenham Hotspur berhasil meraih kemenangan atas Aston Villa di kandang mereka.', en: 'Tottenham Hotspur managed to secure a victory over Aston Villa at their home ground.' },
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=250&fit=crop',
    category: 'Premier League',
    author: 'Michael Owen',
    timestamp: '2 jam lalu',
    date: '10 Januari 2026',
    club: 'Tottenham',
    publisher: { name: 'Sky Sports', icon: '📺', verified: true },
    tags: ['premier league', 'tottenham', 'aston villa', 'hasil pertandingan']
  },
  {
    id: 'm3',
    slug: 'ac-milan-lepas-dua-pemain-ke-liga-arab',
    title: {
      id: 'AC Milan Lepas Dua Pemain ke Liga Arab',
      en: 'AC Milan Releases Two Players to Arab League'
    },
    excerpt: { id: '', en: '' },
    content: { id: 'AC Milan melepas dua pemain mereka ke liga Arab dengan nilai transfer yang fantastis.', en: 'AC Milan released two of their players to the Arab league with fantastic transfer values.' },
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop',
    category: 'Transfer',
    author: 'Marco Rossi',
    timestamp: '3 jam lalu',
    date: '10 Januari 2026',
    club: 'AC Milan',
    publisher: { name: 'Gazzetta', icon: '🇮🇹', verified: true },
    tags: ['serie a', 'ac milan', 'transfer', 'liga arab', 'pemain asing']
  },
  {
    id: 'm4',
    slug: 'psm-makassar-rekrut-kiper-baru-dari-thailand',
    title: {
      id: 'PSM Makassar Rekrut Kiper Baru dari Thailand',
      en: 'PSM Makassar Signs New Goalkeeper from Thailand'
    },
    excerpt: { id: '', en: '' },
    content: { id: 'PSM Makassar mengumumkan kedatangan kiper baru dari Thailand untuk memperkuat lini pertahanan.', en: 'PSM Makassar announced the arrival of a new goalkeeper from Thailand to strengthen the defensive line.' },
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&h=250&fit=crop',
    category: 'Transfer',
    author: 'Budi Santoso',
    timestamp: '4 jam lalu',
    date: '10 Januari 2026',
    club: 'PSM',
    publisher: { name: 'Detik Sport', icon: '⚽', verified: true },
    tags: ['liga 1', 'psm makassar', 'transfer', 'kiper', 'pemain asing']
  },
  {
    id: 'm5',
    slug: 'barcelona-unggul-di-el-clasico-mini-melawan-atletico',
    title: {
      id: 'Barcelona Unggul di El Clasico Mini Melawan Atletico',
      en: 'Barcelona Wins Mini El Clasico Against Atletico'
    },
    excerpt: { id: '', en: '' },
    content: { id: 'Barcelona berhasil meraih kemenangan penting atas Atletico Madrid dalam pertandingan yang sering disebut El Clasico Mini.', en: 'Barcelona managed to secure an important victory over Atletico Madrid in a match often called the Mini El Clasico.' },
    image: 'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=400&h=250&fit=crop',
    category: 'La Liga',
    author: 'Carlos Martinez',
    timestamp: '5 jam lalu',
    date: '10 Januari 2026',
    club: 'Barcelona',
    publisher: { name: 'Marca', icon: '📰', verified: true },
    tags: ['la liga', 'barcelona', 'atletico madrid', 'el clasico', 'hasil pertandingan']
  },
  {
    id: 'm6',
    slug: 'bali-united-raih-tiga-poin-penting-di-kandang',
    title: {
      id: 'Bali United Raih Tiga Poin Penting di Kandang',
      en: 'Bali United Secures Crucial Three Points at Home'
    },
    excerpt: { id: '', en: '' },
    content: { id: 'Bali United berhasil meraih kemenangan penting di kandang mereka untuk menjaga posisi di papan atas.', en: 'Bali United managed to secure an important victory at their home ground to maintain their position at the top.' },
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=250&fit=crop',
    category: 'Liga 1',
    author: 'Dewi Lestari',
    timestamp: '6 jam lalu',
    date: '10 Januari 2026',
    club: 'Bali United',
    publisher: { name: 'Bola.com', icon: '🏟️', verified: true },
    tags: ['liga 1', 'bali united', 'hasil pertandingan', 'kemenangan']
  },
  {
    id: 'm7',
    slug: 'psg-pesta-gol-ke-gawang-lens',
    title: {
      id: 'PSG Pesta Gol ke Gawang Lens',
      en: 'PSG Scores Multiple Goals Against Lens'
    },
    excerpt: { id: '', en: '' },
    content: { id: 'Paris Saint-Germain pesta gol saat menjamu Lens di Parc des Princes dalam lanjutan Ligue 1.', en: 'Paris Saint-Germain scored multiple goals while hosting Lens at Parc des Princes in the Ligue 1 continuation.' },
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=250&fit=crop',
    category: 'Ligue 1',
    author: 'Pierre Dubois',
    timestamp: '7 jam lalu',
    date: '10 Januari 2026',
    club: 'PSG',
    publisher: { name: 'L\'Equipe', icon: '🇫🇷', verified: true },
    tags: ['ligue 1', 'psg', 'lens', 'hasil pertandingan', 'pesta gol']
  },
  {
    id: 'm8',
    slug: 'rb-leipzig-kalahkan-wolfsburg-di-bundesliga',
    title: {
      id: 'RB Leipzig Kalahkan Wolfsburg di Bundesliga',
      en: 'RB Leipzig Defeats Wolfsburg in Bundesliga'
    },
    excerpt: { id: '', en: '' },
    content: { id: 'RB Leipzig berhasil mengalahkan Wolfsburg dalam pertandingan Bundesliga yang berlangsung ketat.', en: 'RB Leipzig managed to defeat Wolfsburg in a tight Bundesliga match.' },
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=250&fit=crop',
    category: 'Bundesliga',
    author: 'Hans Mueller',
    timestamp: '8 jam lalu',
    date: '10 Januari 2026',
    club: 'Leipzig',
    publisher: { name: 'Kicker', icon: '⚽', verified: true },
    tags: ['bundesliga', 'rb leipzig', 'wolfsburg', 'hasil pertandingan']
  },
  {
    id: 'm9',
    slug: 'persib-bandung-puncaki-klasemen-sementara',
    title: {
      id: 'Persib Bandung Puncaki Klasemen Sementara',
      en: 'Persib Bandung Tops Temporary Standings'
    },
    excerpt: { id: '', en: '' },
    content: { id: 'Persib Bandung berhasil naik ke puncak klasemen sementara Liga 1 setelah meraih kemenangan.', en: 'Persib Bandung managed to climb to the top of the temporary Liga 1 standings after securing a victory.' },
    image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=250&fit=crop',
    category: 'Liga 1',
    author: 'Eko Prasetyo',
    timestamp: '9 jam lalu',
    date: '10 Januari 2026',
    club: 'Persib',
    publisher: { name: 'Goal Indonesia', icon: '🎯', verified: false },
    tags: ['liga 1', 'persib', 'klasemen', 'puncak klasemen']
  },
  {
    id: 'm10',
    slug: 'napoli-pertahankan-posisi-tiga-besar-serie-a',
    title: {
      id: 'Napoli Pertahankan Posisi Tiga Besar Serie A',
      en: 'Napoli Maintains Top Three Position in Serie A'
    },
    excerpt: { id: '', en: '' },
    content: { id: 'Napoli terus mempertahankan posisi di tiga besar klasemen Serie A setelah bermain imbang.', en: 'Napoli continues to maintain a position in the top three of the Serie A standings after a draw.' },
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=250&fit=crop',
    category: 'Serie A',
    author: 'Marco Rossi',
    timestamp: '10 jam lalu',
    date: '10 Januari 2026',
    club: 'Napoli',
    publisher: { name: 'Gazzetta', icon: '🇮🇹', verified: true },
    tags: ['serie a', 'napoli', 'klasemen', 'tiga besar']
  }
];

const MoreNewsGrid: React.FC = () => {
  const { language, t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(10);

  const visibleArticles = moreArticles.slice(0, visibleCount);
  const hasMore = visibleCount < moreArticles.length;

  return (
    <section className="pb-16">
      <div className="container mx-auto px-4">

        {/* Grid - 5 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {visibleArticles.map((article, index) => (
            <Link key={article.id} to={`/news/${article.slug}`}>
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
              >
              <div className="relative rounded-lg overflow-hidden bg-card aspect-[4/3]">
                <img
                  src={article.image}
                  alt={article.title[language]}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 text-xs font-semibold bg-primary/90 text-primary-foreground rounded-full">
                    {article.category}
                  </span>
                </div>
                {/* Club Badge */}
                {article.club && (
                  <div className="absolute top-3 right-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-background/80 rounded-full text-xs font-bold">
                      {article.club.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {article.title[language]}
                </h3>
                
                {/* Publisher Metadata Footer */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* Publisher Icon */}
                    <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-muted rounded-full text-xs">
                      {article.publisher.icon}
                    </span>
                    
                    {/* Publisher Name */}
                    <span className="text-sm text-muted-foreground truncate max-w-[80px]">
                      {article.publisher.name}
                    </span>
                    
                    {/* Verified Badge */}
                    {article.publisher.verified && (
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-primary fill-primary/20" />
                    )}
                    
                    {/* Separator */}
                    <span className="text-muted-foreground/50 flex-shrink-0">·</span>
                    
                    {/* Timestamp */}
                    <span className="text-sm text-muted-foreground truncate">
                      {article.timestamp}
                    </span>
                  </div>
                  
                  {/* Bookmark Button */}
                  <button className="p-1.5 hover:bg-muted rounded-md transition-colors flex-shrink-0">
                    <Bookmark className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.article>
            </Link>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-10 text-center">
            <Button
              variant="outline"
              className="rounded-full px-8"
              onClick={() => setVisibleCount(prev => prev + 10)}
            >
              {t('section.seeMore')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default MoreNewsGrid;
