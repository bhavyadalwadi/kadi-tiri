import type { NextApiRequest, NextApiResponse } from 'next';
import { GameState } from '@/types/game';
import { getGame, saveGame } from '@/lib/server/gameStorage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
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

  if (req.method === 'POST') {
    const gameState = req.body?.gameState as GameState | undefined;
    if (!gameState?.id) {
      return res.status(400).json({ success: false, error: 'Missing gameState' });
    }

    try {
      const savedGame = await saveGame({
        ...gameState,
        updatedAt: Date.now()
      });
      return res.status(200).json({ success: true, data: savedGame });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save game'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
