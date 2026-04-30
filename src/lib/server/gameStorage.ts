import { promises as fs } from 'fs';
import path from 'path';
import { GameState } from '@/types/game';

const dataDir = path.join(process.cwd(), 'data');
const gamesFile = path.join(dataDir, 'games.json');

// ─── Per-game mutex ──────────────────────────────────────────────────────────
// Each game ID maps to the tail of a promise chain so that concurrent action
// requests for the same game are serialised: each request waits for the
// previous one to finish before it reads from disk, applies its change, and
// writes back.  This prevents the TOCTOU race where two simultaneous reads
// both see the same state and the last write wins.
const gameLocks = new Map<string, Promise<unknown>>();

/**
 * Run `fn` exclusively for `gameId`.  Concurrent callers queue behind the
 * current holder and run in FIFO order.
 */
export async function withGameLock<T>(
  gameId: string,
  fn: () => Promise<T>
): Promise<T> {
  const prev = gameLocks.get(gameId) ?? Promise.resolve();
  // Attach our work to the tail; swallow errors so the next waiter still runs.
  const next = prev.then(fn, fn as () => T);
  gameLocks.set(gameId, next.catch(() => undefined));
  // Clean up the map entry once the chain empties to avoid memory leaks.
  next.catch(() => undefined).then(() => {
    if (gameLocks.get(gameId) === next.catch(() => undefined)) {
      gameLocks.delete(gameId);
    }
  });
  return next;
}

async function ensureDataFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(gamesFile);
  } catch {
    await fs.writeFile(gamesFile, '{}', 'utf8');
  }
}

async function readGames(): Promise<Record<string, GameState>> {
  await ensureDataFile();
  const raw = await fs.readFile(gamesFile, 'utf8');
  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, GameState>;
  } catch {
    return {};
  }
}

async function writeGames(games: Record<string, GameState>) {
  await ensureDataFile();
  await fs.writeFile(gamesFile, JSON.stringify(games, null, 2), 'utf8');
}

export async function getGame(gameId: string): Promise<GameState | null> {
  const games = await readGames();
  return games[gameId] || null;
}

export async function saveGame(gameState: GameState): Promise<GameState> {
  const games = await readGames();
  games[gameState.id] = gameState;
  await writeGames(games);
  return gameState;
}

/**
 * Atomically load a game, run a transform, and persist the result.
 * The entire read → transform → write sequence runs inside the per-game mutex,
 * so concurrent requests are serialised and no state is silently overwritten.
 *
 * `transform` receives the current state (or null if not found) and should
 * return the new state to persist, or throw / return null to abort.
 */
export async function atomicUpdate(
  gameId: string,
  transform: (current: GameState) => Promise<GameState> | GameState
): Promise<GameState> {
  return withGameLock(gameId, async () => {
    const games = await readGames();
    const current = games[gameId];
    if (!current) {
      throw new Error(`Game ${gameId} not found`);
    }
    const next = await transform(current);
    games[gameId] = next;
    await writeGames(games);
    return next;
  });
}

export async function deleteGame(gameId: string): Promise<void> {
  const games = await readGames();
  delete games[gameId];
  await writeGames(games);
}
