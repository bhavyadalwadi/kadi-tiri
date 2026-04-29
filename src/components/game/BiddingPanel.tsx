import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameState } from '@/types/game';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface BiddingPanelProps {
  gameState: GameState;
  currentPlayerId: string;
  onExit?: () => void; // Optional exit handler
  viewingPlayerId?: string; // Optional viewing player control
  onViewingPlayerChange?: (playerId: string) => void; // Optional callback for viewing player change
}

const BiddingPanel: React.FC<BiddingPanelProps> = ({ 
  gameState, 
  currentPlayerId, 
  onExit,
  viewingPlayerId: _viewingPlayerId,
  onViewingPlayerChange: _onViewingPlayerChange 
}) => {
  const { placeBid, passBid, error, setError } = useGameStore();
  const [showBidInput, setShowBidInput] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState<string | null>(null);
  const { playButtonClick, playError, playWin } = useSoundEffects();

  // Add inline styles for red custom class
  const textRedCustom = { color: '#dc2626' };

  if (gameState.status !== 'bidding' || !gameState.bidding?.isActive) {
    return null;
  }

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
  const isCurrentPlayerTurn = gameState.currentPlayer === currentPlayerId;
  const currentBid = gameState.bidding.currentBid;
  const increments = gameState.settings.biddingConfig.increments;
  const minRaise = Math.min(...increments);
  const minBid = currentBid + minRaise;
  
  // Check if any actual bids have been placed (not just passes)
  const hasAnyBids = gameState.bidding.bids.some(bid => !bid.passed && bid.amount > 0);
  const canPass = hasAnyBids; // Can only pass if someone has already placed a bid

  const handlePass = () => {
    if (!canPass) {
      setBidError('Cannot pass - someone must place the first bid!');
      return;
    }
    
    playButtonClick();
    passBid(gameState.currentPlayer);
    setShowBidInput(false);
    setBidAmount('');
    setBidError(null);
    setError(null);
  };

  const handleBidMore = () => {
    playButtonClick();
    setShowBidInput(true);
    setBidAmount(minBid.toString());
    setBidError(null);
    setError(null);
  };

  const handleQuickRaise = (raiseAmount: number) => {
    playWin();
    placeBid(gameState.currentPlayer, currentBid + raiseAmount);
    setShowBidInput(false);
    setBidAmount('');
    setBidError(null);
  };

  const handleSubmitBid = () => {
    const bid = parseInt(bidAmount);
    
    // Validation
    if (isNaN(bid)) {
      setBidError('Please enter a valid number');
      return;
    }

    if (bid <= currentBid) {
      setBidError(`Bid must be higher than current bid of ${currentBid}`);
      return;
    }

    if (bid < minBid) {
      setBidError(`Minimum bid is ${minBid}`);
      return;
    }

    const raiseAmount = bid - currentBid;
    if (!increments.includes(raiseAmount)) {
      setBidError(`Bid must increase by ${increments.join(' or ')}`);
      return;
    }

    if (bid > gameState.settings.biddingConfig.maxBid) {
      setBidError(`Maximum bid is ${gameState.settings.biddingConfig.maxBid}`);
      playError();
      return;
    }

    playWin(); // Play success sound for successful bid
    placeBid(gameState.currentPlayer, bid);
    setShowBidInput(false);
    setBidAmount('');
    setBidError(null);
  };

  const handleCancelBid = () => {
    playButtonClick();
    setShowBidInput(false);
    setBidAmount('');
    setBidError(null);
    setError(null);
  };

  const handleBidInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBidAmount(e.target.value);
    if (bidError) setBidError(null);
    if (error) setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitBid();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelBid();
    }
  };

  return (
    <div className="rounded-4 shadow-lg border-0" style={{ 
      background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(0, 0, 0, 0.8))', 
      border: '1px solid rgba(220, 38, 38, 0.3)',
      backdropFilter: 'blur(15px)',
      maxWidth: '350px',
      margin: '0 auto'
    }}>
      <div className="p-4">
        {/* Header */}
        <div className="text-center mb-3">
          <h4 className="fw-bold text-white mb-1">
            🎯 Bidding Round
          </h4>
          <p className="text-light small mb-0">Place your bid to win the powerhouse</p>
        </div>

        {/* Current Bid Info */}
        <div className="row text-center mb-3">
          <div className="col-6">
            <div className="rounded-3 p-2" style={{ 
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(69, 10, 10, 0.2))',
              border: '1px solid rgba(220, 38, 38, 0.3)'
            }}>
              <div className="small text-light">Current Bid</div>
              <div className="h5 fw-bold mb-0" style={textRedCustom}>
                {hasAnyBids ? currentBid : 'No bids yet'}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="rounded-3 p-2" style={{ 
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(69, 10, 10, 0.2))',
              border: '1px solid rgba(220, 38, 38, 0.3)'
            }}>
              <div className="small text-light">Minimum Bid</div>
              <div className="h5 fw-bold text-warning mb-0">{minBid}</div>
            </div>
          </div>
        </div>

        {/* Current Turn Indicator */}
        <div className="text-center mb-3">
          <div className="rounded-pill px-3 py-2" style={{ 
            background: 'linear-gradient(45deg, #dc2626, #b91c1c)',
            color: 'white'
          }}>
            <span className="me-1">👤</span>
            Turn: {currentPlayer?.name || 'Unknown'}
          </div>
          <div className="small text-light mt-2">
            High bidder: {gameState.bidding.winner
              ? gameState.players.find(p => p.id === gameState.bidding.winner)?.name
              : 'None yet'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="rounded-3 p-3 mb-3" style={{ 
          background: 'rgba(0, 0, 0, 0.3)', 
          border: '1px solid rgba(220, 38, 38, 0.3)' 
        }}>
          {isCurrentPlayerTurn ? (
            !showBidInput ? (
              <div>
                <div className={`rounded-3 text-center py-2 mb-3 ${hasAnyBids ? 'bg-success bg-opacity-25' : 'bg-warning bg-opacity-25'}`} style={{
                  border: hasAnyBids ? '1px solid rgba(40, 167, 69, 0.3)' : '1px solid rgba(255, 193, 7, 0.3)'
                }}>
                  <strong className="text-white">{hasAnyBids ? '🎉 Your Turn!' : '🎯 First Bid Required!'}</strong>
                  <br />
                  <small className="text-light">{hasAnyBids ? 'Choose +5, +10, custom, or pass' : 'Opening player must place the first bid'}</small>
                </div>
                <div className="d-grid gap-2">
                  <div className="d-flex gap-2">
                    {increments.map((increment) => (
                      <button
                        key={increment}
                        onClick={() => handleQuickRaise(increment)}
                        className="btn btn-outline-warning fw-semibold rounded-3 flex-fill"
                        data-testid={`quick-raise-${increment}`}
                      >
                        +{increment}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleBidMore}
                    className="btn btn-lg fw-semibold rounded-3"
                    data-testid="bid-more-button"
                    style={{ 
                      background: 'linear-gradient(45deg, #dc2626, #b91c1c)',
                      border: 'none',
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    💰 Place Bid
                  </button>
                  <button
                    onClick={handlePass}
                    className="btn btn-outline-light fw-semibold rounded-3"
                    data-testid="pass-bid-button"
                    disabled={!canPass}
                    title={!canPass ? 'Cannot pass - someone must place the first bid!' : 'Pass your turn'}
                    style={{ 
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🚫 Pass {!canPass && '(Disabled)'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-white">
                    💵 Enter Your Bid
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={handleBidInputChange}
                      onKeyPress={handleKeyPress}
                      min={minBid}
                      max={gameState.settings.biddingConfig.maxBid}
                      step={minRaise}
                      className={`form-control form-control-lg text-center fw-bold text-white ${
                        bidError ? 'is-invalid' : ''
                      }`}
                      placeholder={`Minimum: ${minBid}`}
                      autoFocus
                      style={{ 
                        borderRadius: '10px 0 0 10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
                        borderColor: bidError ? '#dc3545' : 'rgba(220, 38, 38, 0.5)',
                        color: 'white'
                      }}
                    />
                    <button
                      onClick={handleSubmitBid}
                      disabled={!bidAmount || isNaN(parseInt(bidAmount))}
                      className="btn btn-lg px-4"
                      style={{ 
                        borderRadius: '0 10px 10px 0',
                        background: 'linear-gradient(45deg, #198754, #146c43)',
                        border: 'none',
                        color: 'white'
                      }}
                    >
                      ✅
                    </button>
                  </div>
                  {bidError && (
                    <div className="text-danger mt-2 small">
                      <span className="me-1">⚠️</span>
                      {bidError}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleCancelBid}
                  className="btn btn-outline-light w-100 rounded-3"
                >
                  ↩️ Cancel
                </button>
              </div>
            )
          ) : (
            <div className="text-center py-4">
              <div className="rounded-3 p-3" style={{ 
                background: 'rgba(108, 117, 125, 0.2)', 
                border: '1px solid rgba(108, 117, 125, 0.3)' 
              }}>
                <div className="text-muted mb-2">⏳ Waiting for your turn</div>
                <div className="small text-light">
                  It's <strong>{currentPlayer?.name}</strong>'s turn to bid
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-3 mt-3 mb-0 p-3" style={{ 
            background: 'rgba(220, 53, 69, 0.2)', 
            border: '1px solid rgba(220, 53, 69, 0.3)',
            color: '#fff' 
          }}>
            <span className="me-2">⚠️</span>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Exit Button - Only show if onExit handler is provided */}
        {onExit && (
          <div className="mt-3 pt-3 border-top border-secondary">
            <button
              onClick={onExit}
              className="btn btn-sm w-100 shadow-sm"
              style={{ 
                background: 'linear-gradient(45deg, #dc2626, #b91c1c)',
                border: 'none',
                color: 'white',
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🚪 Exit Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiddingPanel;
