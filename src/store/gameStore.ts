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

const saveGameStateToServer = async (gameState: GameState): Promise<GameState> => {
  const response = await fetch('/api/game/state', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ gameState })
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Failed to save game');
  }

  return payload.data as GameState;
};

const persistGameState = async (gameState: GameState): Promise<GameState> => {
  saveGameToStorage(gameState);
  return saveGameStateToServer(gameState);
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

        if (isReadyToDeal(gameState)) {
          const dealtGameState = dealCardsAndTransitionState(gameState);
          set({ gameState: dealtGameState });
          await persistGameState(dealtGameState);
          
          // Auto-transition to bidding after showing cards for 1 second
          setTimeout(() => {
            const currentState = get().gameState;
            if (currentState && currentState.status === 'dealing') {
              const biddingState = transitionToBidding(currentState);
              set({ gameState: biddingState });
              void persistGameState(biddingState);
            }
          }, 1000);
        } else {
          // Fallback to original logic if conditions aren't met
          const { players: dealtPlayers, remainingDeck } = dealCards(
            gameState.deck,
            gameState.players,
            gameState.settings.mode.cardsPerPlayer
          );

          set({
            gameState: {
              ...gameState,
              status: 'bidding',
              players: dealtPlayers,
              deck: remainingDeck,
              bidding: {
                ...gameState.bidding,
                isActive: true
              },
              updatedAt: Date.now()
            }
          });

          // Save updated game state to storage
          const updatedState = get().gameState;
          if (updatedState) {
            await persistGameState(updatedState);
          }
        }
      },

      // Place a bid
      placeBid: async (playerId, amount) => {
        const { gameState } = get();
        if (!gameState || gameState.status !== 'bidding') return;

        const player = gameState.players.find(p => p.id === playerId);
        if (!player) return;

        if (playerId !== gameState.currentPlayer) {
          set({ error: 'Not your turn to bid' });
          return;
        }

        if (!isValidBid(amount, gameState.bidding.currentBid, gameState.settings.mode, gameState.settings.biddingConfig.increments)) {
          set({ error: 'Invalid bid amount' });
          return;
        }

        const newBid: Bid = {
          playerId,
          amount,
          timestamp: Date.now(),
          passed: false
        };

        const updatedBids = [...gameState.bidding.bids, newBid];
        
        // Create updated game state
        const updatedGameState = {
          ...gameState,
          bidding: {
            ...gameState.bidding,
            bids: updatedBids,
            currentBid: amount,
            winner: playerId
          },
          updatedAt: Date.now()
        };

        // Check if bidding round is complete
        const biddingStatus = checkBiddingRoundComplete(updatedGameState);
        
        if (biddingStatus.isComplete) {
          if (biddingStatus.canAdvance && biddingStatus.winner) {
            // Bidding is complete, move to partner selection
            const finalState = {
              ...updatedGameState,
              status: 'partner-selection' as const,
              bidding: {
                ...updatedGameState.bidding,
                winner: biddingStatus.winner,
                isActive: false
              }
            };
            set({ gameState: finalState });
            await persistGameState(finalState);
          } else {
            // All players passed, restart bidding with lower starting bid
            const minimumIncrement = Math.min(...gameState.settings.biddingConfig.increments);
            const newStartBid = Math.max(
              gameState.settings.biddingConfig.startBid - minimumIncrement,
              Math.floor(gameState.settings.biddingConfig.startBid * 0.8)
            );
            
            const restartState = {
              ...gameState,
              bidding: {
                bids: [],
                currentBid: newStartBid,
                winner: null,
                isActive: true
              },
              currentPlayer: gameState.players.find(p => p.isDealer)?.id || gameState.players[0].id,
              updatedAt: Date.now()
            };
            
            set({
              gameState: restartState,
              error: 'All players passed. Starting new bidding round with lower starting bid.'
            });
            await persistGameState(restartState);
          }
        } else {
          // Continue bidding with next player
          const nextPlayer = getNextBidder(updatedGameState);
          const continueState = {
            ...updatedGameState,
            currentPlayer: nextPlayer || gameState.currentPlayer
          };
          set({ gameState: continueState });
          await persistGameState(continueState);
        }
      },

      // Pass on bidding
      passBid: async (playerId) => {
        const { gameState } = get();
        if (!gameState || gameState.status !== 'bidding') return;

        const player = gameState.players.find(p => p.id === playerId);
        if (!player) return;

        if (playerId !== gameState.currentPlayer) {
          set({ error: 'Not your turn to pass' });
          return;
        }

        const passBid: Bid = {
          playerId,
          amount: 0,
          timestamp: Date.now(),
          passed: true
        };

        const updatedBids = [...gameState.bidding.bids, passBid];
        
        // Create updated game state
        const updatedGameState = {
          ...gameState,
          bidding: {
            ...gameState.bidding,
            bids: updatedBids
          },
          updatedAt: Date.now()
        };

        // Check if bidding round is complete
        const biddingStatus = checkBiddingRoundComplete(updatedGameState);
        
        if (biddingStatus.isComplete) {
          if (biddingStatus.canAdvance && biddingStatus.winner) {
            // Bidding is complete, move to partner selection
            const finalState = {
              ...updatedGameState,
              status: 'partner-selection' as const,
              bidding: {
                ...updatedGameState.bidding,
                winner: biddingStatus.winner,
                isActive: false
              }
            };
            set({ gameState: finalState });
            await persistGameState(finalState);
          } else {
            // All players passed, restart bidding
            const minimumIncrement = Math.min(...gameState.settings.biddingConfig.increments);
            const newStartBid = Math.max(
              gameState.settings.biddingConfig.startBid - minimumIncrement,
              Math.floor(gameState.settings.biddingConfig.startBid * 0.8)
            );
            
            const restartState = {
              ...gameState,
              bidding: {
                bids: [],
                currentBid: newStartBid,
                winner: null,
                isActive: true
              },
              currentPlayer: gameState.players.find(p => p.isDealer)?.id || gameState.players[0].id,
              updatedAt: Date.now()
            };
            
            set({
              gameState: restartState,
              error: 'All players passed. Starting new bidding round with lower starting bid.'
            });
            await persistGameState(restartState);
          }
        } else {
          // Continue bidding with next player
          const nextPlayer = getNextBidder(updatedGameState);
          const continueState = {
            ...updatedGameState,
            currentPlayer: nextPlayer || gameState.currentPlayer
          };
          set({ gameState: continueState });
          await persistGameState(continueState);
        }
      },

      // Select powerhouse suit
      selectPowerhouse: async (suit) => {
        const { gameState } = get();
        if (!gameState || gameState.status !== 'partner-selection') return;


        const newGameState: GameState = {
          ...gameState,
          settings: {
            ...gameState.settings,
            powerhouseSuit: suit as any
          },
          updatedAt: Date.now()
        };


        set({ gameState: newGameState });
        await persistGameState(newGameState);
      },

      // Select partners
      selectPartners: async (cards) => {
        const { gameState } = get();
        if (!gameState || gameState.status !== 'partner-selection') return;


        // Find which players have the selected partner cards in their hands
        const partnerPlayerIds: string[] = [];
        
        cards.forEach(partnerCard => {
          gameState.players.forEach(player => {
            // Skip the bid winner (they can't be their own partner)
            if (player.id === gameState.bidding.winner) return;
            
            // Check if this player has the partner card
            const hasPartnerCard = player.cards.some(card => 
              card.rank === partnerCard.rank && card.suit === partnerCard.suit
            );
            
            if (hasPartnerCard && !partnerPlayerIds.includes(player.id)) {
              partnerPlayerIds.push(player.id);
            }
          });
        });


        const partnership = {
          bidWinner: gameState.bidding.winner!,
          partners: partnerPlayerIds, // Now contains actual partner player IDs
          partnerCards: cards,
          revealed: false
        };

        const newGameState: GameState = {
          ...gameState,
          settings: {
            ...gameState.settings,
            partnership
          },
          updatedAt: Date.now()
        };


        set({ gameState: newGameState });
        await persistGameState(newGameState);
      },

      // Play a card
      playCard: async (playerId, card) => {
        const { gameState } = get();
        if (!gameState || gameState.status !== 'playing') {
          set({ error: 'Cannot play card - game not in playing state' });
          return;
        }

        if (gameState.currentPlayer !== playerId) {
          set({ error: 'Not your turn to play' });
          return;
        }

        // Check lead suit following rule
        const player = gameState.players.find(p => p.id === playerId);
        if (!player) {
          set({ error: 'Player not found' });
          return;
        }

        // If there's a current trick with a lead suit, check if player must follow suit
        if (gameState.currentTrick && gameState.currentTrick.leadSuit && gameState.currentTrick.cards.length > 0) {
          const leadSuit = gameState.currentTrick.leadSuit;
          const hasLeadSuit = player.cards.some(c => c.suit === leadSuit);
          
          if (hasLeadSuit && card.suit !== leadSuit) {
            set({ error: `You must play a ${leadSuit} card if you have one!` });
            return;
          }
        }


        // Remove card from player's hand
        const updatedPlayers = gameState.players.map(player => {
          if (player.id === playerId) {
            return {
              ...player,
              cards: player.cards.filter(c => c.id !== card.id)
            };
          }
          return player;
        });

        // Add card to current trick
        let currentTrick = gameState.currentTrick;
        if (!currentTrick) {
          // Start new trick
          currentTrick = {
            id: `trick-${Date.now()}`,
            cards: [],
            leadSuit: card.suit,
            winner: null,
            points: 0,
            completed: false
          };
        }

        const playedCard = {
          playerId,
          playerName: gameState.players.find(p => p.id === playerId)?.name || 'Unknown',
          card,
          playOrder: currentTrick.cards.length
        };

        currentTrick.cards.push(playedCard);

        // If this is the first card, set lead suit
        if (currentTrick.cards.length === 1) {
          currentTrick.leadSuit = card.suit;
        }

        // Check if trick is complete (all players played)
        const trickComplete = currentTrick.cards.length === gameState.players.length;
        let nextPlayer = playerId;
        let updatedCompletedTricks = gameState.completedTricks;

        if (trickComplete) {
          
          const powerhouseSuit = gameState.settings.powerhouseSuit;
          
          if (powerhouseSuit && currentTrick.leadSuit) {
            const winnerId = determineTrickWinner(currentTrick.cards, currentTrick.leadSuit, powerhouseSuit);
            
            if (winnerId) {
              currentTrick.winner = winnerId;
              currentTrick.completed = true;
              
              // Calculate trick points
              currentTrick.points = currentTrick.cards.reduce((sum, playedCard) => sum + playedCard.card.points, 0);
              
              
              // Winner leads next trick
              nextPlayer = winnerId;
              
              // Move trick to completed tricks
              updatedCompletedTricks = [...gameState.completedTricks, currentTrick];
              currentTrick = null; // Clear current trick for next one
            } else {
            }
          } else {
          }
        } else {
          // Next player's turn
          const currentPlayerIndex = gameState.players.findIndex(p => p.id === playerId);
          const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
          nextPlayer = gameState.players[nextPlayerIndex].id;
        }

        // Calculate updated team scores from completed tricks
        let updatedBidWinnerTeamScore = gameState.scores.bidWinnerTeam;
        let updatedOpposingTeamScore = gameState.scores.opposingTeam;

        // Check if all hands are empty (round complete)
        const allCardsPlayed = updatedPlayers.every(player => player.cards.length === 0);
        
        // Add points from the latest completed trick if there was one
        if (updatedCompletedTricks.length > gameState.completedTricks.length) {
          const latestTrick = updatedCompletedTricks[updatedCompletedTricks.length - 1];
          if (latestTrick.winner && latestTrick.points > 0) {
            // Track individual player contribution
            const currentBreakdown = { ...gameState.scores.breakdown };
            if (!currentBreakdown[latestTrick.winner]) {
              currentBreakdown[latestTrick.winner] = 0;
            }
            currentBreakdown[latestTrick.winner] += latestTrick.points;
            
            if (gameState.settings.partnership) {
              const teamMembers = [
                gameState.settings.partnership.bidWinner,
                ...gameState.settings.partnership.partners
              ];
              
              if (teamMembers.includes(latestTrick.winner)) {
                updatedBidWinnerTeamScore += latestTrick.points;
              } else {
                updatedOpposingTeamScore += latestTrick.points;
              }
            }
            
            // Update the gameState with individual contributions
            set({
              gameState: {
                ...gameState,
                players: updatedPlayers,
                currentTrick,
                completedTricks: updatedCompletedTricks,
                currentPlayer: nextPlayer,
                scores: {
                  bidWinnerTeam: updatedBidWinnerTeamScore,
                  opposingTeam: updatedOpposingTeamScore,
                  breakdown: currentBreakdown
                },
                updatedAt: Date.now()
              }
            });
            await persistGameState(get().gameState!);
            return; // Exit early since we updated the state
          }
        }

        if (allCardsPlayed) {
          const tempGameState = {
            ...gameState,
            players: updatedPlayers,
            completedTricks: updatedCompletedTricks
          };

          const finalScores = calculateFinalScores(tempGameState);

          set({
            gameState: {
              ...tempGameState,
              status: 'finished',
              winner: finalScores.winner,
              scores: {
                bidWinnerTeam: finalScores.bidWinnerTeamScore,
                opposingTeam: finalScores.opposingTeamScore,
                breakdown: finalScores.individualScores
              },
              updatedAt: Date.now()
            }
          });
          await persistGameState(get().gameState!);

          return;
        }

        // Update game state (when no new tricks completed)
        set({
          gameState: {
            ...gameState,
            players: updatedPlayers,
            currentPlayer: nextPlayer,
            currentTrick,
            completedTricks: updatedCompletedTricks,
            scores: {
              ...gameState.scores,
              bidWinnerTeam: updatedBidWinnerTeamScore,
              opposingTeam: updatedOpposingTeamScore
            },
            updatedAt: Date.now()
          }
        });
        await persistGameState(get().gameState!);
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

        set({
          gameState: {
            ...gameState,
            rounds,
            currentRound: gameState.currentRound + 1,
            currentPlayer: winner, // Winner leads next round
            scores: {
              ...gameState.scores,
              bidWinnerTeam: bidWinnerTeamScore,
              opposingTeam: opposingTeamScore
            },
            updatedAt: Date.now()
          }
        });
        await persistGameState(get().gameState!);
      },

      // End the game
      endGame: async () => {
        const { gameState } = get();
        if (!gameState) return;

        const finalScores = calculateFinalScores(gameState);

        set({
          gameState: {
            ...gameState,
            status: 'finished',
            winner: finalScores.winner,
            scores: {
              ...gameState.scores,
              breakdown: finalScores.individualScores
            },
            updatedAt: Date.now()
          }
        });
        await persistGameState(get().gameState!);
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
        if (!gameState || gameState.status !== 'partner-selection') {
          set({ error: 'Cannot start playing - complete partner selection first' });
          return;
        }

        if (!gameState.settings.powerhouseSuit || !gameState.settings.partnership) {
          set({ error: 'Cannot start playing - powerhouse suit and partners not selected' });
          return;
        }

        
        // Bid winner leads the first trick in V2.
        const bidWinnerId = gameState.bidding.winner;

        const newGameState: GameState = {
          ...gameState,
          status: 'playing',
          currentPlayer: bidWinnerId || gameState.currentPlayer,
          currentTrick: null,
          completedTricks: [],
          updatedAt: Date.now()
        };

        set({ gameState: newGameState });
        await persistGameState(newGameState);
      },

      // Helper to save current game state to storage
      saveCurrentGame: async () => {
        const currentState = get().gameState;
        if (currentState) {
          await persistGameState(currentState);
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
