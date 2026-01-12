import { Match, UpcomingMatch, League } from '@/types/matches';

export const leagues: League[] = [
  { id: 'liga-1', name: 'Liga 1', icon: '🇮🇩', country: 'Indonesia' },
  { id: 'epl', name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  { id: 'laliga', name: 'La Liga', icon: '🇪🇸', country: 'Spain' },
  { id: 'seriea', name: 'Serie A', icon: '🇮🇹', country: 'Italy' },
  { id: 'bundesliga', name: 'Bundesliga', icon: '🇩🇪', country: 'Germany' },
  { id: 'ucl', name: 'Champions League', icon: '🏆', country: 'Europe' },
];

export const matches: Match[] = [
  // Live matches
  { id: 'm1', homeTeam: 'Persija Jakarta', awayTeam: 'Persib Bandung', homeScore: 2, awayScore: 1, status: 'live', minute: 67, league: 'Liga 1', leagueCountry: 'Indonesia' },
  { id: 'm2', homeTeam: 'Arsenal', awayTeam: 'Chelsea', homeScore: 1, awayScore: 1, status: 'live', minute: 45, league: 'Premier League', leagueCountry: 'England' },
  
  // Finished matches
  { id: 'm3', homeTeam: 'Arema FC', awayTeam: 'PSM Makassar', homeScore: 3, awayScore: 2, status: 'ft', league: 'Liga 1', leagueCountry: 'Indonesia' },
  { id: 'm4', homeTeam: 'Liverpool', awayTeam: 'Man United', homeScore: 2, awayScore: 0, status: 'ft', league: 'Premier League', leagueCountry: 'England' },
  { id: 'm5', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', homeScore: 2, awayScore: 2, status: 'ft', league: 'La Liga', leagueCountry: 'Spain' },
  { id: 'm6', homeTeam: 'Bayern Munich', awayTeam: 'Dortmund', homeScore: 4, awayScore: 1, status: 'ft', league: 'Bundesliga', leagueCountry: 'Germany' },
  { id: 'm7', homeTeam: 'AC Milan', awayTeam: 'Inter Milan', homeScore: 1, awayScore: 2, status: 'ft', league: 'Serie A', leagueCountry: 'Italy' },
  { id: 'm8', homeTeam: 'Juventus', awayTeam: 'Napoli', homeScore: 0, awayScore: 1, status: 'ft', league: 'Serie A', leagueCountry: 'Italy' },
  
  // Scheduled matches
  { id: 'm9', homeTeam: 'Bali United', awayTeam: 'PSIS Semarang', status: 'scheduled', time: '19:30', league: 'Liga 1', leagueCountry: 'Indonesia' },
  { id: 'm10', homeTeam: 'Man City', awayTeam: 'Tottenham', status: 'scheduled', time: '20:00', league: 'Premier League', leagueCountry: 'England' },
  { id: 'm11', homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla', status: 'scheduled', time: '21:00', league: 'La Liga', leagueCountry: 'Spain' },
];

export const upcomingMatches: UpcomingMatch[] = [
  { id: 'u1', homeTeam: 'Persija Jakarta', awayTeam: 'Persib Bandung', league: 'Liga 1', leagueColor: 'green', time: '19:30', dateLabel: { id: 'Besok', en: 'Tomorrow' } },
  { id: 'u2', homeTeam: 'Arsenal', awayTeam: 'Liverpool', league: 'EPL', leagueColor: 'purple', time: '22:00', dateLabel: { id: 'Sabtu', en: 'Saturday' } },
  { id: 'u3', homeTeam: 'Real Madrid', awayTeam: 'Atletico Madrid', league: 'La Liga', leagueColor: 'orange', time: '02:00', dateLabel: { id: 'Minggu', en: 'Sunday' } },
  { id: 'u4', homeTeam: 'Bayern Munich', awayTeam: 'RB Leipzig', league: 'Bundesliga', leagueColor: 'red', time: '23:30', dateLabel: { id: 'Sabtu', en: 'Saturday' } },
  { id: 'u5', homeTeam: 'AC Milan', awayTeam: 'Juventus', league: 'Serie A', leagueColor: 'blue', time: '02:45', dateLabel: { id: 'Minggu', en: 'Sunday' } },
  { id: 'u6', homeTeam: 'PSG', awayTeam: 'Man City', league: 'Champions League', leagueColor: 'blue', time: '03:00', dateLabel: { id: 'Rabu', en: 'Wednesday' } },
  { id: 'u7', homeTeam: 'Bali United', awayTeam: 'PSM Makassar', league: 'Liga 1', leagueColor: 'green', time: '15:00', dateLabel: { id: 'Sabtu', en: 'Saturday' } },
  { id: 'u8', homeTeam: 'Chelsea', awayTeam: 'Tottenham', league: 'EPL', leagueColor: 'purple', time: '19:30', dateLabel: { id: 'Minggu', en: 'Sunday' } },
  { id: 'u9', homeTeam: 'Barcelona', awayTeam: 'Valencia', league: 'La Liga', leagueColor: 'orange', time: '22:00', dateLabel: { id: 'Senin', en: 'Monday' } },
  { id: 'u10', homeTeam: 'Dortmund', awayTeam: 'Leverkusen', league: 'Bundesliga', leagueColor: 'red', time: '23:30', dateLabel: { id: 'Sabtu', en: 'Saturday' } },
  { id: 'u11', homeTeam: 'Inter Milan', awayTeam: 'Roma', league: 'Serie A', leagueColor: 'blue', time: '02:45', dateLabel: { id: 'Minggu', en: 'Sunday' } },
  { id: 'u12', homeTeam: 'Arema FC', awayTeam: 'Persebaya', league: 'Liga 1', leagueColor: 'green', time: '19:00', dateLabel: { id: 'Jumat', en: 'Friday' } },
];
