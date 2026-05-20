import { GameState } from '@/types/game';
import { persistDatabase, withDatabase } from '@/lib/server/sqliteDb';

// Per-game mutex to preserve atomic read -> transform -> write behavior.
const gameLocks = new Map<string, Promise<unknown>>();

export async function withGameLock<T>(
  gameId: string,
  fn: () => Promise<T>
): Promise<T> {
  const prev = gameLocks.get(gameId) ?? Promise.resolve();
  const next = prev.then(fn, fn as () => T);
  const guardedNext = next.catch(() => undefined);

  gameLocks.set(gameId, guardedNext);
  guardedNext.then(() => {
    if (gameLocks.get(gameId) === guardedNext) {
      gameLocks.delete(gameId);
    }
  });

  return next;
}

export async function getGame(gameId: string): Promise<GameState | null> {
  return withDatabase(async (db) => {
    const statement = db.prepare('SELECT state_json FROM games WHERE game_id = ?');
    statement.bind([gameId]);

    let gameState: GameState | null = null;
    if (statement.step()) {
      const row = statement.getAsObject() as { state_json: string };
      gameState = JSON.parse(row.state_json) as GameState;
    }

    statement.free();
    return gameState;
  });
}

export async function saveGame(gameState: GameState): Promise<GameState> {
  await withDatabase(async (db) => {
    db.run(
      'INSERT OR REPLACE INTO games (game_id, state_json, updated_at) VALUES (?, ?, ?)',
      [gameState.id, JSON.stringify(gameState), gameState.updatedAt]
    );
    await persistDatabase(db);
  });

  return gameState;
}

export async function atomicUpdate(
  gameId: string,
  transform: (current: GameState) => Promise<GameState> | GameState
): Promise<GameState> {
  return withGameLock(gameId, async () => {
    return withDatabase(async (db) => {
      const statement = db.prepare('SELECT state_json FROM games WHERE game_id = ?');
      statement.bind([gameId]);

      if (!statement.step()) {
        statement.free();
        throw new Error(`Game ${gameId} not found`);
      }

      const row = statement.getAsObject() as { state_json: string };
      statement.free();

      const current = JSON.parse(row.state_json) as GameState;
      const next = await transform(current);

      db.run(
        'INSERT OR REPLACE INTO games (game_id, state_json, updated_at) VALUES (?, ?, ?)',
        [gameId, JSON.stringify(next), next.updatedAt]
      );
      await persistDatabase(db);

      return next;
    });
  });
}

export async function deleteGame(gameId: string): Promise<void> {
  await withDatabase(async (db) => {
    db.run('DELETE FROM games WHERE game_id = ?', [gameId]);
    await persistDatabase(db);
  });
}
