import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GameState, Player, Card, GameSettings, Bid, GameAction, GAME_MODES, GameMode, Difficulty, getDifficultyConfig } from '@/types/game';
import { 
  createDeck, 
  dealCards, 
  generateGameId, 
  generatePlayerId,
  removeCardsFromDeck,
  canPlayCard,
  determineRoundWinner,
  calculateRoundPoints,
  isValidBid,
  calculateFinalScores,
  dealCardsAndTransitionState,
  transitionToBidding,
  isReadyToDeal,
  sortCards,
  checkBiddingRoundComplete,
  getNextBidder,
  determineTrickWinner
} from '@/utils/gameUtils';

// Helper functions for shared game state storage
const GAMES_STORAGE_KEY = 'kadi-tiri-games';
const LAST_GAME_STORAGE_KEY = 'kadi-tiri-last-game';
const getPlayerSessionKey = (gameId: string) => `kadi-tiri-player-${gameId}`;

// Local cache for quick resume in the active browser.
const saveGameToStorage = (gameState: GameState) => {
  try {
    const existingGames = JSON.parse(localStorage.getItem(GAMES_STORAGE_KEY) || '{}');
    existingGames[gameState.id] = gameState;
    localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(existingGames));
    
    // Also save to sessionStorage as fallback
    sessionStorage.setItem(`game-${gameState.id}`, JSON.stringify(gameState));
  } catch (error) {
    console.error('Failed to save game to storage:', error);
  }
};

const createGameOnServer = async (gameState: GameState): Promise<GameState> => {
  const response = await fetch('/api/game/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ gameState })
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Failed to create game');
  }

  return payload.data as GameState;
};

const joinGameOnServer = async (gameId: string, playerName: string): Promise<{ gameState: GameState; currentPlayerId: string }> => {
  const response = await fetch('/api/game/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ gameId, playerName })
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Failed to join game');
  }

  return {
    gameState: payload.data as GameState,
    currentPlayerId: payload.currentPlayerId as string
  };
};

const fetchGameStateFromServer = async (gameId: string): Promise<GameState | null> => {
  const response = await fetch(`/api/game/state?gameId=${encodeURIComponent(gameId)}`);
  const payload = await response.json();

  if (response.status === 404) {
    return null;
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Failed to load game');
  }

  return payload.data as GameState;
};

import type { GameActionType, GameActionRequest } from '@/pages/api/game/action';

/**
 * Send a lightweight action to the server.  The server validates the action
 * against the authoritative state and returns the resulting state.
 * Only action-specific fields are sent – the full state is never uploaded.
 */
const executeAction = async (
  payload: Omit<GameActionRequest, never>
): Promise<GameState> => {
  const response = await fetch('/api/game/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Action failed');
  }

  const state = data.data as GameState;
  saveGameToStorage(state);
  return state;
};

const savePlayerSession = (gameId: string, playerId: string) => {
  try {
    sessionStorage.setItem(getPlayerSessionKey(gameId), playerId);
    localStorage.setItem(LAST_GAME_STORAGE_KEY, gameId);
  } catch (error) {
    console.error('Failed to save player session:', error);
  }
};

const loadPlayerSession = (gameId: string): string | null => {
  try {
    return sessionStorage.getItem(getPlayerSessionKey(gameId));
  } catch (error) {
    console.error('Failed to load player session:', error);
    return null;
  }
};

const loadGameFromStorage = (gameId: string): GameState | null => {
  try {
    // First try localStorage
    const existingGames = JSON.parse(localStorage.getItem(GAMES_STORAGE_KEY) || '{}');
    
    let game = existingGames[gameId];
    
    // If not found in localStorage, try sessionStorage
    if (!game) {
      const sessionGame = sessionStorage.getItem(`game-${gameId}`);
      if (sessionGame) {
        game = JSON.parse(sessionGame);
      }
    }
    
    return game || null;
  } catch (error) {
    console.error('Failed to load game from storage:', error);
    return null;
  }
};

const getAllGamesFromStorage = (): Record<string, GameState> => {
  try {
    return JSON.parse(localStorage.getItem(GAMES_STORAGE_KEY) || '{}');
  } catch (error) {
    console.error('Failed to load games from storage:', error);
    return {};
  }
};

const removeGameFromStorage = (gameId: string) => {
  try {
    const existingGames = JSON.parse(localStorage.getItem(GAMES_STORAGE_KEY) || '{}');
    delete existingGames[gameId];
    localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(existingGames));
  } catch (error) {
    console.error('Failed to remove game from storage:', error);
  }
};

interface GameStore {
  // State
  gameState: GameState | null;
  currentPlayerId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createGame: (playerNames: string[], gameMode: string, difficulty?: Difficulty, settings?: Partial<GameSettings>) => Promise<void>;
  createWaitingRoom: (hostName: string, gameMode: string, difficulty?: Difficulty, settings?: Partial<GameSettings>) => Promise<void>;
  joinGame: (gameId: string, playerName: string) => Promise<void>;
  startBidding: () => Promise<void>;
  placeBid: (playerId: string, amount: number) => Promise<void>;
  passBid: (playerId: string) => Promise<void>;
  selectPowerhouse: (suit: string) => Promise<void>;
  selectPartners: (cards: Card[]) => Promise<void>;
  startPlaying: () => Promise<void>;
  playCard: (playerId: string, card: Card) => Promise<void>;
  endRound: () => Promise<void>;
  endGame: () => Promise<void>;
  resetGame: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  // Helper to save game state to storage
  saveCurrentGame: () => Promise<void>;
  loadGameSession: (gameId: string) => Promise<boolean>;
  syncGameFromStorage: (gameId: string) => Promise<void>;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      gameState: null,
      currentPlayerId: null,
      isLoading: false,
      error: null,

      // Create a new game
      createGame: async (playerNames, gameMode, difficulty = 'easy', settings) => {
        try {
          set({ isLoading: true, error: null });
          
          const gameId = generateGameId();
          const players: Player[] = playerNames.map((name, index) => ({
            id: generatePlayerId(),
            name,
            cards: [],
            score: 0,
            position: index,
            isDealer: index === 0,
            isActive: index === 0
          }));

          // Get game mode configuration from GAME_MODES
          const modeConfig = (settings?.mode || GAME_MODES[gameMode as keyof typeof GAME_MODES]) as unknown as GameMode;
          const selectedDifficulty = modeConfig.supportedDifficulties.includes(difficulty) ? difficulty : modeConfig.supportedDifficulties[0];
          const difficultyConfig = getDifficultyConfig(modeConfig.players, selectedDifficulty);
          const maxBid = modeConfig.totalPoints;

          // Create and prepare deck
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
            allowSecretPartners: settings?.allowSecretPartners ?? true,
            enableRedeal: settings?.enableRedeal ?? false,
            gameSpeed: settings?.gameSpeed ?? 'normal'
          };

          const newGameState: GameState = {
            id: gameId,
            status: 'setup',
            players,
            currentPlayer: players[0].id,
            deck,
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

          set({ 
            gameState: newGameState, 
            currentPlayerId: players[0].id,
            isLoading: false 
          });
          savePlayerSession(gameId, players[0].id);

          // Save game to shared storage
          await createGameOnServer(newGameState);
          saveGameToStorage(newGameState);

          // Auto-start dealing if all players are ready
          setTimeout(() => {
            const currentState = get().gameState;
            if (currentState && currentState.status === 'setup' && 
                currentState.players.length === currentState.settings.mode.players) {
              get().startBidding();
            }
          }, 1000); // Short delay to ensure UI is updated

        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create game',
            isLoading: false 
          });
        }
      },

      // Create a waiting room where players can join before the game starts
      createWaitingRoom: async (hostName, gameMode, difficulty = 'easy', settings) => {
        try {
          set({ isLoading: true, error: null });
          
          const gameId = generateGameId();
          const hostPlayer: Player = {
            id: generatePlayerId(),
            name: hostName,
            cards: [],
            score: 0,
            position: 0,
            isDealer: true,
            isActive: true
          };

          // Get game mode configuration
          const modeConfig = (settings?.mode || GAME_MODES[gameMode as keyof typeof GAME_MODES]) as unknown as GameMode;
          const selectedDifficulty = modeConfig.supportedDifficulties.includes(difficulty) ? difficulty : modeConfig.supportedDifficulties[0];
          const difficultyConfig = getDifficultyConfig(modeConfig.players, selectedDifficulty);
          const maxBid = modeConfig.totalPoints;

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
            allowSecretPartners: settings?.allowSecretPartners ?? true,
            enableRedeal: settings?.enableRedeal ?? false,
            gameSpeed: settings?.gameSpeed ?? 'normal'
          };

          const newGameState: GameState = {
            id: gameId,
            status: 'waiting', // New status for waiting room
            players: [hostPlayer], // Start with just the host
            currentPlayer: hostPlayer.id,
            deck: [],
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

          set({ 
            gameState: newGameState, 
            currentPlayerId: hostPlayer.id,
            isLoading: false 
          });
          savePlayerSession(gameId, hostPlayer.id);

          // Save game to shared storage
          await createGameOnServer(newGameState);
          saveGameToStorage(newGameState);

        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create waiting room',
            isLoading: false 
          });
        }
      },

      // Join an existing game
      joinGame: async (gameId, playerName) => {
        try {
          set({ isLoading: true, error: null });

          const { gameState: joinedState, currentPlayerId } = await joinGameOnServer(gameId, playerName);

          set({
            gameState: joinedState,
            currentPlayerId
          });
          savePlayerSession(gameId, currentPlayerId);
          saveGameToStorage(joinedState);

          if (joinedState.players.length === joinedState.settings.mode.players) {
            setTimeout(() => {
              const currentState = get().gameState;
              if (currentState && currentState.status === 'waiting') {
                get().startBidding();
              }
            }, 500);
          }

          set({ isLoading: false });
          
        } catch (error) {
          console.error('Error in joinGame:', error);
          set({ 
            error: 'Failed to join game.',
            isLoading: false 
          });
        }
      },

      // Start the bidding phase
      startBidding: async () => {
        const { gameState } = get();
        if (!gameState) return;

        try {
          const newState = await executeAction({ gameId: gameState.id, type: 'startBidding' });
          set({ gameState: newState });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to start bidding' });
        }
      },

      // Place a bid
      placeBid: async (playerId, amount) => {
        const { gameState } = get();
        if (!gameState) return;

        try {
          const newState = await executeAction({ gameId: gameState.id, type: 'placeBid', playerId, amount });
          set({ gameState: newState });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to place bid' });
        }
      },

      // Pass on bidding
      passBid: async (playerId) => {
        const { gameState } = get();
        if (!gameState) return;

        try {
          const newState = await executeAction({ gameId: gameState.id, type: 'passBid', playerId });
          set({ gameState: newState });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to pass bid' });
        }
      },

      // Select powerhouse suit
      selectPowerhouse: async (suit) => {
        const { gameState } = get();
        if (!gameState || gameState.status !== 'partner-selection') return;


        try {
          const newState = await executeAction({ gameId: gameState.id, type: 'selectPowerhouse', suit });
          set({ gameState: newState });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to select powerhouse' });
        }
      },

      // Select partners
      selectPartners: async (cards) => {
        const { gameState } = get();
        if (!gameState) return;

        try {
          const newState = await executeAction({ gameId: gameState.id, type: 'selectPartners', cards });
          set({ gameState: newState });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to select partners' });
        }
      },

      // Play a card
      playCard: async (playerId, card) => {
        const { gameState } = get();
        if (!gameState) return;

        // Optimistic local validation for immediate error feedback.
        if (gameState.currentPlayer !== playerId) {
          set({ error: 'Not your turn to play' });
          return;
        }
        if (
          gameState.currentTrick &&
          gameState.currentTrick.leadSuit &&
          gameState.currentTrick.cards.length > 0
        ) {
          const player = gameState.players.find(p => p.id === playerId);
          const leadSuit = gameState.currentTrick.leadSuit;
          if (player?.cards.some(c => c.suit === leadSuit) && card.suit !== leadSuit) {
            set({ error: `You must play a ${leadSuit} card if you have one!` });
            return;
          }
        }

        try {
          const newState = await executeAction({ gameId: gameState.id, type: 'playCard', playerId, card });
          set({ gameState: newState });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to play card' });
        }
      },

      // End current round
      endRound: async () => {
        const { gameState } = get();
        if (!gameState) return;

        const currentRound = gameState.rounds[gameState.currentRound];
        if (!currentRound || currentRound.cardsPlayed.length < gameState.players.length) return;

        // Determine round winner
        const leadSuit = currentRound.cardsPlayed[0].card.suit;
        const winner = determineRoundWinner(
          currentRound.cardsPlayed,
          leadSuit,
          gameState.settings.powerhouseSuit
        );

        // Calculate round points
        const roundPoints = calculateRoundPoints(currentRound.cardsPlayed.map(cp => cp.card));

        // Update round with winner and points
        const rounds = [...gameState.rounds];
        rounds[gameState.currentRound] = {
          ...currentRound,
          winner,
          points: roundPoints
        };

        // Update scores based on partnership
        let bidWinnerTeamScore = gameState.scores.bidWinnerTeam;
        let opposingTeamScore = gameState.scores.opposingTeam;

        if (gameState.settings.partnership) {
          const teamMembers = [
            gameState.settings.partnership.bidWinner,
            ...gameState.settings.partnership.partners
          ];
          
          if (teamMembers.includes(winner)) {
            bidWinnerTeamScore += roundPoints;
          } else {
            opposingTeamScore += roundPoints;
          }
        }

        const endRoundState: GameState = {
          ...gameState,
          rounds,
          currentRound: gameState.currentRound + 1,
          currentPlayer: winner,
          scores: {
            ...gameState.scores,
            bidWinnerTeam: bidWinnerTeamScore,
            opposingTeam: opposingTeamScore
          },
          updatedAt: Date.now()
        };
        set({ gameState: endRoundState });
        saveGameToStorage(endRoundState);
      },

      // End the game
      endGame: async () => {
        const { gameState } = get();
        if (!gameState) return;

        const finalScores = calculateFinalScores(gameState);

        const endGameState: GameState = {
          ...gameState,
          status: 'finished',
          winner: finalScores.winner,
          scores: {
            ...gameState.scores,
            breakdown: finalScores.individualScores
          },
          updatedAt: Date.now()
        };
        set({ gameState: endGameState });
        saveGameToStorage(endGameState);
      },

      // Reset game
      resetGame: () => {
        set({
          gameState: null,
          currentPlayerId: null,
          error: null,
          isLoading: false
        });
      },

      // Set error
      setError: (error) => {
        set({ error });
      },

      // Set loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Start playing phase
      startPlaying: async () => {
        const { gameState } = get();
        if (!gameState) return;

        try {
          const newState = await executeAction({ gameId: gameState.id, type: 'startPlaying' });
          set({ gameState: newState });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to start playing' });
        }
      },

      // Helper to save current game state to storage (no-op – state is now managed server-side)
      saveCurrentGame: async () => {
        // Actions are persisted atomically via the action endpoint; nothing to do here.
      },

      loadGameSession: async (gameId) => {
        const existingPlayerSession = loadPlayerSession(gameId);
        if (!existingPlayerSession) {
          return false;
        }

        try {
          const loadedGame = await fetchGameStateFromServer(gameId);
          if (!loadedGame) {
            return false;
          }

          saveGameToStorage(loadedGame);
          set({
            gameState: loadedGame,
            currentPlayerId: existingPlayerSession,
            error: null,
            isLoading: false
          });
          return true;
        } catch (error) {
          console.error('Failed to load game session from server:', error);
          const fallbackGame = loadGameFromStorage(gameId);
          if (!fallbackGame) {
            return false;
          }

          set({
            gameState: fallbackGame,
            currentPlayerId: existingPlayerSession,
            error: null,
            isLoading: false
          });
          return true;
        }
      },

      syncGameFromStorage: async (gameId) => {
        try {
          const loadedGame = await fetchGameStateFromServer(gameId);
          if (!loadedGame) {
            return;
          }

          saveGameToStorage(loadedGame);
          const currentState = get().gameState;
          const currentPlayerId = loadPlayerSession(gameId) || get().currentPlayerId || loadedGame.players[0]?.id || null;

          if (!currentState || currentState.updatedAt !== loadedGame.updatedAt) {
            set({
              gameState: loadedGame,
              currentPlayerId
            });
          }
        } catch (error) {
          console.error('Failed to sync game from server:', error);
          const loadedGame = loadGameFromStorage(gameId);
          if (!loadedGame) {
            return;
          }

          const currentState = get().gameState;
          const currentPlayerId = loadPlayerSession(gameId) || get().currentPlayerId || loadedGame.players[0]?.id || null;

          if (!currentState || currentState.updatedAt !== loadedGame.updatedAt) {
            set({
              gameState: loadedGame,
              currentPlayerId
            });
          }
        }
      }
    }),
    {
      name: 'kadi-tiri-game-store'
    }
  )
);

// Helper function to get next player
function getNextPlayer(players: Player[], currentPlayerId: string): Player | null {
  const currentIndex = players.findIndex(p => p.id === currentPlayerId);
  if (currentIndex === -1) return null;
  
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex];
}
