import React from 'react';
import { useGameStore } from '@/store/gameStore';
import GameTable from './GameTable';
import Scoreboard from './Scoreboard';

const GameBoard: React.FC = () => {
  const { gameState } = useGameStore();

  if (!gameState) return null;

  return (
    <div className="space-y-6">
      <Scoreboard players={gameState.players} currentScores={gameState.scores.breakdown} />
      <GameTable gameState={gameState} currentPlayerId={gameState.currentPlayer} />
    </div>
  );
};

export default GameBoard;