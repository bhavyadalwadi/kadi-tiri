import type { NextApiRequest, NextApiResponse } from 'next';
import { GameState } from '@/types/game';
import { saveGame } from '@/lib/server/gameStorage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const gameState = req.body?.gameState as GameState | undefined;
  if (!gameState?.id) {
    return res.status(400).json({ success: false, error: 'Missing gameState' });
  }

  try {
    const savedGame = await saveGame(gameState);
    return res.status(200).json({ success: true, data: savedGame });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create game'
    });
  }
}
