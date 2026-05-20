import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GameState, Card, GameSettings, GAME_MODES, Difficulty, Player } from '@/types/game';
import { determineRoundWinner, calculateRoundPoints, calculateFinalScores } from '@/utils/gameUtils';

const LAST_GAME_STORAGE_KEY = 'kadi-tiri-last-game';
const getPlayerSessionKey = (gameId: string) => `kadi-tiri-player-${gameId}`;

const createGameOnServer = async (requestBody: {
  hostName?: string;
  playerNames?: string[];
  gameMode: keyof typeof GAME_MODES;
  difficulty?: Difficulty;
  settings?: Partial<GameSettings>;
  autostart?: boolean;
}): Promise<{ gameState: GameState; currentPlayerId: string }> => {
  const response = await fetch('/api/game/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const responseBody = await response.json();
  if (!response.ok || !responseBody.success) {
    throw new Error(responseBody.error || 'Failed to create game');
  }

  return {
    gameState: responseBody.data as GameState,
    currentPlayerId: responseBody.currentPlayerId as string
  };
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
  const response = await fetch(`/api/game/state?gameId=${encodeURIComponent(gameId)}&t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  const payload = await response.json();

  if (response.status === 404) {
    return null;
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Failed to load game');
  }

  return payload.data as GameState;
};
import type { GameActionRequest } from '@/pages/api/game/action';

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

  return data.data as GameState;
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
  loadGameSession: (gameId: string) => Promise<boolean>;
  syncGameFromStorage: (gameId: string) => Promise<void>;
  applyServerGameState: (gameState: GameState) => void;
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
          const { gameState: createdState, currentPlayerId } = await createGameOnServer({
            playerNames,
            gameMode: gameMode as keyof typeof GAME_MODES,
            difficulty,
            settings,
            autostart: true
          });

          set({
            gameState: createdState,
            currentPlayerId,
            isLoading: false
          });
          savePlayerSession(createdState.id, currentPlayerId);
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
          const { gameState: createdState, currentPlayerId } = await createGameOnServer({
            hostName,
            gameMode: gameMode as keyof typeof GAME_MODES,
            difficulty,
            settings
          });

          set({
            gameState: createdState,
            currentPlayerId,
            isLoading: false
          });
          savePlayerSession(createdState.id, currentPlayerId);
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

          set({
            gameState: loadedGame,
            currentPlayerId: existingPlayerSession,
            error: null,
            isLoading: false
          });
          return true;
        } catch (error) {
          console.error('Failed to load game session from server:', error);
          return false;
        }
      },

      syncGameFromStorage: async (gameId) => {
        try {
          const loadedGame = await fetchGameStateFromServer(gameId);
          if (!loadedGame) {
            return;
          }

          const currentState = get().gameState;
          const currentPlayerId = loadPlayerSession(gameId) || get().currentPlayerId || loadedGame.players[0]?.id || null;

          if (!currentState || loadedGame.updatedAt > currentState.updatedAt) {
            set({
              gameState: loadedGame,
              currentPlayerId
            });
          }
        } catch (error) {
          console.error('Failed to sync game from server:', error);
        }
      },

      applyServerGameState: (gameState) => {
        const currentState = get().gameState;
        if (currentState && gameState.updatedAt < currentState.updatedAt) {
          return;
        }

        const currentPlayerId =
          loadPlayerSession(gameState.id) ||
          get().currentPlayerId ||
          gameState.players[0]?.id ||
          null;

        set({
          gameState,
          currentPlayerId
        });
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
