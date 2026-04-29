import type { NextApiRequest, NextApiResponse } from 'next';
import { Player } from '@/types/game';
import { getGame, saveGame } from '@/lib/server/gameStorage';
import { generatePlayerId } from '@/utils/gameUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const gameId = req.body?.gameId as string | undefined;
  const playerName = req.body?.playerName as string | undefined;

  if (!gameId || !playerName?.trim()) {
    return res.status(400).json({ success: false, error: 'Missing gameId or playerName' });
  }

  try {
    const gameState = await getGame(gameId);
    if (!gameState) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }

    const existingPlayer = gameState.players.find(
      player => player.name.trim().toLowerCase() === playerName.trim().toLowerCase()
    );
    if (existingPlayer) {
      return res.status(200).json({
        success: true,
        data: gameState,
        currentPlayerId: existingPlayer.id
      });
    }

    if (gameState.players.length >= gameState.settings.mode.players) {
      return res.status(409).json({ success: false, error: 'Game is already full' });
    }

    const joinedPlayer: Player = {
      id: generatePlayerId(),
      name: playerName.trim(),
      cards: [],
      score: 0,
      position: gameState.players.length,
      isDealer: false,
      isActive: false
    };

    const joinedState = {
      ...gameState,
      players: [...gameState.players, joinedPlayer],
      updatedAt: Date.now()
    };

    const savedState = await saveGame(joinedState);
    return res.status(200).json({
      success: true,
      data: savedState,
      currentPlayerId: joinedPlayer.id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to join game'
    });
  }
}
