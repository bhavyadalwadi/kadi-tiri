import {
  GameMode,
  GameSettings,
  GameState,
  Difficulty,
  GAME_MODES,
  getDifficultyConfig,
  Player
} from '@/types/game';
import {
  createDeck,
  generateGameId,
  generatePlayerId,
  removeCardsFromDeck
} from '@/utils/gameUtils';

type CreateRoomOptions = {
  hostName?: string;
  playerNames?: string[];
  gameMode: keyof typeof GAME_MODES;
  difficulty?: Difficulty;
  settings?: Partial<GameSettings>;
  status?: 'waiting' | 'setup';
};

function buildPlayers(playerNames: string[]): Player[] {
  return playerNames.map((name, index) => ({
    id: generatePlayerId(),
    name: name.trim(),
    cards: [],
    score: 0,
    position: index,
    isDealer: index === 0,
    isActive: index === 0
  }));
}

export function createInitialGameState(options: CreateRoomOptions): {
  gameState: GameState;
  currentPlayerId: string;
} {
  const playerNames =
    options.playerNames?.map(name => name.trim()).filter(Boolean) ||
    (options.hostName ? [options.hostName.trim()] : []);

  if (!playerNames.length) {
    throw new Error('At least one player name is required');
  }

  const modeConfig = GAME_MODES[options.gameMode] as unknown as GameMode;
  const selectedDifficulty = modeConfig.supportedDifficulties.includes(options.difficulty || 'easy')
    ? (options.difficulty || 'easy')
    : modeConfig.supportedDifficulties[0];
  const difficultyConfig = getDifficultyConfig(modeConfig.players, selectedDifficulty);
  const maxBid = modeConfig.totalPoints;

  let deck = createDeck(modeConfig.decks);
  if (modeConfig.removeCards) {
    deck = removeCardsFromDeck(deck, [...modeConfig.removeCards]);
  }

  const gameSettings: GameSettings = {
    mode: modeConfig,
    difficulty: selectedDifficulty,
    difficultyConfig: {
      ...difficultyConfig,
      bidding: {
        ...difficultyConfig.bidding,
        maxBid
      }
    },
    biddingConfig: {
      ...difficultyConfig.bidding,
      maxBid
    },
    powerhouseSuit: null,
    partnership: null,
    allowSecretPartners: options.settings?.allowSecretPartners ?? true,
    enableRedeal: options.settings?.enableRedeal ?? false,
    gameSpeed: options.settings?.gameSpeed ?? 'normal'
  };

  const players = buildPlayers(playerNames);
  const status = options.status ?? (players.length === modeConfig.players ? 'setup' : 'waiting');

  const gameState: GameState = {
    id: generateGameId(),
    status,
    players,
    currentPlayer: players[0].id,
    deck: status === 'waiting' ? [] : deck,
    discardPile: [],
    settings: gameSettings,
    bidding: {
      bids: [],
      currentBid: gameSettings.biddingConfig.startBid - Math.min(...gameSettings.biddingConfig.increments),
      winner: null,
      isActive: false
    },
    currentTrick: null,
    completedTricks: [],
    rounds: [],
    currentRound: 0,
    scores: {
      bidWinnerTeam: 0,
      opposingTeam: 0,
      breakdown: {}
    },
    winner: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  return {
    gameState,
    currentPlayerId: players[0].id
  };
}
