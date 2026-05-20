import type { GameEvent } from '@/lib/server/gameEvents';
import { persistDatabase, withDatabase } from '@/lib/server/sqliteDb';

export interface WebhookDeliveryRecord {
  id: string;
  eventId: string;
  gameId: string;
  eventType: string;
  status: 'pending' | 'retrying' | 'delivered' | 'failed';
  attempts: number;
  lastAttemptAt: number;
  deliveredAt?: number;
  nextRetryAt?: number;
  error?: string;
}

export async function appendGameEvent(event: GameEvent): Promise<void> {
  await withDatabase(async (db) => {
    db.run(
      'INSERT OR REPLACE INTO game_events (event_id, game_id, event_type, occurred_at, payload_json) VALUES (?, ?, ?, ?, ?)',
      [event.id, event.gameId, event.type, event.occurredAt, JSON.stringify(event)]
    );
    await persistDatabase(db);
  });
}

export async function getWebhookDelivery(id: string): Promise<WebhookDeliveryRecord | null> {
  return withDatabase(async (db) => {
    const statement = db.prepare(
      'SELECT id, event_id, game_id, event_type, status, attempts, last_attempt_at, delivered_at, next_retry_at, error FROM webhook_deliveries WHERE id = ?'
    );
    statement.bind([id]);

    let record: WebhookDeliveryRecord | null = null;
    if (statement.step()) {
      const row = statement.getAsObject() as {
        id: string;
        event_id: string;
        game_id: string;
        event_type: string;
        status: WebhookDeliveryRecord['status'];
        attempts: number;
        last_attempt_at: number;
        delivered_at?: number;
        next_retry_at?: number;
        error?: string;
      };

      record = {
        id: row.id,
        eventId: row.event_id,
        gameId: row.game_id,
        eventType: row.event_type,
        status: row.status,
        attempts: Number(row.attempts),
        lastAttemptAt: Number(row.last_attempt_at),
        deliveredAt: row.delivered_at ? Number(row.delivered_at) : undefined,
        nextRetryAt: row.next_retry_at ? Number(row.next_retry_at) : undefined,
        error: row.error || undefined
      };
    }

    statement.free();
    return record;
  });
}

export async function saveWebhookDelivery(record: WebhookDeliveryRecord): Promise<void> {
  await withDatabase(async (db) => {
    db.run(
      'INSERT OR REPLACE INTO webhook_deliveries (id, event_id, game_id, event_type, status, attempts, last_attempt_at, delivered_at, next_retry_at, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
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
      ]
    );
    await persistDatabase(db);
  });
}
