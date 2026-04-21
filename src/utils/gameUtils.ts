import { Card, Suit, Rank, Player, GameState, GameMode, CARD_POINTS } from '@/types/game';

/**
 * Creates a standard deck of cards
 */
export function createDeck(numberOfDecks: number = 1): Card[] {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const ranks: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
  const deck: Card[] = [];

  for (let deckIndex = 0; deckIndex < numberOfDecks; deckIndex++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        const card: Card = {
          id: `${rank}${suit}_${deckIndex}`,
          rank,
          suit,
          points: calculateCardPoints(rank, suit),
          isKaliTiri: rank === '3' && suit === '♠'
        };
        deck.push(card);
      }
    }
  }

  return deck;
}

/**
 * Calculate points for a card based on game rules
 */
export function calculateCardPoints(rank: Rank, suit: Suit): number {
  // KaliTiri (3♠) is worth 30 points
  if (rank === '3' && suit === '♠') {
    return CARD_POINTS.kaliTiri;
  }
  
  // High value cards (A, K, Q, J, 10) are worth 10 points
  if (['A', 'K', 'Q', 'J', '10'].includes(rank)) {
    return CARD_POINTS.highCards;
  }
  
  // All 5s are worth 5 points
  if (rank === '5') {
    return CARD_POINTS.fives;
  }
  
  // All other cards (including 7s) are worth 0 points
  return CARD_POINTS.others;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleDeck<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Remove specific cards from deck based on game mode
 */
export function removeCardsFromDeck(deck: Card[], cardsToRemove: string[]): Card[] {
  const removeList = [...cardsToRemove]; // Create a copy to avoid mutation
  return deck.filter(card => {
    const cardString = `${card.rank}${card.suit}`;
    // Remove one instance of each card in the remove list
    const removeIndex = removeList.indexOf(cardString);
    if (removeIndex !== -1) {
      removeList.splice(removeIndex, 1);
      return false;
    }
    return true;
  });
}

/**
 * Deal cards to players
 */
export function dealCards(deck: Card[], players: Player[], cardsPerPlayer: number): { players: Player[], remainingDeck: Card[] } {
  const shuffledDeck = shuffleDeck(deck);
  const dealtPlayers = players.map(player => ({ ...player, cards: [] }));
  let deckIndex = 0;

  // Deal cards round-robin style
  for (let cardRound = 0; cardRound < cardsPerPlayer; cardRound++) {
    for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
      if (deckIndex < shuffledDeck.length) {
        dealtPlayers[playerIndex].cards.push(shuffledDeck[deckIndex]);
        deckIndex++;
      }
    }
  }

  return {
    players: dealtPlayers,
    remainingDeck: shuffledDeck.slice(deckIndex)
  };
}

/**
 * Check if a card can be played given the current game state
 */
export function canPlayCard(
  card: Card,
  gameState: GameState,
  playerId: string,
  leadSuit?: Suit
): boolean {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player || !player.cards.some(c => c.id === card.id)) {
    return false;
  }

  // If no lead suit, any card can be played
  if (!leadSuit) {
    return true;
  }

  // Must follow suit if possible
  const hasLeadSuit = player.cards.some(c => c.suit === leadSuit);
  if (hasLeadSuit && card.suit !== leadSuit) {
    return false;
  }

  return true;
}

/**
 * Determine the winner of a round
 */
export function determineRoundWinner(
  cardsPlayed: { playerId: string; card: Card; order: number }[],
  leadSuit: Suit,
  powerhouseSuit: Suit | null
): string {
  if (cardsPlayed.length === 0) {
    throw new Error('No cards played');
  }

  // Sort by play order
  const sortedCards = [...cardsPlayed].sort((a, b) => a.order - b.order);
  
  // Check for powerhouse cards first
  const powerhouseCards = sortedCards.filter(cp => cp.card.suit === powerhouseSuit);
  if (powerhouseCards.length > 0) {
    // Highest powerhouse card wins, if tied, first played wins
    const highestPowerhouse = powerhouseCards.reduce((highest, current) => {
      const currentRankValue = getRankValue(current.card.rank);
      const highestRankValue = getRankValue(highest.card.rank);
      
      if (currentRankValue > highestRankValue) {
        return current;
      } else if (currentRankValue === highestRankValue) {
        // If identical cards, first played wins
        return current.order < highest.order ? current : highest;
      }
      return highest;
    });
    return highestPowerhouse.playerId;
  }

  // No powerhouse cards, highest card of lead suit wins
  const leadSuitCards = sortedCards.filter(cp => cp.card.suit === leadSuit);
  if (leadSuitCards.length === 0) {
    // This shouldn't happen in normal gameplay
    return sortedCards[0].playerId;
  }

  const highestLeadSuit = leadSuitCards.reduce((highest, current) => {
    const currentRankValue = getRankValue(current.card.rank);
    const highestRankValue = getRankValue(highest.card.rank);
    
    if (currentRankValue > highestRankValue) {
      return current;
    } else if (currentRankValue === highestRankValue) {
      // If identical cards, first played wins
      return current.order < highest.order ? current : highest;
    }
    return highest;
  });

  return highestLeadSuit.playerId;
}

/**
 * Get numerical value for card rank for comparison
 */
export function getRankValue(rank: Rank): number {
  const rankValues: Record<Rank, number> = {
    'A': 14,
    'K': 13,
    'Q': 12,
    'J': 11,
    '10': 10,
    '9': 9,
    '8': 8,
    '7': 7,
    '6': 6,
    '5': 5,
    '4': 4,
    '3': 3,
    '2': 2
  };
  return rankValues[rank];
}

/**
 * Calculate round points from played cards
 */
export function calculateRoundPoints(cards: Card[]): number {
  return cards.reduce((total, card) => total + card.points, 0);
}

/**
 * Check if a bid is valid
 */
export function isValidBid(
  bidAmount: number,
  currentHighBid: number,
  gameMode: GameMode,
  allowedIncrements: number[] = [5]
): boolean {
  if (bidAmount <= currentHighBid) {
    return false;
  }

  const raiseAmount = bidAmount - currentHighBid;
  if (!allowedIncrements.includes(raiseAmount)) {
    return false;
  }

  if (bidAmount > gameMode.totalPoints) {
    return false;
  }

  return true;
}

/**
 * Generate a unique game ID
 */
export function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique player ID
 */
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sort cards in hand for display
 */
export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    // Sort by suit first
    const suitOrder = ['♠', '♥', '♦', '♣'];
    const suitComparison = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    
    if (suitComparison !== 0) {
      return suitComparison;
    }
    
    // Then by rank value (highest first)
    return getRankValue(b.rank) - getRankValue(a.rank);
  });
}

/**
 * Get the next player in turn order
 */
export function getNextPlayer(players: Player[], currentPlayerId: string): Player | null {
  const currentIndex = players.findIndex(p => p.id === currentPlayerId);
  if (currentIndex === -1) {
    return null;
  }
  
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex];
}

/**
 * Check if game is finished
 */
export function isGameFinished(gameState: GameState): boolean {
  return gameState.currentRound >= gameState.settings.mode.rounds;
}

/**
 * Calculate final scores and determine winner
 */
export function calculateFinalScores(gameState: GameState): {
  bidWinnerTeamScore: number;
  opposingTeamScore: number;
  winner: 'bidWinnerTeam' | 'opposingTeam';
  individualScores: { [playerId: string]: number };
} {
  const partnership = gameState.settings.partnership;
  const bidAmount = gameState.bidding.currentBid;
  const bidWinnerTeamMembers = partnership
    ? [partnership.bidWinner, ...partnership.partners]
    : [];
  const opposingTeamMembers = gameState.players
    .map(player => player.id)
    .filter(playerId => !bidWinnerTeamMembers.includes(playerId));

  const trickTotals = gameState.completedTricks.reduce(
    (totals, trick) => {
      if (!trick.winner) {
        return totals;
      }

      if (bidWinnerTeamMembers.includes(trick.winner)) {
        totals.bidWinnerTeamScore += trick.points;
      } else {
        totals.opposingTeamScore += trick.points;
      }

      return totals;
    },
    { bidWinnerTeamScore: 0, opposingTeamScore: 0 }
  );

  const individualScores: { [playerId: string]: number } = {};
  gameState.players.forEach(player => {
    individualScores[player.id] = 0;
  });

  const bidderWon = trickTotals.bidWinnerTeamScore >= bidAmount;

  if (partnership) {
    if (bidderWon) {
      individualScores[partnership.bidWinner] = bidAmount * 2;
      partnership.partners.forEach(playerId => {
        individualScores[playerId] = bidAmount;
      });
    } else {
      opposingTeamMembers.forEach(playerId => {
        individualScores[playerId] = bidAmount;
      });
    }
  }

  return {
    bidWinnerTeamScore: trickTotals.bidWinnerTeamScore,
    opposingTeamScore: trickTotals.opposingTeamScore,
    winner: bidderWon ? 'bidWinnerTeam' : 'opposingTeam',
    individualScores
  };
}

/**
 * Complete dealing process that transitions game state from setup through dealing to bidding
 */
export function dealCardsAndTransitionState(gameState: GameState): GameState {
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

  // First transition to dealing state to show cards
  const dealingState: GameState = {
    ...gameState,
    status: 'dealing',
    players: playersWithSortedCards,
    deck: remainingDeck,
    currentPlayer,
    updatedAt: Date.now()
  };

  return dealingState;
}

/**
 * Transition from dealing to bidding state
 */
export function transitionToBidding(gameState: GameState): GameState {
  if (gameState.status !== 'dealing') {
    return gameState;
  }

  // Find the dealer and set first bidder (player to the left of dealer)
  const dealerIndex = gameState.players.findIndex(p => p.isDealer);
  const firstBidderIndex = (dealerIndex + 1) % gameState.players.length;
  const firstBidder = gameState.players[firstBidderIndex].id;

  const result: GameState = {
    ...gameState,
    status: 'bidding' as GameState['status'],
    currentPlayer: firstBidder, // Use proper turn order
    bidding: {
      bids: [],
      currentBid: gameState.settings.biddingConfig.startBid - Math.min(...gameState.settings.biddingConfig.increments),
      winner: null,
      isActive: true
    },
    updatedAt: Date.now()
  };
  
  return result;
}

/**
 * Check if the game is ready to start dealing (all required players have joined)
 */
export function isReadyToDeal(gameState: GameState): boolean {
  return (gameState.status === 'setup' || gameState.status === 'waiting') && 
         gameState.players.length === gameState.settings.mode.players &&
         gameState.players.every(player => player.name.trim() !== '');
}

/**
 * Check if all players in the current bidding round have passed
 */
export function checkBiddingRoundComplete(gameState: GameState): {
  isComplete: boolean;
  canAdvance: boolean;
  winner: string | null;
} {
  const totalPlayers = gameState.players.length;
  const bids = gameState.bidding.bids;
  
  if (bids.length === 0) {
    return { isComplete: false, canAdvance: false, winner: null };
  }

  // Find all actual bids (not passes) 
  const actualBids = bids.filter(bid => bid.passed !== true && bid.amount > 0);
  
  if (actualBids.length === 0) {
    // Everyone passed - no winner
    return { isComplete: true, canAdvance: false, winner: null };
  }
  
  // Find the highest bid (and most recent if tied)
  const sortedByAmount = actualBids.sort((a, b) => {
    if (a.amount !== b.amount) {
      return b.amount - a.amount; // Highest amount first
    }
    return b.timestamp - a.timestamp; // Most recent first if tied
  });
  
  const winningBid = sortedByAmount[0];
  
  // NEW LOGIC: Check if bidding should end based on consecutive passes after highest bid
  // Find index of the winning bid in the bids array
  const winningBidIndex = bids.findIndex(bid => 
    bid.playerId === winningBid.playerId && 
    bid.amount === winningBid.amount && 
    bid.timestamp === winningBid.timestamp
  );
  
  // Count consecutive passes after the winning bid
  const bidsAfterWinning = bids.slice(winningBidIndex + 1);
  
  // Check if all bids after winning bid are passes
  const allPassesAfterWinning = bidsAfterWinning.every(bid => bid.passed === true);
  const passCountAfterWinning = bidsAfterWinning.filter(bid => bid.passed === true).length;
  
  // Bidding ends when (totalPlayers - 1) consecutive passes follow the highest bid
  if (allPassesAfterWinning && passCountAfterWinning === totalPlayers - 1) {
    return { isComplete: true, canAdvance: true, winner: winningBid.playerId };
  }
  
  return { isComplete: false, canAdvance: false, winner: null };
}

/**
 * Get the next player who should bid
 */
export function getNextBidder(gameState: GameState): string | null {
  const bids = gameState.bidding.bids;
  const totalPlayers = gameState.players.length;
  
  if (bids.length === 0) {
    // Start with the player after the dealer (correct)
    const dealerIndex = gameState.players.findIndex(p => p.isDealer);
    const firstBidderIndex = (dealerIndex + 1) % totalPlayers;
    const firstBidder = gameState.players[firstBidderIndex];
    return firstBidder.id;
  }

  // Find who made the last bid/pass and get the next player in rotation
  const lastBid = bids[bids.length - 1];
  const lastPlayerIndex = gameState.players.findIndex(p => p.id === lastBid.playerId);
  
  if (lastPlayerIndex === -1) {
    return null;
  }

  // Get next player in turn order (simple rotation)
  const nextPlayerIndex = (lastPlayerIndex + 1) % totalPlayers;
  const nextPlayer = gameState.players[nextPlayerIndex];
  
  return nextPlayer.id;
}

/**
 * Convert card rank to numeric value for comparison
 */
export function convertRankToValue(rank: Rank): number {
  const rankMap: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return rankMap[rank] || 0;
}

/**
 * Interface for a played card in a trick
 */
export interface PlayedCard {
  playerId: string;
  playerName: string;
  card: Card;
}

/**
 * Determine the winner of a trick based on cards played and game rules
 * @param trick - Array of played cards with player info
 * @param leadSuit - The suit that was led (first card played)
 * @param powerhouseSuit - The trump/powerhouse suit chosen during partner selection
 * @returns The player ID who won the trick
 */
export function determineTrickWinner(
  trick: PlayedCard[], 
  leadSuit: Suit, 
  powerhouseSuit: Suit
): string | null {
  if (trick.length === 0) return null;

  const validCards: Array<{
    playerId: string;
    playerName: string;
    rankValue: number;
    suit: Suit;
    isPowerhouse: boolean;
    followsSuit: boolean;
  }> = [];

  // Analyze each played card
  for (const playedCard of trick) {
    const { card, playerId, playerName } = playedCard;
    const rankValue = convertRankToValue(card.rank);
    const isPowerhouse = card.suit === powerhouseSuit;
    const followsSuit = card.suit === leadSuit;

    // A card can potentially win if it follows suit OR is powerhouse
    if (followsSuit || isPowerhouse) {
      validCards.push({
        playerId,
        playerName,
        rankValue,
        suit: card.suit,
        isPowerhouse,
        followsSuit
      });
    }
  }

  if (validCards.length === 0) {
    return null;
  }

  // Find the winning card using priority system:
  // 1. Powerhouse cards beat non-powerhouse cards
  // 2. Within same priority level, higher rank wins
  const winningCard = validCards.reduce((best, current) => {
    // Powerhouse vs non-powerhouse
    if (current.isPowerhouse && !best.isPowerhouse) {
      return current;
    }
    if (best.isPowerhouse && !current.isPowerhouse) {
      return best;
    }
    
    // Both same priority level - compare ranks
    if (current.rankValue > best.rankValue) {
      return current;
    }
    
    return best;
  });

  return winningCard.playerId;
}
