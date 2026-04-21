import React from 'react';
import { ScoreboardProps } from '@/types/ui';

const Scoreboard: React.FC<ScoreboardProps> = ({ players, currentScores }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-bold mb-4">Scoreboard</h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div key={player.id} className="flex justify-between items-center p-2 border-b">
            <span className="font-medium">{player.name}</span>
            <span className="text-lg font-bold">{currentScores[player.id] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scoreboard;