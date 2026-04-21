import React from 'react';
import { Card as CardType } from '@/types/game';
import PlayingCard from '@/components/ui/PlayingCard';

interface PlayerHandProps {
  cards: CardType[];
  playerName: string;
  isCurrentPlayer?: boolean;
  layout?: 'grid' | 'fan';
  showDealAnimation?: boolean;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ 
  cards, 
  playerName, 
  isCurrentPlayer = false, 
  layout = 'grid', 
  showDealAnimation = false 
}) => {
  return (
    <div className={`p-6 rounded-xl border-2 shadow-lg ${
      isCurrentPlayer ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
    }`}>
      <h3 className={`text-xl font-bold mb-4 ${
        isCurrentPlayer ? 'text-blue-700' : 'text-gray-700'
      }`}>
        {playerName} {isCurrentPlayer && '(You)'}
        <span className="text-base font-normal ml-2 text-gray-600">({cards.length} cards)</span>
      </h3>
      
      {layout === 'fan' ? (
        // Fan layout - cards slightly overlapping in an arc
        <div className="relative flex justify-center" style={{ height: '140px' }}>
          {cards.map((card, index) => {
            const totalCards = cards.length;
            const maxAngle = Math.min(60, totalCards * 4); // Max 60 degrees spread
            const angle = totalCards > 1 ? (index - (totalCards - 1) / 2) * (maxAngle / (totalCards - 1)) : 0;
            const xOffset = index * 15; // Horizontal spacing
            const yOffset = Math.abs(angle) * 1.5; // Slight vertical curve
            
            return (
              <div
                key={card.id}
                className="absolute transition-all duration-300 hover:z-10 hover:-translate-y-2"
                style={{
                  left: `${xOffset}px`,
                  top: `${yOffset}px`,
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: 'bottom center',
                  zIndex: index
                }}
              >
                <PlayingCard 
                  card={card}
                  size="medium"
                  isPlayable={isCurrentPlayer}
                  showDealAnimation={showDealAnimation}
                  animationDelay={index * 150} // Stagger animation by 150ms per card
                />
              </div>
            );
          })}
        </div>
      ) : (
        // Grid layout - cards in rows
        <div className="flex flex-wrap gap-3">
          {cards.map((card, index) => (
            <PlayingCard 
              key={card.id}
              card={card}
              size="medium"
              isPlayable={isCurrentPlayer}
              showDealAnimation={showDealAnimation}
              animationDelay={index * 100} // Stagger animation by 100ms per card
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerHand;