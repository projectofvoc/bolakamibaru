import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { CheckCircle, Bookmark } from 'lucide-react';
import { Article, Publisher } from '@/data/dummyData';

// Additional articles for this section
const moreArticles: Article[] = [
  {
    id: 'm1',
    title: {
      id: 'Persebaya Siapkan Strategi Khusus Hadapi Derby Jatim',
      en: 'Persebaya Prepares Special Strategy for East Java Derby'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
    category: 'Liga 1',
    author: 'Ahmad Rizky',
    timestamp: '1 jam lalu',
    club: 'Persebaya',
    publisher: { name: 'Kompas Bola', icon: '📰', verified: true }
  },
  {
    id: 'm2',
    title: {
      id: 'Tottenham Taklukkan Aston Villa di Kandang',
      en: 'Tottenham Beats Aston Villa at Home'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=250&fit=crop',
    category: 'Premier League',
    author: 'Michael Owen',
    timestamp: '2 jam lalu',
    club: 'Tottenham',
    publisher: { name: 'Sky Sports', icon: '📺', verified: true }
  },
  {
    id: 'm3',
    title: {
      id: 'AC Milan Lepas Dua Pemain ke Liga Arab',
      en: 'AC Milan Releases Two Players to Arab League'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop',
    category: 'Transfer',
    author: 'Marco Rossi',
    timestamp: '3 jam lalu',
    club: 'AC Milan',
    publisher: { name: 'Gazzetta', icon: '🇮🇹', verified: true }
  },
  {
    id: 'm4',
    title: {
      id: 'PSM Makassar Rekrut Kiper Baru dari Thailand',
      en: 'PSM Makassar Signs New Goalkeeper from Thailand'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&h=250&fit=crop',
    category: 'Transfer',
    author: 'Budi Santoso',
    timestamp: '4 jam lalu',
    club: 'PSM',
    publisher: { name: 'Detik Sport', icon: '⚽', verified: true }
  },
  {
    id: 'm5',
    title: {
      id: 'Barcelona Unggul di El Clasico Mini Melawan Atletico',
      en: 'Barcelona Wins Mini El Clasico Against Atletico'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=400&h=250&fit=crop',
    category: 'La Liga',
    author: 'Carlos Martinez',
    timestamp: '5 jam lalu',
    club: 'Barcelona',
    publisher: { name: 'Marca', icon: '📰', verified: true }
  },
  {
    id: 'm6',
    title: {
      id: 'Bali United Raih Tiga Poin Penting di Kandang',
      en: 'Bali United Secures Crucial Three Points at Home'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=250&fit=crop',
    category: 'Liga 1',
    author: 'Dewi Lestari',
    timestamp: '6 jam lalu',
    club: 'Bali United',
    publisher: { name: 'Bola.com', icon: '🏟️', verified: true }
  },
  {
    id: 'm7',
    title: {
      id: 'PSG Pesta Gol ke Gawang Lens',
      en: 'PSG Scores Multiple Goals Against Lens'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=250&fit=crop',
    category: 'Ligue 1',
    author: 'Pierre Dubois',
    timestamp: '7 jam lalu',
    club: 'PSG',
    publisher: { name: 'L\'Equipe', icon: '🇫🇷', verified: true }
  },
  {
    id: 'm8',
    title: {
      id: 'RB Leipzig Kalahkan Wolfsburg di Bundesliga',
      en: 'RB Leipzig Defeats Wolfsburg in Bundesliga'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=250&fit=crop',
    category: 'Bundesliga',
    author: 'Hans Mueller',
    timestamp: '8 jam lalu',
    club: 'Leipzig',
    publisher: { name: 'Kicker', icon: '⚽', verified: true }
  },
  {
    id: 'm9',
    title: {
      id: 'Persib Bandung Puncaki Klasemen Sementara',
      en: 'Persib Bandung Tops Temporary Standings'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=250&fit=crop',
    category: 'Liga 1',
    author: 'Eko Prasetyo',
    timestamp: '9 jam lalu',
    club: 'Persib',
    publisher: { name: 'Goal Indonesia', icon: '🎯', verified: false }
  },
  {
    id: 'm10',
    title: {
      id: 'Napoli Pertahankan Posisi Tiga Besar Serie A',
      en: 'Napoli Maintains Top Three Position in Serie A'
    },
    excerpt: { id: '', en: '' },
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=250&fit=crop',
    category: 'Serie A',
    author: 'Marco Rossi',
    timestamp: '10 jam lalu',
    club: 'Napoli',
    publisher: { name: 'Gazzetta', icon: '🇮🇹', verified: true }
  }
];

const MoreNewsGrid: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <section className="py-12 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
          {t('section.moreNews')}
        </h2>

        {/* Grid - 5 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {moreArticles.map((article, index) => (
            <motion.article
              key={article.id}
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
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 text-xs font-semibold bg-primary/90 text-primary-foreground rounded">
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
          ))}
        </div>

        {/* See More Button */}
        <div className="mt-10 text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 border border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {t('section.seeMore')}
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default MoreNewsGrid;
