import React from 'react';
import { GameState } from '@/types/game';

interface GameUIContainersProps {
  gameState: GameState;
  currentPlayerId: string;
  viewingPlayerId: string;
  onViewingPlayerChange: (playerId: string) => void;
  showDebugTools?: boolean;
}

const GameUIContainers: React.FC<GameUIContainersProps> = ({ 
  gameState, 
  currentPlayerId, 
  viewingPlayerId, 
  onViewingPlayerChange,
  showDebugTools = false
}) => {
  const statusTop = showDebugTools ? '330px' : '177px';

  return (
    <>
      {/* 1. Game Info Container (Enhanced) - Combines Game ID and Game Info */}
      <div className="position-absolute start-0 ms-2 z-3" style={{ top: '20px', width: '240px' }}>
        <div className="rounded-3 text-white px-3 py-2 shadow-lg" style={{
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(0, 0, 0, 0.8))',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          backdropFilter: 'blur(10px)',
          minHeight: '110px'
        }}>
          <div className="d-flex align-items-center mb-1">
            <span className="me-2 fs-6">🎮</span>
            <strong className="text-white small">Game Info</strong>
          </div>
          <div className="mb-1">
            Game ID: <span className="font-monospace fw-bold small" style={{ color: '#dc2626' }}>
              {gameState.id.slice(-6)}
            </span>
          </div>
          <div className="small text-light mb-1">Players: {gameState.players.length}/{gameState.settings.mode.players}</div>
          <div className="small text-light mb-2">
            You are: <span data-testid="current-user-name">{gameState.players.find(p => p.id === currentPlayerId)?.name}</span>
          </div>
          <button 
            className="btn btn-sm fw-bold w-100"
            style={{ 
              background: 'linear-gradient(45deg, #dc2626, #b91c1c)',
              border: 'none',
              color: 'white',
              fontSize: '10px',
              padding: '4px 8px'
            }}
            onClick={() => {
              const gameUrl = `${window.location.origin}/game?join=${gameState.id}`;
              navigator.clipboard.writeText(gameUrl);
              alert('Game URL copied! Share with other players.');
            }}
          >
            📋 Copy Join Link
          </button>
        </div>
      </div>

      {showDebugTools && (
        <div className="position-absolute start-0 ms-2 z-3" style={{ top: '177px', width: '240px' }}>
          <div className="rounded-3 text-white px-3 py-2 shadow-lg" style={{
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(0, 0, 0, 0.8))',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            backdropFilter: 'blur(10px)',
            minHeight: '110px'
          }}>
            <div className="d-flex align-items-center mb-1">
              <span className="me-2 fs-6">🛠️</span>
              <strong className="text-white small">Debug Seat Control</strong>
            </div>
            <div className="mb-1 small text-light" style={{ fontSize: '11px' }}>
              Switch the active seat to inspect cards or act for that player
            </div>
            <div className="btn-group-vertical w-100" role="group">
              {gameState.players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => onViewingPlayerChange(player.id)}
                  className={`btn btn-sm mb-1 ${viewingPlayerId === player.id ? 'btn-danger' : 'btn-outline-light'}`}
                  style={{ 
                    fontSize: '9px', 
                    padding: '1px 6px',
                    borderColor: viewingPlayerId === player.id ? '#dc2626' : 'rgba(255, 255, 255, 0.3)',
                    background: viewingPlayerId === player.id ? 'linear-gradient(45deg, #dc2626, #b91c1c)' : 'transparent'
                  }}
                >
                  {player.name}
                  {player.id === gameState.currentPlayer && ' 🎯'}
                  {player.id === currentPlayerId && ' (You)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Game Status Container */}
      <div className="position-absolute start-0 ms-2 z-3" style={{ top: statusTop, width: '240px' }}>
        <div className="rounded-3 text-white px-3 py-2 shadow-lg" style={{
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(0, 0, 0, 0.8))',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          backdropFilter: 'blur(10px)',
          minHeight: '110px'
        }}>
          <div className="d-flex align-items-center mb-1">
            <span className="me-2 fs-6">📊</span>
            <strong className="text-white small">Game Status</strong>
          </div>
          <div className="mb-1 small">Status: <span className="fw-medium text-capitalize" style={{ color: '#dc2626' }}>{gameState.status}</span></div>
          <div className="mb-1 small">
            Turn: <span data-testid="current-turn-name">{gameState.players.find(p => p.id === gameState.currentPlayer)?.name || 'Unknown'}</span>
          </div>
          {showDebugTools && (
            <div className="mb-1 small">Active Seat: {gameState.players.find(p => p.id === viewingPlayerId)?.name || 'Unknown'}</div>
          )}
          {gameState.status === 'playing' && (
            <>
              <div className="mb-1 small">Powerhouse: <span className="text-warning fw-bold">{gameState.settings.powerhouseSuit}</span></div>
              <div className="mb-1 small">
                Tricks: <span data-testid="completed-tricks-count">{gameState.completedTricks.length}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default GameUIContainers;
