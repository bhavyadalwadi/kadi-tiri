import React from 'react';
import Modal from '@/components/ui/Modal';
import { GameState } from '@/types/game';

interface GameFinishedModalProps {
  gameState: GameState;
  isOpen: boolean;
  onNewGame: () => void;
  onPlayAgain: () => void;
}

const GameFinishedModal: React.FC<GameFinishedModalProps> = ({
  gameState,
  isOpen,
  onNewGame,
  onPlayAgain
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing by clicking outside
      title="🎉 Game Finished!"
      size="lg"
      preventClose={true} // User must choose an action
    >
      <div className="text-center" data-testid="game-finished-modal">
        {/* Team Composition */}
        {gameState.settings.partnership && (
          <div className="mb-4">
            <h3 className="h6 fw-semibold mb-3 text-dark">Team Composition</h3>
            <div className="row g-3">
              <div className="col-6">
                <div className="bg-primary bg-opacity-10 p-3 rounded border border-primary border-opacity-25">
                  <div className="fw-bold text-primary mb-2">🎯 Bid Winner Team</div>
                  <div className="small text-dark">
                    {/* Bid Winner */}
                    <div className="mb-1">
                      <span className="fw-semibold">
                        {gameState.players.find(p => p.id === gameState.settings.partnership?.bidWinner)?.name}
                      </span>
                      <span className="badge bg-primary ms-1">Bid Winner</span>
                    </div>
                    {/* Partners */}
                    {gameState.settings.partnership.partners.map(partnerId => (
                      <div key={partnerId} className="mb-1">
                        <span className="fw-semibold">
                          {gameState.players.find(p => p.id === partnerId)?.name}
                        </span>
                        <span className="badge bg-info ms-1">Partner</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-success bg-opacity-10 p-3 rounded border border-success border-opacity-25">
                  <div className="fw-bold text-success mb-2">🛡️ Opposing Team</div>
                  <div className="small text-dark">
                    {gameState.players
                      .filter(player => 
                        player.id !== gameState.settings.partnership?.bidWinner &&
                        !gameState.settings.partnership?.partners.includes(player.id)
                      )
                      .map(player => (
                        <div key={player.id} className="mb-1">
                          <span className="fw-semibold">{player.name}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Scores Section */}
        <div className="mb-4">
          <h3 className="h5 fw-semibold mb-3 text-dark">Round Result</h3>
          
          {/* Bid Information */}
          <div className="alert alert-info mb-3">
            <div className="text-center">
              <div className="fw-bold">Bid Amount: {gameState.bidding.currentBid} points</div>
              <div className="small">
                Bid Winner Team needed {gameState.bidding.currentBid} points to win
              </div>
            </div>
          </div>

          <div className="bg-light rounded p-3 mb-4">
            <div className="row g-3">
              <div className="col-6">
                <div className="text-center p-3 bg-white rounded shadow-sm">
                  <div className="small text-muted mb-1">
                    Bid Winner Team
                    {gameState.settings.partnership && (
                      <div className="text-muted small">
                        (Combined: {gameState.players.find(p => p.id === gameState.settings.partnership?.bidWinner)?.name}
                        {gameState.settings.partnership.partners.length > 0 && 
                          ` + ${gameState.settings.partnership.partners.length} partner${gameState.settings.partnership.partners.length > 1 ? 's' : ''}`
                        })
                      </div>
                    )}
                  </div>
                  <div className={`h4 fw-bold mb-0 ${
                    gameState.scores.bidWinnerTeam >= gameState.bidding.currentBid 
                      ? 'text-success' 
                      : 'text-danger'
                  }`}>
                    <span data-testid="bid-winner-team-score">{gameState.scores.bidWinnerTeam}</span>
                  </div>
                  <div className="small text-muted">
                    collected points 
                    {gameState.scores.bidWinnerTeam >= gameState.bidding.currentBid 
                      ? ` (✅ Made bid!)` 
                      : ` (❌ Failed bid)`
                    }
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-3 bg-white rounded shadow-sm">
                  <div className="small text-muted mb-1">Opposing Team</div>
                  <div className="h4 fw-bold text-success mb-0">
                    <span data-testid="opposing-team-score">{gameState.scores.opposingTeam}</span>
                  </div>
                  <div className="small text-muted">collected points</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recorded Scores */}
        {gameState.scores.breakdown && (
          <div className="mb-4">
            <h4 className="h6 fw-semibold mb-3 text-dark">Recorded Scores</h4>
            <div className="row g-2">
              {gameState.players.map(player => {
                const isBidWinner = player.id === gameState.settings.partnership?.bidWinner;
                const isPartner = gameState.settings.partnership?.partners.includes(player.id);
                const isOnBidWinnerTeam = isBidWinner || isPartner;
                
                return (
                  <div key={player.id} className="col-6">
                    <div className={`p-3 rounded border ${
                      isOnBidWinnerTeam 
                        ? 'bg-primary bg-opacity-10 border-primary border-opacity-25' 
                        : 'bg-success bg-opacity-10 border-success border-opacity-25'
                    }`} data-testid="player-round-award" data-player-name={player.name}>
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div className="fw-medium text-dark small">{player.name}</div>
                        <div className="d-flex gap-1">
                          {isBidWinner && <span className="badge bg-primary">Bid Winner</span>}
                          {isPartner && <span className="badge bg-info">Partner</span>}
                        </div>
                      </div>
                      <div className="h5 fw-bold text-dark mb-0">
                        <span data-testid="player-round-award-score">{gameState.scores.breakdown?.[player.id] || 0}</span>
                      </div>
                      <div className="small text-muted">
                        round award
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Winner Announcement */}
        {gameState.winner && (
          <div className="mb-4 p-3 bg-warning bg-opacity-25 rounded border border-warning">
            <div className="d-flex align-items-center justify-content-center mb-2">
              <span className="fs-4 me-2">🏆</span>
              <h4 className="fw-bold text-warning-emphasis h6 mb-0">Winning Team</h4>
            </div>
            <p className="text-warning-emphasis fw-semibold mb-1">
              <span data-testid="winning-team-name">{gameState.winner === 'bidWinnerTeam' ? 'Bid Winner Team' : 'Opposing Team'}</span>
            </p>
            <div className="small text-warning-emphasis">
              {gameState.winner === 'bidWinnerTeam' 
                ? 'Successfully achieved their bid!' 
                : 'Defended against the bid!'}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-flex gap-2 justify-content-center mb-4">
          <button
            onClick={onNewGame}
            className="btn btn-primary px-4 py-2 fw-semibold"
          >
            🎮 New Game
          </button>
          <button
            onClick={onPlayAgain}
            className="btn btn-success px-4 py-2 fw-semibold"
          >
            🔄 Play Again
          </button>
        </div>

        {/* Game Stats */}
        <div className="pt-3 border-top">
          <div className="small text-muted">
            <div className="row g-3 text-center">
              <div className="col-6">
                <div className="fw-medium">Tricks Completed</div>
                <div className="h6 fw-bold text-dark mb-0">
                  <span data-testid="finished-tricks-count">{gameState.completedTricks.length}</span>
                </div>
              </div>
              <div className="col-6">
                <div className="fw-medium">PowerHouse Suit</div>
                <div className="h6 fw-bold text-dark mb-0">
                  {gameState.settings.powerhouseSuit || 'None'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GameFinishedModal;
