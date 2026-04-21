import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameState, Suit, Card } from '@/types/game';
import { POWERHOUSE_SUITS } from '@/types/game';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import PlayingCard from '@/components/ui/PlayingCard';

interface PartnerSelectionPanelProps {
  gameState: GameState;
  currentPlayerId: string;
}

const PartnerSelectionPanel: React.FC<PartnerSelectionPanelProps> = ({ gameState, currentPlayerId }) => {
  const { selectPowerhouse, selectPartners, startPlaying, error, setError } = useGameStore();
  const [selectedPowerhouse, setSelectedPowerhouse] = useState<Suit | null>(null);
  const [selectedPartnerCards, setSelectedPartnerCards] = useState<Card[]>([]);
  const [phase, setPhase] = useState<'powerhouse' | 'partners'>('powerhouse');
  const { playButtonClick, playWin } = useSoundEffects();

  if (gameState.status !== 'partner-selection') {
    return null;
  }

  const bidWinner = gameState.players.find(p => p.id === gameState.bidding.winner);
  const isBidWinner = gameState.bidding.winner === currentPlayerId;
  const requiredPartners = gameState.settings.difficultyConfig.partnerCount;

  // Generate all possible cards for partner selection (excluding cards in bid winner's hand)
  const getAvailablePartnerCards = (): Card[] => {
    if (!bidWinner) return [];
    
    const bidWinnerCards = bidWinner.cards.map(c => `${c.rank}${c.suit}`);
    const allCards: Card[] = [];
    
    // Generate all cards from the deck that aren't in the bid winner's hand
    const suits: Suit[] = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    suits.forEach(suit => {
      ranks.forEach(rank => {
        const cardKey = `${rank}${suit}`;
        if (!bidWinnerCards.includes(cardKey)) {
          allCards.push({
            id: `${rank}_${suit}`,
            rank: rank as any,
            suit,
            points: getCardPoints(rank, suit),
            isKaliTiri: rank === '3' && suit === '♠'
          });
        }
      });
    });
    
    return allCards;
  };

  const getCardPoints = (rank: string, suit: Suit): number => {
    if (rank === '3' && suit === '♠') return 30; // Kali Tiri
    if (['A', 'K', 'Q', 'J', '10'].includes(rank)) return 10;
    if (rank === '5') return 5;
    return 0;
  };

  const handlePowerhouseSelection = (suit: Suit) => {
    playButtonClick();
    setSelectedPowerhouse(suit);
    setPhase('partners');
  };

  const handlePartnerCardToggle = (card: Card) => {
    playButtonClick();
    setSelectedPartnerCards(prev => {
      const isSelected = prev.some(c => c.id === card.id);
      if (isSelected) {
        return prev.filter(c => c.id !== card.id);
      } else if (prev.length < requiredPartners) {
        return [...prev, card];
      }
      return prev;
    });
  };

  const handleSubmitSelections = () => {
    if (!selectedPowerhouse || selectedPartnerCards.length !== requiredPartners) {
      setError('Please select powerhouse suit and partner cards');
      return;
    }

    playWin();
    selectPowerhouse(selectedPowerhouse);
    selectPartners(selectedPartnerCards);
    
    // Automatically start playing after setup
    setTimeout(() => {
      startPlaying();
    }, 500);
  };

  const availableCards = getAvailablePartnerCards();

  return (
    <div className="card shadow-lg border-0" style={{ 
      background: 'linear-gradient(135deg, #e8f5e8, #f0f8f0)', 
      borderRadius: '15px',
      maxWidth: '600px', // Increased width to accommodate all buttons
      margin: '0 auto'
    }}>
      <div className="card-body p-4">
        {/* Header */}
        <div className="text-center mb-3">
          <h4 className="card-title fw-bold text-dark mb-1">
            🏆 Bidding Winner Setup
          </h4>
          <p className="text-muted small mb-0">
            {isBidWinner ? 'Choose your powerhouse and partners' : `${bidWinner?.name || 'Bid winner'} is setting up the game`}
          </p>
        </div>

        {/* Winner Info */}
        <div className="alert alert-success border-0 mb-3">
          <div className="text-center">
            <div className="fw-bold">🎯 Auction Winner: {bidWinner?.name}</div>
            <div className="small">Winning Bid: {gameState.bidding.currentBid} points</div>
          </div>
        </div>

        {isBidWinner ? (
          <>
            {phase === 'powerhouse' && (
              <div>
                <h5 className="text-center mb-3" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  Choose Powerhouse Suit
                </h5>
                <div 
                  className="d-flex gap-2 mb-3"
                  style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    marginBottom: '1rem',
                    width: '100%'
                  }}
                >
                  {POWERHOUSE_SUITS.map((suit) => {
                    // Color coding: black for spades/clubs, red for hearts/diamonds
                    const isBlackSuit = suit === '♠' || suit === '♣';
                    const suitColor = isBlackSuit ? '#000000' : '#dc3545';
                    
                    return (
                      <button
                        key={suit}
                        onClick={() => handlePowerhouseSelection(suit)}
                        className={`btn flex-fill py-2 py-sm-3 ${
                          selectedPowerhouse === suit ? 'btn-success' : 'btn-outline-primary'
                        }`}
                        style={{ 
                          borderRadius: '10px', 
                          fontSize: 'clamp(1.2rem, 4vw, 2rem)', // Responsive font size
                          color: selectedPowerhouse === suit ? 'white' : suitColor,
                          borderColor: selectedPowerhouse === suit ? undefined : suitColor,
                          minHeight: '50px', // Ensure minimum height
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flex: '1 1 auto', // Backup for flex-fill
                          width: '25%' // Fallback for equal distribution
                        }}
                      >
                        {suit}
                      </button>
                    );
                  })}
                </div>
                <div className="text-center text-muted small" style={{ textAlign: 'center' }}>
                  The sir suit beats the led suit only when the player is void in the lead suit
                </div>
              </div>
            )}

            {phase === 'partners' && selectedPowerhouse && (
              <div>
                <div className="alert alert-info border-0 mb-3">
                  <div className="text-center">
                    <div className="fw-bold">Powerhouse: {selectedPowerhouse}</div>
                    <div className="small">
                      Select {requiredPartners} partner card{requiredPartners > 1 ? 's' : ''} 
                      ({selectedPartnerCards.length}/{requiredPartners})
                    </div>
                  </div>
                </div>

                <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <div className="row g-1">
                    {availableCards.map((card) => {
                      const isSelected = selectedPartnerCards.some(c => c.id === card.id);
                      return (
                        <div key={card.id} className="col-3">
                          <div 
                            onClick={() => handlePartnerCardToggle(card)}
                            className={`position-relative ${
                              isSelected ? 'border border-success border-2 rounded' : ''
                            }`}
                            style={{ cursor: 'pointer' }}
                          >
                            <PlayingCard 
                              card={card}
                              size="small"
                            />
                            {isSelected && (
                              <div className="position-absolute top-0 end-0 bg-success text-white rounded-circle" 
                                   style={{ width: '20px', height: '20px', transform: 'translate(50%, -50%)' }}>
                                <div className="d-flex align-items-center justify-content-center h-100">
                                  <i className="fas fa-check" style={{ fontSize: '10px' }}></i>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-center text-muted small mb-3">
                  Players with these cards will be your secret partners
                </div>

                <div className="d-grid gap-2">
                  <button
                    onClick={handleSubmitSelections}
                    disabled={selectedPartnerCards.length !== requiredPartners}
                    className="btn btn-success btn-lg fw-semibold"
                    style={{ borderRadius: '10px' }}
                  >
                    🚀 Start Game
                  </button>
                  <button
                    onClick={() => setPhase('powerhouse')}
                    className="btn btn-outline-secondary"
                    style={{ borderRadius: '10px' }}
                  >
                    ← Back to Powerhouse Selection
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">
              Waiting for {bidWinner?.name} to choose powerhouse and partners...
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger border-0 mt-3 mb-0" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerSelectionPanel;
