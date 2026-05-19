import type { GameState } from '@/types/game';

type GameListener = (gameState: GameState) => void;

const listenersByGame = new Map<string, Set<GameListener>>();

export function subscribeToGame(gameId: string, listener: GameListener): () => void {
  const listeners = listenersByGame.get(gameId) ?? new Set<GameListener>();
  listeners.add(listener);
  listenersByGame.set(gameId, listeners);

  return () => {
    const current = listenersByGame.get(gameId);
    if (!current) {
      return;
    }

    current.delete(listener);
    if (current.size === 0) {
      listenersByGame.delete(gameId);
    }
  };
}

export function publishGameState(gameState: GameState) {
  const listeners = listenersByGame.get(gameState.id);
  if (!listeners?.size) {
    return;
  }

  listeners.forEach(listener => {
    listener(gameState);
  });
}
