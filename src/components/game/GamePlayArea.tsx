import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Player, GameState } from '@/types/game';
import PlayingCard from '@/components/ui/PlayingCard';
import DealingAnimation from '@/components/game/DealingAnimation';
import GameUIContainers from '@/components/game/GameUIContainers';
import { canPlayCard } from '@/utils/gameUtils';

interface GamePlayAreaProps {
  gameState: GameState;
  currentPlayerId: string;
  viewingPlayerId?: string; // Optional external control
  onViewingPlayerChange?: (playerId: string) => void; // Optional callback
}

const GamePlayArea: React.FC<GamePlayAreaProps> = ({ 
  gameState, 
  currentPlayerId, 
  viewingPlayerId: externalViewingPlayerId,
  onViewingPlayerChange: externalOnViewingPlayerChange 
}) => {
  const [showDealAnimation, setShowDealAnimation] = useState(false);
  const [showCardAnimation, setShowCardAnimation] = useState(false);
  const [internalViewingPlayerId, setInternalViewingPlayerId] = useState(currentPlayerId);
  const { playCard } = useGameStore();

  // Use external viewing player if provided, otherwise use internal state
  const viewingPlayerId = externalViewingPlayerId || internalViewingPlayerId;
  const setViewingPlayerId = externalOnViewingPlayerChange || setInternalViewingPlayerId;

  // Initialize internal viewing player when external control is not provided
  useEffect(() => {
    if (!externalViewingPlayerId && internalViewingPlayerId !== currentPlayerId) {
      setInternalViewingPlayerId(currentPlayerId);
    }
  }, [currentPlayerId, externalViewingPlayerId, internalViewingPlayerId]);

  // Handle dealing animations
  useEffect(() => {
    if (gameState.status === 'dealing') {
      setShowDealAnimation(true);
      setTimeout(() => {
        setShowDealAnimation(false);
        setShowCardAnimation(true);
        setTimeout(() => {
          setShowCardAnimation(false);
        }, 3000);
      }, 2000);
    } else {
      setShowDealAnimation(false);
      setShowCardAnimation(false);
    }
  }, [gameState.status]);

  return (
    <div className="position-relative w-100" style={{ 
      height: '100vh', 
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e5128, #2d5016, #1e5128)'
    }}>
      
      {/* Game UI Containers */}
      <GameUIContainers 
        gameState={gameState}
        currentPlayerId={currentPlayerId}
        viewingPlayerId={viewingPlayerId}
        onViewingPlayerChange={setViewingPlayerId}
      />

      {/* Dealing Animation Overlay */}
      <DealingAnimation 
        isActive={showDealAnimation}
        totalCards={gameState.players.reduce((sum, player) => sum + player.cards.length, 0)}
        gameState={gameState}
        onComplete={() => setShowDealAnimation(false)}
      />

      {/* Game Table Surface */}
      <div className="position-absolute w-100 h-100" style={{ zIndex: -1 }}>
        {/* Center table circle with current trick display */}
        <div className="position-absolute top-50 start-50 translate-middle rounded-circle border border-warning bg-success shadow-lg d-flex align-items-center justify-content-center" 
             style={{ width: '200px', height: '200px', borderWidth: '2px' }}>
          
          {/* Current Trick Display */}
          {gameState.currentTrick && gameState.currentTrick.cards.length > 0 ? (
            <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center">
              {/* Played cards in trick */}
              {gameState.currentTrick.cards.map((playedCard, index) => {
                const angle = (index * 90) - 45;
                const radius = 60;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                
                return (
                  <div
                    key={`${playedCard.playerId}-${playedCard.card.id}`}
                    className="position-absolute"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                      width: '50px',
                      height: '70px',
                      zIndex: 10 + index
                    }}
                  >
                    <PlayingCard 
                      card={playedCard.card}
                      size="small"
                      isPlayable={false}
                    />
                    <div className="position-absolute top-100 start-50 translate-middle-x mt-1">
                      <div className="bg-dark bg-opacity-75 text-white px-1 rounded" style={{ fontSize: '8px' }}>
                        {playedCard.playerName}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Trick info in center */}
              <div className="text-center text-warning position-absolute top-50 start-50 translate-middle">
                <div className="small fw-bold">
                  Trick {gameState.completedTricks.length + 1}
                </div>
                <div className="small" style={{ fontSize: '10px' }}>
                  Lead: {gameState.currentTrick.leadSuit}
                </div>
                {gameState.currentTrick.cards.length === gameState.players.length && (
                  <div className="small text-success" style={{ fontSize: '10px' }}>
                    Complete!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-warning">
              <div className="fs-6 fw-bold mb-1">KT</div>
              <div className="small" style={{ opacity: 0.8 }}>
                {gameState.status === 'bidding' && `Bid: ${gameState.bidding.currentBid}`}
                {gameState.status === 'dealing' && 'Dealing...'}
                {gameState.status === 'setup' && 'Setup'}
                {gameState.status === 'partner-selection' && `Winner: ${gameState.players.find(p => p.id === gameState.bidding.winner)?.name || 'Unknown'}`}
                {gameState.status === 'playing' && `R${gameState.currentRound + 1}`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Players Layout - Show ALL players during playing phase */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x w-100" style={{ maxWidth: '1400px', paddingBottom: '1rem' }}>
        <div className="row g-2 px-2">
          {gameState.players.map((player, index) => {
            const isViewingPlayer = player.id === viewingPlayerId;
            const isCurrentTurnPlayer = player.id === gameState.currentPlayer;
            
            // Show viewing player if external control is provided (testing mode)
            // Otherwise show only current turn player (normal game mode)
            const shouldShowPlayer = externalViewingPlayerId ? isViewingPlayer : isCurrentTurnPlayer;
            
            if (!shouldShowPlayer) {
              return null;
            }
            
            return (
              <div key={player.id} className="col-12">  {/* Always full width since only current player is shown */}
                <div className={`p-2 rounded border ${
                  isViewingPlayer 
                    ? 'bg-primary text-white border-primary' 
                    : isCurrentTurnPlayer 
                    ? 'bg-warning text-dark border-warning' 
                    : 'bg-dark text-white border-secondary'
                }`} style={{ 
                  transition: 'all 0.3s ease',
                  animation: isCurrentTurnPlayer ? 'pulse 2s infinite' : 'none',
                  borderWidth: '2px',
                  backgroundColor: isViewingPlayer ? 'rgba(13, 110, 253, 0.25)' : 
                                  isCurrentTurnPlayer ? 'rgba(255, 193, 7, 0.25)' : 
                                  'rgba(33, 37, 41, 0.5)',
                  fontSize: '12px'
                }}>
                  
                  {/* Player container with horizontal layout */}
                  <div className="d-flex align-items-center" style={{ minHeight: '60px' }}>
                    
                    {/* Player info on the left */}
                    <div className="flex-shrink-0 me-3" style={{ minWidth: '80px', maxWidth: '120px' }}>
                      <div className="text-white small fw-medium text-start" style={{ lineHeight: '1.2' }}>
                        {player.name}
                      </div>
                      <div className="text-white-50 small text-start mb-1" style={{ lineHeight: '1.2' }}>
                        {player.cards.length} cards
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {player.isDealer && <span className="bg-primary text-white badge" style={{ fontSize: '8px' }}>Opener</span>}
                        {isViewingPlayer && <span className="bg-success text-white badge" style={{ fontSize: '8px' }}>You</span>}
                        {isCurrentTurnPlayer && <span className="bg-warning text-dark badge" style={{ fontSize: '8px' }}>Turn</span>}
                      </div>
                    </div>

                    {/* Player cards on the right */}
                    <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ overflowX: 'auto' }}>
                      {/* Show current player's cards (always face-up since only current player is visible) */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        flexWrap: 'nowrap', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        width: '100%'
                      }}>
                        {player.cards.length === 0 ? (
                          <div className="text-white small">No cards left</div>
                        ) : (
                          player.cards.map((card, cardIndex) => (
                            <div key={card.id} style={{ 
                              width: '85px', 
                              flexShrink: 0,
                              flexGrow: 0,
                              display: 'flex',
                              justifyContent: 'center'
                            }}>
                              <PlayingCard 
                                card={card}
                                size="small"
                                isPlayable={gameState.status === 'playing' && canPlayCard(card, gameState, player.id, gameState.currentTrick?.leadSuit)}
                                onClick={gameState.status === 'playing' ? 
                                  () => playCard(player.id, card) : undefined
                                }
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GamePlayArea;
