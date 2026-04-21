// Utility types for Kadi Tiri game

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface StorageManager {
  save: <T>(key: string, data: T) => Promise<boolean>;
  load: <T>(key: string) => Promise<T | null>;
  remove: (key: string) => Promise<boolean>;
  clear: () => Promise<boolean>;
  exists: (key: string) => Promise<boolean>;
}

export interface GameValidator {
  validateCard: (card: any) => card is Card;
  validatePlayer: (player: any) => player is Player;
  validateGameState: (state: any) => state is GameState;
  validateMove: (gameState: GameState, playerId: string, card: Card) => ValidationResult;
  validateBid: (gameState: GameState, playerId: string, bidAmount: number) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

export interface GameLogger {
  info: (message: string, context?: any) => void;
  warn: (message: string, context?: any) => void;
  error: (message: string, error?: Error, context?: any) => void;
  debug: (message: string, context?: any) => void;
  gameAction: (action: string, playerId: string, details?: any) => void;
}

export interface ErrorHandler {
  handleError: (error: Error, context?: string) => void;
  handleGameError: (error: GameError) => void;
  handleNetworkError: (error: NetworkError) => void;
  recovery: (errorType: string) => Promise<boolean>;
}

export interface GameError {
  type: 'INVALID_MOVE' | 'GAME_RULE_VIOLATION' | 'PLAYER_NOT_FOUND' | 'INVALID_STATE';
  message: string;
  playerId?: string;
  gameId?: string;
  context?: any;
}

export interface NetworkError {
  type: 'CONNECTION_LOST' | 'SERVER_ERROR' | 'TIMEOUT' | 'INVALID_RESPONSE';
  message: string;
  status?: number;
  retryable: boolean;
}

export interface PerformanceMonitor {
  startTimer: (name: string) => void;
  endTimer: (name: string) => number;
  trackEvent: (event: string, properties?: any) => void;
  trackError: (error: Error, context?: any) => void;
  getMetrics: () => PerformanceMetrics;
}

export interface PerformanceMetrics {
  gameLoadTime: number;
  averageResponseTime: number;
  totalGames: number;
  errorRate: number;
  memoryUsage?: number;
}

export interface ConfigManager {
  get: <T>(key: string, defaultValue?: T) => T;
  set: <T>(key: string, value: T) => void;
  reset: (key?: string) => void;
  getAll: () => Record<string, any>;
}

export interface AudioManager {
  playSound: (soundName: string, volume?: number) => Promise<void>;
  playMusic: (trackName: string, loop?: boolean, volume?: number) => Promise<void>;
  stopSound: (soundName: string) => void;
  stopMusic: () => void;
  setVolume: (type: 'sound' | 'music', volume: number) => void;
  preloadSounds: (soundNames: string[]) => Promise<void>;
}

export interface NotificationManager {
  show: (notification: NotificationData) => string;
  hide: (id: string) => void;
  clear: () => void;
  subscribe: (callback: (notifications: NotificationData[]) => void) => () => void;
}

export interface NotificationData {
  id?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event system types
export interface EventEmitter {
  on: (event: string, callback: Function) => () => void;
  emit: (event: string, ...args: any[]) => void;
  off: (event: string, callback: Function) => void;
  once: (event: string, callback: Function) => () => void;
}

export interface GameEvents {
  'game:started': (gameState: GameState) => void;
  'game:ended': (gameState: GameState) => void;
  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
  'card:played': (playerId: string, card: Card) => void;
  'bid:placed': (playerId: string, bid: Bid) => void;
  'round:started': (roundNumber: number) => void;
  'round:ended': (roundNumber: number, winner: string) => void;
  'error:occurred': (error: GameError) => void;
}

// Import types from other files
import { Card, Player, GameState, Bid } from './game';