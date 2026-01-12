export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'live' | 'ft' | 'post' | 'scheduled';
  minute?: number;
  time?: string;
  league: string;
  leagueCountry?: string;
}

export interface UpcomingMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  leagueColor: string;
  time: string;
  dateLabel: { id: string; en: string };
}

export interface League {
  id: string;
  name: string;
  icon: string;
  country?: string;
}
