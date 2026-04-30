import type { NextApiRequest, NextApiResponse } from 'next';
import { Card } from '@/types/game';
import { atomicUpdate } from '@/lib/server/gameStorage';
import {
  applyStartBidding,
  applyPlaceBid,
  applyPassBid,
  applySelectPowerhouse,
  applySelectPartners,
  applyStartPlaying,
  applyPlayCard,
  ActionResult
} from '@/lib/gameActions';

export type GameActionType =
  | 'startBidding'
  | 'placeBid'
  | 'passBid'
  | 'selectPowerhouse'
  | 'selectPartners'
  | 'startPlaying'
  | 'playCard';

export interface GameActionRequest {
  gameId: string;
  type: GameActionType;
  playerId?: string;
  /** placeBid */
  amount?: number;
  /** selectPowerhouse */
  suit?: string;
  /** selectPartners */
  cards?: Card[];
  /** playCard */
  card?: Card;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = req.body as GameActionRequest;

  if (!body?.gameId || !body?.type) {
    return res.status(400).json({ success: false, error: 'Missing gameId or action type' });
  }

  try {
    // Validate required fields before acquiring the lock.
    if (
      (body.type === 'placeBid' && (!body.playerId || body.amount === undefined)) ||
      (body.type === 'passBid' && !body.playerId) ||
      (body.type === 'selectPowerhouse' && !body.suit) ||
      (body.type === 'selectPartners' && !body.cards) ||
      (body.type === 'playCard' && (!body.playerId || !body.card))
    ) {
      return res.status(400).json({ success: false, error: 'Missing required action fields' });
    }

    // atomicUpdate holds the per-game mutex for the entire read → apply → write
    // cycle, so two simultaneous requests for the same game are serialised.
    let actionError: string | null = null;

    const saved = await atomicUpdate(body.gameId, (state) => {
      let result: ActionResult;

      switch (body.type) {
        case 'startBidding':    result = applyStartBidding(state); break;
        case 'placeBid':        result = applyPlaceBid(state, body.playerId!, body.amount!); break;
        case 'passBid':         result = applyPassBid(state, body.playerId!); break;
        case 'selectPowerhouse': result = applySelectPowerhouse(state, body.suit!); break;
        case 'selectPartners':  result = applySelectPartners(state, body.cards!); break;
        case 'startPlaying':    result = applyStartPlaying(state); break;
        case 'playCard':        result = applyPlayCard(state, body.playerId!, body.card!); break;
        default:
          throw new Error('Unknown action type');
      }

      if ('error' in result) {
        actionError = result.error;
        // Return current state unchanged so nothing is written; we'll surface
        // the error below.  Throwing here would cause atomicUpdate to propagate
        // the error as an unhandled rejection – we only want a 422 response.
        return state;
      }

      return result.state;
    }).catch((err: unknown) => {
      if (err instanceof Error && err.message.includes('not found')) {
        return null;
      }
      throw err;
    });

    if (saved === null) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    if (actionError) {
      return res.status(422).json({ success: false, error: actionError });
    }

    return res.status(200).json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Action failed'
    });
  }
}
