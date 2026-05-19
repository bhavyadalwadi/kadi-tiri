import type { NextApiRequest, NextApiResponse } from 'next';
import { getGame } from '@/lib/server/gameStorage';

const POLL_INTERVAL_MS = 250;
const TIMEOUT_MS = 20000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const gameId = req.query.gameId;
  const since = Number(req.query.since || 0);

  if (typeof gameId !== 'string' || !gameId) {
    return res.status(400).json({ success: false, error: 'Missing gameId' });
  }

  const startedAt = Date.now();

  while (Date.now() - startedAt < TIMEOUT_MS) {
    const gameState = await getGame(gameId);
    if (!gameState) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }

    if (gameState.updatedAt > since) {
      return res.status(200).json({ success: true, data: gameState });
    }

    await sleep(POLL_INTERVAL_MS);
  }

  const gameState = await getGame(gameId);
  if (!gameState) {
    return res.status(404).json({ success: false, error: 'Game not found' });
  }

  return res.status(200).json({ success: true, data: gameState });
}
