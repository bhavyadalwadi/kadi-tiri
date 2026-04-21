import React, { useState, useEffect } from 'react';
import { GameTableProps } from '@/types/ui';
import BiddingPanel from './BiddingPanel';
import PlayerHand from './PlayerHand';
import DealingAnimation from './DealingAnimation';
import PlayingCard from '@/components/ui/PlayingCard';

const GameTable: React.FC<GameTableProps> = ({ gameState, currentPlayerId, onCardPlay, onPlayerAction }) => {
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const [showDealAnimation, setShowDealAnimation] = useState(false);
  const [showCardAnimation, setShowCardAnimation] = useState(false);

  // Trigger dealing animation when game enters dealing state
  useEffect(() => {
    if (gameState.status === 'dealing') {
      setShowDealAnimation(true);
      
      // Show card animations after dealing animation
      setTimeout(() => {
        setShowDealAnimation(false);
        setShowCardAnimation(true);
        
        // Turn off card animations after they complete
        setTimeout(() => {
          setShowCardAnimation(false);
        }, 3000); // Allow time for all cards to animate in
      }, 2000); // Show dealing animation for 2 seconds
    } else {
      setShowDealAnimation(false);
      setShowCardAnimation(false);
    }
  }, [gameState.status]);

  const totalCardsDealt = gameState.players.reduce((sum, player) => sum + player.cards.length, 0);
  
  return (
    <div className="space-y-4">
      {/* Dealing Animation Overlay */}
      <DealingAnimation 
        isActive={showDealAnimation}
        totalCards={totalCardsDealt}
        gameState={gameState}
        onComplete={() => setShowDealAnimation(false)}
      />

      {/* Bidding Panel - Show during bidding phase */}
      {gameState.status === 'bidding' && (
        <BiddingPanel gameState={gameState} currentPlayerId={currentPlayerId} />
      )}
      
      {/* Player's Hand - Show during dealing and bidding phases */}
      {(gameState.status === 'dealing' || gameState.status === 'bidding') && currentPlayer && currentPlayer.cards.length > 0 && (
        <div className="mb-4">
          <PlayerHand 
            cards={currentPlayer.cards} 
            playerName={currentPlayer.name}
            isCurrentPlayer={true}
            layout="fan"
            showDealAnimation={showCardAnimation}
          />
        </div>
      )}
      
      {/* Other Players' Card Counts - Show during dealing and bidding */}
      {(gameState.status === 'dealing' || gameState.status === 'bidding') && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {gameState.players
            .filter(p => p.id !== currentPlayerId)
            .map((player, playerIndex) => (
              <div key={player.id} className="bg-gray-100 p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">{player.name}</h4>
                  {player.isDealer && (
                    <span className="text-xs text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded">Opener</span>
                  )}
                </div>
                
                {/* Show card backs for other players */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {player.cards.slice(0, Math.min(5, player.cards.length)).map((card, cardIndex) => (
                    <div key={`${player.id}-${cardIndex}`} className="transform scale-75">
                      <PlayingCard 
                        card={card}
                        size="small"
                        isHidden={true}
                        showDealAnimation={showCardAnimation}
                        animationDelay={(playerIndex * 300) + (cardIndex * 100)}
                      />
                    </div>
                  ))}
                  {player.cards.length > 5 && (
                    <div className="flex items-center text-xs text-gray-500 ml-2">
                      +{player.cards.length - 5} more
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600">{player.cards.length} cards total</p>
              </div>
            ))
          }
        </div>
      )}
      
      <div className="game-table bg-green-800 rounded-xl p-6 min-h-96 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Game Table</h2>
          <p className="mb-2">Game Status: {gameState.status}</p>
          <p className="mb-2">Current Player: {gameState.players.find(p => p.id === gameState.currentPlayer)?.name || 'Unknown'}</p>
          <p className="mb-4">Players: {gameState.players.length}</p>
          
          {gameState.status === 'setup' && (
            <div className="bg-blue-600 text-white px-4 py-2 rounded">
              Game is being set up...
            </div>
          )}
          
          {gameState.status === 'dealing' && (
            <div className="bg-purple-600 text-white px-4 py-2 rounded">
              Cards have been dealt! Check your hand above.
            </div>
          )}
          
          {gameState.status === 'bidding' && (
            <div className="bg-yellow-600 text-white px-4 py-2 rounded">
              Bidding Phase - Current bid: {gameState.bidding.currentBid}
            </div>
          )}
          
          {gameState.status === 'playing' && (
            <div className="bg-green-600 text-white px-4 py-2 rounded">
              Game in Progress - Round {gameState.currentRound + 1}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameTable;
