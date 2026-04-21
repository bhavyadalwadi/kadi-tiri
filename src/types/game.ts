// Core game types for Kadi Tiri card game

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
export type GameStatus = 'waiting' | 'setup' | 'dealing' | 'bidding' | 'partner-selection' | 'playing' | 'finished';
export type Difficulty = 'easy' | 'hard';

export interface Card {
  rank: Rank;
  suit: Suit;
  id: string;
  points: number;
  isKaliTiri?: boolean; // Special 3♠ cards
}

export interface Player {
  id: string;
  name: string;
  cards: Card[];
  score: number;
  isDealer?: boolean;
  isActive?: boolean;
  position: number; // 0-7 for 8 players max
  avatar?: string;
}

export interface GameMode {
  key: string;
  label: string;
  players: number;
  decks: number;
  cardsPerPlayer: number;
  totalPoints: number;
  removeCards?: string[];
  rounds: number;
  supportedDifficulties: readonly Difficulty[];
}

export interface BiddingConfig {
  startBid: number;
  maxBid: number;
  increments: number[];
}

export interface DifficultyConfig {
  difficulty: Difficulty;
  bidderTeamSize: number;
  partnerCount: number;
  bidding: BiddingConfig;
}

export interface Bid {
  playerId: string;
  amount: number;
  timestamp: number;
  passed?: boolean;
}

export interface Partnership {
  bidWinner: string;
  partners: string[];
  partnerCards: Card[];
  revealed: boolean;
}

export interface PlayedCard {
  playerId: string;
  playerName: string;
  card: Card;
  playOrder: number;
}

export interface Trick {
  id: string;
  cards: PlayedCard[];
  leadSuit: Suit | null;
  winner: string | null;
  points: number;
  completed: boolean;
}

export interface GameRound {
  roundNumber: number;
  leadPlayer: string;
  cardsPlayed: { playerId: string; card: Card; order: number }[];
  winner: string;
  points: number;
  powerhouseCard?: Card;
}

export interface GameSettings {
  mode: GameMode;
  difficulty: Difficulty;
  difficultyConfig: DifficultyConfig;
  biddingConfig: BiddingConfig;
  powerhouseSuit: Suit | null;
  partnership: Partnership | null;
  allowSecretPartners: boolean;
  enableRedeal: boolean;
  gameSpeed: 'slow' | 'normal' | 'fast';
}

export interface GameState {
  id: string;
  status: 'waiting' | 'setup' | 'dealing' | 'bidding' | 'partner-selection' | 'playing' | 'finished';
  players: Player[];
  currentPlayer: string;
  deck: Card[];
  discardPile: Card[];
  settings: GameSettings;
  bidding: {
    bids: Bid[];
    currentBid: number;
    winner: string | null;
    isActive: boolean;
  };
  currentTrick: Trick | null;
  completedTricks: Trick[];
  rounds: GameRound[];
  currentRound: number;
  scores: {
    bidWinnerTeam: number;
    opposingTeam: number;
    breakdown: { [playerId: string]: number };
  };
  winner: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface GameAction {
  type: 'PLAY_CARD' | 'PLACE_BID' | 'SELECT_PARTNER' | 'CHOOSE_POWERHOUSE' | 'PASS_TURN';
  playerId: string;
  payload: any;
  timestamp: number;
}

export interface GameHistory {
  gameId: string;
  actions: GameAction[];
  finalState: GameState;
  duration: number;
}

// API Types
export interface CreateGameRequest {
  playerNames: string[];
  gameMode: keyof typeof GAME_MODES;
  difficulty: Difficulty;
  settings?: Partial<GameSettings>;
}

export interface JoinGameRequest {
  gameId: string;
  playerName: string;
}

export interface GameResponse {
  success: boolean;
  data?: GameState;
  error?: string;
}

// Constants
export const GAME_MODES = {
  '4_players': {
    key: '4_players',
    label: '4 Players',
    players: 4,
    decks: 1,
    cardsPerPlayer: 13,
    totalPoints: 250,
    rounds: 13,
    supportedDifficulties: ['easy']
  },
  '6_players_one_deck': {
    key: '6_players_one_deck',
    label: '6 Players (1 Deck)',
    players: 6,
    decks: 1,
    cardsPerPlayer: 8,
    totalPoints: 250,
    removeCards: ['2♠', '2♥', '2♦', '2♣'],
    rounds: 8,
    supportedDifficulties: ['easy', 'hard']
  },
  '6_players_two_decks': {
    key: '6_players_two_decks',
    label: '6 Players (2 Decks)',
    players: 6,
    decks: 2,
    cardsPerPlayer: 17,
    totalPoints: 500,
    removeCards: ['2♠', '2♠'],
    rounds: 17,
    supportedDifficulties: ['easy', 'hard']
  },
  '8_players': {
    key: '8_players',
    label: '8 Players',
    players: 8,
    decks: 2,
    cardsPerPlayer: 13,
    totalPoints: 500,
    rounds: 13,
    supportedDifficulties: ['easy', 'hard']
  }
} as const;

export const CARD_POINTS = {
  'kaliTiri': 30, // 3♠
  'highCards': 10, // A, K, Q, J, 10
  'fives': 5, // All 5s
  'others': 0 // 7s and other cards
} as const;

export const DIFFICULTY_CONFIGS: Record<number, Record<Difficulty, DifficultyConfig>> = {
  4: {
    easy: {
      difficulty: 'easy',
      bidderTeamSize: 2,
      partnerCount: 1,
      bidding: {
        startBid: 125,
        maxBid: 250,
        increments: [5, 10]
      }
    },
    hard: {
      difficulty: 'hard',
      bidderTeamSize: 2,
      partnerCount: 1,
      bidding: {
        startBid: 125,
        maxBid: 250,
        increments: [5, 10]
      }
    }
  },
  6: {
    easy: {
      difficulty: 'easy',
      bidderTeamSize: 3,
      partnerCount: 2,
      bidding: {
        startBid: 125,
        maxBid: 500,
        increments: [5, 10]
      }
    },
    hard: {
      difficulty: 'hard',
      bidderTeamSize: 2,
      partnerCount: 1,
      bidding: {
        startBid: 100,
        maxBid: 500,
        increments: [5, 10]
      }
    }
  },
  8: {
    easy: {
      difficulty: 'easy',
      bidderTeamSize: 4,
      partnerCount: 3,
      bidding: {
        startBid: 250,
        maxBid: 500,
        increments: [5, 10]
      }
    },
    hard: {
      difficulty: 'hard',
      bidderTeamSize: 3,
      partnerCount: 2,
      bidding: {
        startBid: 180,
        maxBid: 500,
        increments: [5, 10]
      }
    }
  }
} as const;

export const POWERHOUSE_SUITS: Suit[] = ['♠', '♥', '♦', '♣'];

export function getDifficultyConfig(players: number, difficulty: Difficulty): DifficultyConfig {
  const config = DIFFICULTY_CONFIGS[players]?.[difficulty];
  if (!config) {
    throw new Error(`Unsupported rules config for ${players} players on ${difficulty}`);
  }
  return {
    ...config,
    bidding: {
      ...config.bidding
    }
  };
}
