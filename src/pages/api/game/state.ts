import type { NextApiRequest, NextApiResponse } from 'next';
import { getGame } from '@/lib/server/gameStorage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const gameId = req.query.gameId;
    if (typeof gameId !== 'string' || !gameId) {
      return res.status(400).json({ success: false, error: 'Missing gameId' });
    }

    try {
      const gameState = await getGame(gameId);
      if (!gameState) {
        return res.status(404).json({ success: false, error: 'Game not found' });
      }

      return res.status(200).json({ success: true, data: gameState });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load game'
      });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
