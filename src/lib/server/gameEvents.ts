import { GameState } from '@/types/game';
import { sendGameWebhook } from '@/lib/server/gameWebhooks';
import { appendGameEvent } from '@/lib/server/gamePersistence';

export type GameEventType =
  | 'snapshot'
  | 'game.created'
  | 'player.joined'
  | 'game.startBidding'
  | 'game.placeBid'
  | 'game.passBid'
  | 'game.selectPowerhouse'
  | 'game.selectPartners'
  | 'game.startPlaying'
  | 'game.playCard';

export interface GameEvent {
  id: string;
  gameId: string;
  type: GameEventType;
  occurredAt: number;
  state: GameState;
}

type GameEventListener = (event: GameEvent) => void;

const gameEventListeners = new Map<string, Set<GameEventListener>>();
const gameEventSequences = new Map<string, number>();

function nextEventId(gameId: string, occurredAt: number): string {
  const sequence = (gameEventSequences.get(gameId) || 0) + 1;
  gameEventSequences.set(gameId, sequence);
  return `${gameId}:${occurredAt}:${sequence}`;
}

export function createGameEvent(type: GameEventType, state: GameState): GameEvent {
  const occurredAt = Date.now();

  return {
    id: nextEventId(state.id, occurredAt),
    gameId: state.id,
    type,
    occurredAt,
    state
  };
}

export function publishGameEvent(event: GameEvent) {
  void appendGameEvent(event);
  void sendGameWebhook(event);

  const listeners = gameEventListeners.get(event.gameId);
  if (!listeners?.size) {
    return;
  }

  listeners.forEach(listener => {
    listener(event);
  });
}

export function subscribeToGameEvents(gameId: string, listener: GameEventListener) {
  const listeners = gameEventListeners.get(gameId) || new Set<GameEventListener>();
  listeners.add(listener);
  gameEventListeners.set(gameId, listeners);

  return () => {
    const currentListeners = gameEventListeners.get(gameId);
    if (!currentListeners) {
      return;
    }

    currentListeners.delete(listener);
    if (currentListeners.size === 0) {
      gameEventListeners.delete(gameId);
    }
  };
}
