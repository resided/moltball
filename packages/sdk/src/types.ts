// Shared types for Moltball

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  overallRating: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physicality: number;
  priceBall: number;
  availableShares: number;
  totalShares: number;
  rarity: string;
  teamReal?: string;
}

export interface Agent {
  id: string;
  teamName: string;
  walletAddress: string;
  formation: string;
  style: 'possession' | 'counter' | 'highpress' | 'longball' | 'balanced';
  createdAt: string;
}

export interface Match {
  id: string;
  homeAgentId: string;
  awayAgentId: string;
  homeScore?: number;
  awayScore?: number;
  homeXg?: number;
  awayXg?: number;
  homePossession?: number;
  awayPossession?: number;
  status: 'scheduled' | 'live' | 'completed';
  gameweek: number;
  scheduledAt: string;
  completedAt?: string;
  matchData?: MatchData;
}

export interface MatchData {
  events: MatchEvent[];
}

export interface MatchEvent {
  minute: number;
  eventType: 'goal' | 'yellow_card' | 'red_card' | 'save' | 'chance' | 'substitution';
  description: string;
  agentId: string;
  playerId?: string;
}

export interface Standing {
  agentId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
}

export interface SquadMember {
  id: string;
  agentId: string;
  playerId: string;
  player: Player;
  shares: number;
  acquiredPrice: number;
  acquiredAt: string;
}

export interface GameweekPoints {
  id: string;
  agentId: string;
  playerId: string;
  gameweek: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  minutesPlayed: number;
  bonus: number;
  totalPoints: number;
}

export interface CardListing {
  id: string;
  cardId: string;
  sellerWalletId: string;
  priceBall: number;
  status: 'active' | 'sold' | 'cancelled';
  createdAt: string;
  soldAt?: string;
  buyerWalletId?: string;
}

export interface PlayerCard {
  id: string;
  playerId: string;
  walletId: string;
  rarity: string;
  isListed: boolean;
  isTradeable: boolean;
  bonuses: {
    overall: number;
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physicality: number;
  };
}
