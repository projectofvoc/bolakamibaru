import React from 'react';
import { Match } from '@/types/matches';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const getStatusBadge = () => {
    switch (match.status) {
      case 'live':
        return (
          <span className="px-2 py-0.5 text-xs font-bold bg-live text-live-foreground rounded-full live-pulse">
            {match.minute}'
          </span>
        );
      case 'ft':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold bg-finished text-finished-foreground rounded-full">
            FT
          </span>
        );
      case 'post':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold bg-warning text-warning-foreground rounded-full">
            POST
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {match.time}
          </span>
        );
    }
  };

  const getTeamInitials = (team: string) => {
    return team.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  };

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg bg-card hover:bg-card-hover transition-colors cursor-pointer group",
      match.status === 'live' && "border-l-2 border-l-live"
    )}>
      {/* Status */}
      <div className="flex-shrink-0 w-16 text-center">
        {getStatusBadge()}
      </div>

      {/* Home Team */}
      <div className="flex-1 flex items-center justify-end gap-3">
        <span className={cn(
          "text-sm font-medium text-right",
          match.status === 'ft' && match.homeScore !== undefined && match.awayScore !== undefined && match.homeScore > match.awayScore 
            ? "text-foreground" 
            : "text-muted-foreground"
        )}>
          {match.homeTeam}
        </span>
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
          {getTeamInitials(match.homeTeam)}
        </div>
      </div>

      {/* Score */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <div className={cn(
          "w-8 h-8 flex items-center justify-center text-sm font-bold rounded",
          match.status === 'scheduled' ? "bg-secondary text-muted-foreground" : "bg-secondary text-foreground"
        )}>
          {match.homeScore ?? '-'}
        </div>
        <div className={cn(
          "w-8 h-8 flex items-center justify-center text-sm font-bold rounded",
          match.status === 'scheduled' ? "bg-secondary text-muted-foreground" : "bg-secondary text-foreground"
        )}>
          {match.awayScore ?? '-'}
        </div>
      </div>

      {/* Away Team */}
      <div className="flex-1 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
          {getTeamInitials(match.awayTeam)}
        </div>
        <span className={cn(
          "text-sm font-medium",
          match.status === 'ft' && match.homeScore !== undefined && match.awayScore !== undefined && match.awayScore > match.homeScore 
            ? "text-foreground" 
            : "text-muted-foreground"
        )}>
          {match.awayTeam}
        </span>
      </div>

      {/* Arrow */}
      <ChevronRight className="flex-shrink-0 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default MatchCard;
