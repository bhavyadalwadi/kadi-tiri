import type { NextApiRequest, NextApiResponse } from 'next';
import { Difficulty, GAME_MODES, GameSettings } from '@/types/game';
import { createInitialGameState } from '@/lib/server/gameFactory';
import { saveGame } from '@/lib/server/gameStorage';
import { applyStartBidding } from '@/lib/gameActions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const hostName = req.body?.hostName as string | undefined;
  const playerNames = req.body?.playerNames as string[] | undefined;
  const gameMode = req.body?.gameMode as keyof typeof GAME_MODES | undefined;
  const difficulty = req.body?.difficulty as Difficulty | undefined;
  const settings = req.body?.settings as Partial<GameSettings> | undefined;
  const autostart = Boolean(req.body?.autostart);

  if (!gameMode || !(hostName?.trim() || playerNames?.length)) {
    return res.status(400).json({ success: false, error: 'Missing room creation details' });
  }

  try {
    const { gameState, currentPlayerId } = createInitialGameState({
      hostName,
      playerNames,
      gameMode,
      difficulty,
      settings,
      status: playerNames?.length ? 'setup' : 'waiting'
    });

    const initialState =
      autostart && gameState.status === 'setup'
        ? (() => {
            const result = applyStartBidding(gameState);
            if ('error' in result) {
              throw new Error(result.error);
            }
            return result.state;
          })()
        : gameState;

    const savedGame = await saveGame(initialState);
    return res.status(200).json({
      success: true,
      data: savedGame,
      currentPlayerId
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create game'
    });
  }
}
