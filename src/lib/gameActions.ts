/**
 * Pure action applicators shared between client (optimistic update) and server (validation).
 * Each function reads current state, validates the action, and returns the next state.
 * On invalid input a string error message is returned instead.
 */

import { Card, GameState, Bid, Suit } from '@/types/game';
import {
  isValidBid,
  checkBiddingRoundComplete,
  getNextBidder,
  determineTrickWinner,
  calculateFinalScores,
  dealCardsAndTransitionState,
  transitionToBidding,
  isReadyToDeal,
  dealCards,
  sortCards
} from '@/utils/gameUtils';

export type ActionResult = { state: GameState } | { error: string };

// ─── helpers ────────────────────────────────────────────────────────────────

function ok(state: GameState): ActionResult {
  return { state };
}
function err(msg: string): ActionResult {
  return { error: msg };
}

// ─── startBidding ────────────────────────────────────────────────────────────

export function applyStartBidding(state: GameState): ActionResult {
  if (isReadyToDeal(state)) {
    const dealingState = dealCardsAndTransitionState(state);
    const biddingState = transitionToBidding({ ...dealingState, status: 'dealing' });
    return ok({ ...biddingState, updatedAt: Date.now() });
  }

  // Fallback path: already past setup, just transition to bidding.
  const { players: dealtPlayers, remainingDeck } = dealCards(
    state.deck,
    state.players,
    state.settings.mode.cardsPerPlayer
  );

  return ok({
    ...state,
    status: 'bidding',
    players: dealtPlayers,
    deck: remainingDeck,
    bidding: { ...state.bidding, isActive: true },
    updatedAt: Date.now()
  });
}

// ─── placeBid ────────────────────────────────────────────────────────────────

export function applyPlaceBid(state: GameState, playerId: string, amount: number): ActionResult {
  if (state.status !== 'bidding') return err('Game is not in bidding phase');
  if (state.currentPlayer !== playerId) return err('Not your turn to bid');
  if (!state.players.find(p => p.id === playerId)) return err('Player not found');
  if (
    !isValidBid(
      amount,
      state.bidding.currentBid,
      state.settings.mode,
      state.settings.biddingConfig.increments
    )
  ) {
    return err('Invalid bid amount');
  }

  const newBid: Bid = { playerId, amount, timestamp: Date.now(), passed: false };
  const updatedBids = [...state.bidding.bids, newBid];
  const updated: GameState = {
    ...state,
    bidding: { ...state.bidding, bids: updatedBids, currentBid: amount, winner: playerId },
    updatedAt: Date.now()
  };

  return _resolveBiddingRound(state, updated);
}

// ─── passBid ─────────────────────────────────────────────────────────────────

export function applyPassBid(state: GameState, playerId: string): ActionResult {
  if (state.status !== 'bidding') return err('Game is not in bidding phase');
  if (state.currentPlayer !== playerId) return err('Not your turn to pass');
  if (!state.players.find(p => p.id === playerId)) return err('Player not found');

  const passBid: Bid = { playerId, amount: 0, timestamp: Date.now(), passed: true };
  const updatedBids = [...state.bidding.bids, passBid];
  const updated: GameState = {
    ...state,
    bidding: { ...state.bidding, bids: updatedBids },
    updatedAt: Date.now()
  };

  return _resolveBiddingRound(state, updated);
}

// ─── shared bidding resolution ───────────────────────────────────────────────

function _resolveBiddingRound(original: GameState, updated: GameState): ActionResult {
  const biddingStatus = checkBiddingRoundComplete(updated);

  if (biddingStatus.isComplete) {
    if (biddingStatus.canAdvance && biddingStatus.winner) {
      return ok({
        ...updated,
        status: 'partner-selection',
        bidding: { ...updated.bidding, winner: biddingStatus.winner, isActive: false }
      });
    }

    // All passed – restart with a lower minimum.
    const minimumIncrement = Math.min(...original.settings.biddingConfig.increments);
    const newStartBid = Math.max(
      original.settings.biddingConfig.startBid - minimumIncrement,
      Math.floor(original.settings.biddingConfig.startBid * 0.8)
    );
    return ok({
      ...original,
      bidding: {
        bids: [],
        currentBid: newStartBid,
        winner: null,
        isActive: true
      },
      currentPlayer:
        original.players.find(p => p.isDealer)?.id || original.players[0].id,
      updatedAt: Date.now()
    });
  }

  // Continue bidding – advance to next player.
  const nextPlayer = getNextBidder(updated);
  return ok({
    ...updated,
    currentPlayer: nextPlayer ?? original.currentPlayer
  });
}

// ─── selectPowerhouse ────────────────────────────────────────────────────────

export function applySelectPowerhouse(state: GameState, suit: string): ActionResult {
  if (state.status !== 'partner-selection') return err('Game is not in partner-selection phase');
  return ok({
    ...state,
    settings: { ...state.settings, powerhouseSuit: suit as Suit },
    updatedAt: Date.now()
  });
}

// ─── selectPartners ──────────────────────────────────────────────────────────

export function applySelectPartners(state: GameState, cards: Card[]): ActionResult {
  if (state.status !== 'partner-selection') return err('Game is not in partner-selection phase');

  const partnerPlayerIds: string[] = [];
  cards.forEach(partnerCard => {
    state.players.forEach(player => {
      if (player.id === state.bidding.winner) return;
      const hasCard = player.cards.some(
        c => c.rank === partnerCard.rank && c.suit === partnerCard.suit
      );
      if (hasCard && !partnerPlayerIds.includes(player.id)) {
        partnerPlayerIds.push(player.id);
      }
    });
  });

  const partnership = {
    bidWinner: state.bidding.winner!,
    partners: partnerPlayerIds,
    partnerCards: cards,
    revealed: false
  };

  return ok({
    ...state,
    settings: { ...state.settings, partnership },
    updatedAt: Date.now()
  });
}

// ─── startPlaying ────────────────────────────────────────────────────────────

export function applyStartPlaying(state: GameState): ActionResult {
  if (state.status !== 'partner-selection')
    return err('Cannot start playing – complete partner selection first');
  if (!state.settings.powerhouseSuit || !state.settings.partnership)
    return err('Powerhouse suit and partners must be selected before starting');

  return ok({
    ...state,
    status: 'playing',
    currentPlayer: state.bidding.winner ?? state.currentPlayer,
    currentTrick: null,
    completedTricks: [],
    updatedAt: Date.now()
  });
}

// ─── playCard ────────────────────────────────────────────────────────────────

export function applyPlayCard(state: GameState, playerId: string, card: Card): ActionResult {
  if (state.status !== 'playing') return err('Game is not in playing phase');
  if (state.currentPlayer !== playerId) return err('Not your turn to play');

  const player = state.players.find(p => p.id === playerId);
  if (!player) return err('Player not found');

  // Follow-suit enforcement.
  if (
    state.currentTrick &&
    state.currentTrick.leadSuit &&
    state.currentTrick.cards.length > 0
  ) {
    const leadSuit = state.currentTrick.leadSuit;
    const hasLeadSuit = player.cards.some(c => c.suit === leadSuit);
    if (hasLeadSuit && card.suit !== leadSuit) {
      return err(`You must play a ${leadSuit} card if you have one!`);
    }
  }

  // Remove card from the player's hand.
  const updatedPlayers = state.players.map(p =>
    p.id === playerId ? { ...p, cards: p.cards.filter(c => c.id !== card.id) } : p
  );

  // Add to current trick.
  let currentTrick = state.currentTrick
    ? { ...state.currentTrick, cards: [...state.currentTrick.cards] }
    : {
        id: `trick-${Date.now()}`,
        cards: [] as typeof state.currentTrick extends null ? never : NonNullable<typeof state.currentTrick>['cards'],
        leadSuit: card.suit,
        winner: null as string | null,
        points: 0,
        completed: false
      };

  const playedCard = {
    playerId,
    playerName: player.name,
    card,
    playOrder: currentTrick.cards.length
  };
  currentTrick.cards = [...currentTrick.cards, playedCard];

  if (currentTrick.cards.length === 1) {
    currentTrick.leadSuit = card.suit;
  }

  const trickComplete = currentTrick.cards.length === state.players.length;
  let nextPlayer = playerId;
  let updatedCompletedTricks = state.completedTricks;

  if (trickComplete) {
    const powerhouseSuit = state.settings.powerhouseSuit;
    if (powerhouseSuit && currentTrick.leadSuit) {
      const winnerId = determineTrickWinner(
        currentTrick.cards,
        currentTrick.leadSuit,
        powerhouseSuit
      );
      if (winnerId) {
        currentTrick = {
          ...currentTrick,
          winner: winnerId,
          completed: true,
          points: currentTrick.cards.reduce((s, pc) => s + pc.card.points, 0)
        };
        nextPlayer = winnerId;
        updatedCompletedTricks = [...state.completedTricks, currentTrick];
        currentTrick = null as unknown as typeof currentTrick;
      }
    }
  } else {
    const idx = state.players.findIndex(p => p.id === playerId);
    nextPlayer = state.players[(idx + 1) % state.players.length].id;
  }

  // Recalculate team scores incrementally.
  let bidWinnerTeamScore = state.scores.bidWinnerTeam;
  let opposingTeamScore = state.scores.opposingTeam;
  const breakdown = { ...state.scores.breakdown };

  if (updatedCompletedTricks.length > state.completedTricks.length) {
    const latest = updatedCompletedTricks[updatedCompletedTricks.length - 1];
    if (latest.winner && latest.points > 0) {
      breakdown[latest.winner] = (breakdown[latest.winner] ?? 0) + latest.points;

      if (state.settings.partnership) {
        const teamMembers = [
          state.settings.partnership.bidWinner,
          ...state.settings.partnership.partners
        ];
        if (teamMembers.includes(latest.winner)) {
          bidWinnerTeamScore += latest.points;
        } else {
          opposingTeamScore += latest.points;
        }
      }
    }
  }

  const allCardsPlayed = updatedPlayers.every(p => p.cards.length === 0);

  if (allCardsPlayed) {
    const temp: GameState = {
      ...state,
      players: updatedPlayers,
      completedTricks: updatedCompletedTricks
    };
    const finalScores = calculateFinalScores(temp);
    return ok({
      ...temp,
      status: 'finished',
      currentTrick: null,
      winner: finalScores.winner,
      scores: {
        bidWinnerTeam: finalScores.bidWinnerTeamScore,
        opposingTeam: finalScores.opposingTeamScore,
        breakdown: finalScores.individualScores
      },
      updatedAt: Date.now()
    });
  }

  return ok({
    ...state,
    players: updatedPlayers,
    currentPlayer: nextPlayer,
    currentTrick: currentTrick ?? null,
    completedTricks: updatedCompletedTricks,
    scores: { bidWinnerTeam: bidWinnerTeamScore, opposingTeam: opposingTeamScore, breakdown },
    updatedAt: Date.now()
  });
}
