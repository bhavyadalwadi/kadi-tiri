import { promises as fs } from 'fs';
import path from 'path';

const initSqlJs: (config: { locateFile: (file: string) => string }) => Promise<any> = require('sql.js');

const dataDir = path.join(process.cwd(), 'data');
const databaseFile = path.join(dataDir, 'kadi-tiri.sqlite');
const legacyGamesFile = path.join(dataDir, 'games.json');
const legacyEventLogFile = path.join(dataDir, 'game-events.jsonl');
const legacyWebhookFile = path.join(dataDir, 'webhook-deliveries.json');

let sqlPromise: Promise<any> | null = null;
let databasePromise: Promise<any> | null = null;
let dbQueue: Promise<unknown> = Promise.resolve();

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function loadSql() {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: (file) => path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file)
    });
  }

  return sqlPromise;
}

function getCount(db: any, tableName: string): number {
  const result = db.exec(`SELECT COUNT(*) AS count FROM ${tableName}`);
  if (!result.length) {
    return 0;
  }

  return Number(result[0].values[0][0] || 0);
}

async function migrateLegacyGames(db: any) {
  if (!(await fileExists(legacyGamesFile)) || getCount(db, 'games') > 0) {
    return false;
  }

  const raw = await fs.readFile(legacyGamesFile, 'utf8');
  if (!raw.trim()) {
    return false;
  }

  const games = JSON.parse(raw) as Record<string, { updatedAt?: number }>;
  const insert = db.prepare('INSERT OR REPLACE INTO games (game_id, state_json, updated_at) VALUES (?, ?, ?)');

  Object.entries(games).forEach(([gameId, state]) => {
    insert.run([gameId, JSON.stringify(state), Number(state.updatedAt || Date.now())]);
  });

  insert.free();
  return Object.keys(games).length > 0;
}

async function migrateLegacyEventLog(db: any) {
  if (!(await fileExists(legacyEventLogFile)) || getCount(db, 'game_events') > 0) {
    return false;
  }

  const raw = await fs.readFile(legacyEventLogFile, 'utf8');
  const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);
  if (!lines.length) {
    return false;
  }

  const insert = db.prepare(
    'INSERT OR REPLACE INTO game_events (event_id, game_id, event_type, occurred_at, payload_json) VALUES (?, ?, ?, ?, ?)'
  );

  lines.forEach((line) => {
    const event = JSON.parse(line) as { id: string; gameId: string; type: string; occurredAt: number };
    insert.run([event.id, event.gameId, event.type, event.occurredAt, line]);
  });

  insert.free();
  return true;
}

async function migrateLegacyWebhookDeliveries(db: any) {
  if (!(await fileExists(legacyWebhookFile)) || getCount(db, 'webhook_deliveries') > 0) {
    return false;
  }

  const raw = await fs.readFile(legacyWebhookFile, 'utf8');
  if (!raw.trim()) {
    return false;
  }

  const records = JSON.parse(raw) as Record<string, {
    id: string;
    eventId: string;
    gameId: string;
    eventType: string;
    status: string;
    attempts: number;
    lastAttemptAt: number;
    deliveredAt?: number;
    nextRetryAt?: number;
    error?: string;
  }>;

  const insert = db.prepare(
    'INSERT OR REPLACE INTO webhook_deliveries (id, event_id, game_id, event_type, status, attempts, last_attempt_at, delivered_at, next_retry_at, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  Object.values(records).forEach((record) => {
    insert.run([
      record.id,
      record.eventId,
      record.gameId,
      record.eventType,
      record.status,
      record.attempts,
      record.lastAttemptAt,
      record.deliveredAt || null,
      record.nextRetryAt || null,
      record.error || null
    ]);
  });

  insert.free();
  return Object.keys(records).length > 0;
}

async function persistIfNeeded(db: any, migrated: boolean) {
  if (migrated) {
    await persistDatabase(db);
  }
}

async function setupSchema(db: any) {
  db.run(`
    CREATE TABLE IF NOT EXISTS games (
      game_id TEXT PRIMARY KEY,
      state_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS game_events (
      event_id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      occurred_at INTEGER NOT NULL,
      payload_json TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_game_events_game_id ON game_events (game_id);

    CREATE TABLE IF NOT EXISTS webhook_deliveries (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      game_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      status TEXT NOT NULL,
      attempts INTEGER NOT NULL,
      last_attempt_at INTEGER NOT NULL,
      delivered_at INTEGER,
      next_retry_at INTEGER,
      error TEXT
    );
  `);

  const migratedGames = await migrateLegacyGames(db);
  const migratedEvents = await migrateLegacyEventLog(db);
  const migratedDeliveries = await migrateLegacyWebhookDeliveries(db);
  await persistIfNeeded(db, migratedGames || migratedEvents || migratedDeliveries);
}

async function loadDatabase() {
  await ensureDataDir();
  const SQL = await loadSql();

  let db: any;
  if (await fileExists(databaseFile)) {
    const fileBuffer = await fs.readFile(databaseFile);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  await setupSchema(db);
  return db;
}

export async function getDatabase() {
  if (!databasePromise) {
    databasePromise = loadDatabase();
  }

  return databasePromise;
}

export async function persistDatabase(db: any) {
  await ensureDataDir();
  await fs.writeFile(databaseFile, Buffer.from(db.export()));
}

export async function withDatabase<T>(fn: (db: any) => Promise<T> | T): Promise<T> {
  const run = async () => {
    const db = await getDatabase();
    return fn(db);
  };

  const next = dbQueue.then(run, run);
  dbQueue = next.catch(() => undefined);
  return next;
}
