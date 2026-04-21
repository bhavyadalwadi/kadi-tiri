import { GameState } from '@/types/game';
import { createDeck, removeCardsFromDeck, dealCards, sortCards } from './gameUtils';

/**
 * Complete dealing process that transitions game state from setup through dealing to bidding
 */
export function dealCardsAndTransitionState(gameState: GameState): GameState {
  // First, transition to dealing state
  const dealingState: GameState = {
    ...gameState,
    status: 'dealing',
    updatedAt: Date.now()
  };

  // Create deck based on game mode
  const fullDeck = createDeck(gameState.settings.mode.decks);
  
  // Remove cards if specified by game mode
  let deck = fullDeck;
  if (gameState.settings.mode.removeCards) {
    deck = removeCardsFromDeck(fullDeck, [...gameState.settings.mode.removeCards]);
  }

  // Deal cards to all players
  const { players: playersWithCards, remainingDeck } = dealCards(
    deck,
    gameState.players,
    gameState.settings.mode.cardsPerPlayer
  );

  // Sort cards in each player's hand
  const playersWithSortedCards = playersWithCards.map(player => ({
    ...player,
    cards: sortCards(player.cards)
  }));

  // Find the dealer (or set first player as dealer if none set)
  let dealerIndex = gameState.players.findIndex(p => p.isDealer);
  if (dealerIndex === -1) {
    dealerIndex = 0;
    playersWithSortedCards[0].isDealer = true;
  }

  // Set the first bidder (player to the left of dealer)
  const firstBidderIndex = (dealerIndex + 1) % playersWithSortedCards.length;
  const currentPlayer = playersWithSortedCards[firstBidderIndex].id;

  // Transition to bidding state
  const finalState: GameState = {
    ...dealingState,
    status: 'bidding',
    players: playersWithSortedCards,
    deck: remainingDeck,
    currentPlayer,
    bidding: {
      bids: [],
      currentBid: gameState.settings.biddingConfig.startBid - Math.min(...gameState.settings.biddingConfig.increments),
      winner: null,
      isActive: true
    },
    updatedAt: Date.now()
  };

  return finalState;
}

/**
 * Check if the game is ready to start dealing (all required players have joined)
 */
export function isReadyToDeal(gameState: GameState): boolean {
  return (gameState.status === 'setup' || gameState.status === 'waiting') && 
         gameState.players.length === gameState.settings.mode.players &&
         gameState.players.every(player => player.name.trim() !== '');
}
