import type { NextApiRequest, NextApiResponse } from 'next';
import { Player } from '@/types/game';
import { applyStartBidding } from '@/lib/gameActions';
import { atomicUpdate } from '@/lib/server/gameStorage';
import { nextUpdatedAt } from '@/utils/gameUtils';
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
    let resolvedPlayerId: string | null = null;

    const savedState = await atomicUpdate(gameId, currentState => {
      const existingPlayer = currentState.players.find(
        player => player.name.trim().toLowerCase() === playerName.trim().toLowerCase()
      );
      if (existingPlayer) {
        resolvedPlayerId = existingPlayer.id;
        return currentState;
      }

      if (currentState.players.length >= currentState.settings.mode.players) {
        throw new Error('Game is already full');
      }

      const joinedPlayer: Player = {
        id: generatePlayerId(),
        name: playerName.trim(),
        cards: [],
        score: 0,
        position: currentState.players.length,
        isDealer: false,
        isActive: false
      };
      resolvedPlayerId = joinedPlayer.id;

      const joinedState = {
        ...currentState,
        players: [...currentState.players, joinedPlayer],
        updatedAt: nextUpdatedAt(currentState.updatedAt)
      };

      if (
        joinedState.status === 'waiting' &&
        joinedState.players.length === joinedState.settings.mode.players
      ) {
        const result = applyStartBidding({
          ...joinedState,
          deck: joinedState.deck.length ? joinedState.deck : joinedState.deck
        });
        if ('error' in result) {
          throw new Error(result.error);
        }
        return result.state;
      }

      return joinedState;
    }).catch(error => {
      if (error instanceof Error && error.message === `Game ${gameId} not found`) {
        return null;
      }
      throw error;
    });

    if (!savedState) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }

    return res.status(200).json({
      success: true,
      data: savedState,
      currentPlayerId: resolvedPlayerId
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Game is already full') {
      return res.status(409).json({ success: false, error: error.message });
    }
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to join game'
    });
  }
}
