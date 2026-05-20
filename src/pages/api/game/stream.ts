import type { NextApiRequest, NextApiResponse } from 'next';
import { createGameEvent, subscribeToGameEvents } from '@/lib/server/gameEvents';
import { getGame } from '@/lib/server/gameStorage';

type StreamingResponse = NextApiResponse & {
  flush?: () => void;
};

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const stream = res as StreamingResponse;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const gameId = req.query.gameId;
  if (typeof gameId !== 'string' || !gameId) {
    return res.status(400).json({ success: false, error: 'Missing gameId' });
  }

  const gameState = await getGame(gameId);
  if (!gameState) {
    return res.status(404).json({ success: false, error: 'Game not found' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive'
  });
  res.flushHeaders?.();
  res.socket?.setNoDelay(true);

  const send = (payload: ReturnType<typeof createGameEvent>) => {
    res.write(`id: ${payload.id}\n`);
    res.write(`event: gameEvent\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    stream.flush?.();
  };

  send(createGameEvent('snapshot', gameState));
  const heartbeat = setInterval(() => {
    res.write(`event: ping\ndata: ${Date.now()}\n\n`);
    stream.flush?.();
  }, 15000);
  const unsubscribe = subscribeToGameEvents(gameId, send);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });
}
