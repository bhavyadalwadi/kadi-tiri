import { promises as fs } from 'fs';
import path from 'path';
import { GameState } from '@/types/game';

const dataDir = path.join(process.cwd(), 'data');
const gamesFile = path.join(dataDir, 'games.json');

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

export async function deleteGame(gameId: string): Promise<void> {
  const games = await readGames();
  delete games[gameId];
  await writeGames(games);
}
