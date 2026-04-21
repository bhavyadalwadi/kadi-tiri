// UI Component types for Kadi Tiri game

import { Card, Player, GameState, Bid } from './game';

export interface CardProps {
  card: Card;
  isPlayable?: boolean;
  isSelected?: boolean;
  isHidden?: boolean;
  onClick?: (card: Card) => void;
  onHover?: (card: Card) => void;
  size?: 'small' | 'medium' | 'large';
  orientation?: 'portrait' | 'landscape';
  animation?: 'deal' | 'flip' | 'hover' | 'none';
  animationDelay?: number;
  showDealAnimation?: boolean;
}

export interface PlayerHandProps {
  player: Player;
  isCurrentPlayer?: boolean;
  onCardClick?: (card: Card) => void;
  showCards?: boolean;
  maxCards?: number;
}

export interface GameTableProps {
  gameState: GameState;
  currentPlayerId: string;
  onCardPlay?: (card: Card) => void;
  onPlayerAction?: (action: string) => void;
}

export interface BiddingPanelProps {
  currentBid: number;
  maxBid: number;
  increment: number;
  onBid?: (amount: number) => void;
  onPass?: () => void;
  isActive?: boolean;
  playerTurn?: boolean;
}

export interface ScoreboardProps {
  players: Player[];
  teams?: {
    bidWinnerTeam: string[];
    opposingTeam: string[];
  };
  currentScores: { [playerId: string]: number };
  targetScore?: number;
}

export interface GameSetupProps {
  onGameCreate: (settings: GameCreationSettings) => void;
  onGameJoin: (gameId: string, playerName: string) => void;
  availableGames?: GameLobby[];
}

export interface GameCreationSettings {
  playerNames: string[];
  gameMode: '4_players' | '6_players_one_deck' | '6_players_two_decks' | '8_players';
  allowSecretPartners: boolean;
  gameSpeed: 'slow' | 'normal' | 'fast';
}

export interface GameLobby {
  id: string;
  hostName: string;
  players: string[];
  maxPlayers: number;
  gameMode: string;
  status: 'waiting' | 'starting' | 'in-progress';
  createdAt: number;
}

export interface NotificationProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  children: React.ReactNode;
}

export interface LoadingProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  children?: React.ReactNode;
}

export interface GameControlsProps {
  canUndo?: boolean;
  canRedo?: boolean;
  canSave?: boolean;
  canPause?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onPause?: () => void;
  onQuit?: () => void;
}

export interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
  maxMessages?: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system' | 'game-action';
}

// Animation types
export interface CardAnimation {
  type: 'deal' | 'flip' | 'move' | 'highlight';
  duration: number;
  delay?: number;
  easing?: string;
}

export interface TablePosition {
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
}

// Theme types
export interface GameTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
  };
  cardStyles: {
    background: string;
    border: string;
    shadow: string;
    hoverEffect: string;
  };
  tableStyle: {
    background: string;
    felt: string;
    border: string;
  };
}

// Responsive design types
export interface BreakpointProps {
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
  orientation?: 'portrait' | 'landscape';
}

export interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}