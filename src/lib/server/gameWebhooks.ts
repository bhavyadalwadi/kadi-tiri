import { createHmac } from 'crypto';
import type { GameEvent } from '@/lib/server/gameEvents';
import {
  getWebhookDelivery,
  saveWebhookDelivery,
  WebhookDeliveryRecord
} from '@/lib/server/gamePersistence';

const WEBHOOK_URL = process.env.GAME_WEBHOOK_URL?.trim() || '';
const WEBHOOK_SECRET = process.env.GAME_WEBHOOK_SECRET?.trim() || '';
const WEBHOOK_TIMEOUT_MS = Number(process.env.GAME_WEBHOOK_TIMEOUT_MS || 5000);
const WEBHOOK_MAX_RETRIES = Number(process.env.GAME_WEBHOOK_MAX_RETRIES || 3);
const WEBHOOK_RETRY_DELAY_MS = Number(process.env.GAME_WEBHOOK_RETRY_DELAY_MS || 1000);

const DELIVERABLE_EVENT_TYPES = new Set([
  'game.created',
  'player.joined',
  'game.startBidding',
  'game.placeBid',
  'game.passBid',
  'game.selectPowerhouse',
  'game.selectPartners',
  'game.startPlaying',
  'game.playCard'
]);

function isWebhookEnabled() {
  return Boolean(WEBHOOK_URL && WEBHOOK_SECRET);
}

function signPayload(payload: string) {
  return createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
}

function toDeliveryRecord(
  event: GameEvent,
  attempt: number,
  status: WebhookDeliveryRecord['status'],
  error?: string
): WebhookDeliveryRecord {
  const now = Date.now();

  return {
    id: event.id,
    eventId: event.id,
    gameId: event.gameId,
    eventType: event.type,
    status,
    attempts: attempt,
    lastAttemptAt: now,
    deliveredAt: status === 'delivered' ? now : undefined,
    nextRetryAt: status === 'retrying' ? now + WEBHOOK_RETRY_DELAY_MS * attempt : undefined,
    error
  };
}

async function deliverWebhook(event: GameEvent, attempt: number): Promise<void> {
  const payload = JSON.stringify(event);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kadi-Tiri-Event': event.type,
        'X-Kadi-Tiri-Delivery': event.id,
        'X-Kadi-Tiri-Signature': signPayload(payload)
      },
      body: payload,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Webhook responded ${response.status}`);
    }

    console.info(`[webhook] delivered ${event.type} (${event.id}) on attempt ${attempt}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function scheduleRetry(event: GameEvent, attempt: number, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown webhook error';

  if (attempt >= WEBHOOK_MAX_RETRIES) {
    await saveWebhookDelivery(toDeliveryRecord(event, attempt, 'failed', message));
    console.error(`[webhook] failed ${event.type} (${event.id}) after ${attempt} attempts`, error);
    return;
  }

  await saveWebhookDelivery(toDeliveryRecord(event, attempt, 'retrying', message));
  console.warn(`[webhook] retrying ${event.type} (${event.id}) after attempt ${attempt}`, error);
  setTimeout(() => {
    void sendGameWebhook(event, attempt + 1);
  }, WEBHOOK_RETRY_DELAY_MS * attempt);
}

export async function sendGameWebhook(event: GameEvent, attempt = 1): Promise<void> {
  if (!isWebhookEnabled() || !DELIVERABLE_EVENT_TYPES.has(event.type)) {
    return;
  }

  const existingDelivery = await getWebhookDelivery(event.id);
  if (existingDelivery?.status === 'delivered') {
    return;
  }

  try {
    await saveWebhookDelivery(toDeliveryRecord(event, attempt, 'pending'));
    await deliverWebhook(event, attempt);
    await saveWebhookDelivery(toDeliveryRecord(event, attempt, 'delivered'));
  } catch (error) {
    await scheduleRetry(event, attempt, error);
  }
}
