import React from 'react';
import { GameState } from '@/types/game';

interface TopGameControlsProps {
  gameState: GameState;
  onExit: () => void;
}

const TopGameControls: React.FC<TopGameControlsProps> = ({ gameState, onExit }) => {
  const showScores = gameState.status === 'playing' || gameState.status === 'finished';
  const isBidding = gameState.status === 'bidding';

  return (
    <div 
      className="bg-dark bg-opacity-75 text-white p-2 rounded small d-flex justify-content-between align-items-center"
      style={{
        width: showScores ? '350px' : '80px', // Even smaller width during bidding since no extra content
        backdropFilter: 'blur(10px)',   
        border: '1px solid rgba(220, 38, 38, 0.3)',
        minHeight: '60px',
        transition: 'width 0.3s ease' // Smooth transition when switching between states
      }}
    >
      {/* Scores Section - Only show during gameplay */}
      {showScores && (
        <div className="flex-grow-1 me-2">
          <div className="fw-medium mb-1 d-flex align-items-center">
            <span className="me-1">📊</span>
            <span style={{ fontSize: '12px' }}>Scores</span>
          </div>
          <div className="row g-0">
            <div className="col-6">
              <div className="d-flex justify-content-between small">
                <span>Bid:</span>
                <span className="fw-bold text-warning">{gameState.scores.bidWinnerTeam}</span>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex justify-content-between small ps-2">
                <span>Other:</span>
                <span className="fw-bold text-info">{gameState.scores.opposingTeam}</span>
              </div>
            </div>
          </div>
          
          {/* Recent Tricks - Ultra Compact Version */}
          {gameState.completedTricks.length > 0 && (
            <div className="mt-1 pt-1 border-top border-secondary">
              <div className="d-flex justify-content-between" style={{ fontSize: '9px' }}>
                <span className="text-light">Last:</span>
                <span className="text-success">
                  {gameState.players.find(p => p.id === gameState.completedTricks[gameState.completedTricks.length - 1]?.winner)?.name?.slice(0, 4) || 'N/A'} 
                  <span className="text-warning ms-1">({gameState.completedTricks[gameState.completedTricks.length - 1]?.points}pts)</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Exit Button - Always visible, centered during bidding */}
      <button
        onClick={onExit}
        className={`btn btn-sm shadow-sm ${isBidding ? 'mx-auto' : ''}`}
        style={{ 
          background: 'linear-gradient(45deg, #dc2626, #b91c1c)',
          border: 'none',
          color: 'white',
          padding: '6px 10px',
          fontSize: '11px',
          borderRadius: '6px',
          transition: 'all 0.3s ease',
          flexShrink: 0,
          height: 'fit-content'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        🚪 Exit
      </button>
    </div>
  );
};

export default TopGameControls;
