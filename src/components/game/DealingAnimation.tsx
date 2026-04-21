import React, { useState, useEffect } from 'react';
import PlayingCard from '@/components/ui/PlayingCard';
import { Card, GameState } from '@/types/game';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface DealingAnimationProps {
  isActive: boolean;
  totalCards: number;
  gameState: GameState;
  onComplete?: () => void;
}

const DealingAnimation: React.FC<DealingAnimationProps> = ({ 
  isActive, 
  totalCards, 
  gameState,
  onComplete 
}) => {
  const [dealtCards, setDealtCards] = useState(0);
  const [activeAnimations, setActiveAnimations] = useState<number[]>([]);
  const [animatedCards, setAnimatedCards] = useState<{[key: number]: boolean}>({});
  const [randomPositions, setRandomPositions] = useState<Array<{x: number, y: number, rotation: number}>>([]);
  const { playDealSound, playCardFlip } = useSoundEffects();

  // Generate random positions around the screen for cards to fly to
  const generateRandomPositions = () => {
    const positions = [];
    const numPositions = Math.max(20, totalCards); // Ensure we have enough positions
    
    for (let i = 0; i < numPositions; i++) {
      // Generate random positions around the edges and corners
      const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      let x, y;
      
      switch (side) {
        case 0: // Top edge
          x = Math.random() * 800 + 50; // 50px to 850px from left (wider spread)
          y = Math.random() * 120 + 20;  // 20px to 140px from top
          break;
        case 1: // Right edge
          x = Math.random() * 120 + 700; // 700px to 820px from left  
          y = Math.random() * 500 + 50; // 50px to 550px from top
          break;
        case 2: // Bottom edge
          x = Math.random() * 800 + 50; // 50px to 850px from left (wider spread)
          y = Math.random() * 120 + 450; // 450px to 570px from top
          break;
        case 3: // Left edge
          x = Math.random() * 120 + 20;  // 20px to 140px from left
          y = Math.random() * 500 + 50; // 50px to 550px from top
          break;
        default:
          x = 400;
          y = 300;
      }
      
      positions.push({
        x: x,
        y: y,
        rotation: Math.random() * 360 - 180 // Random rotation between -180 and 180 degrees
      });
    }
    
    return positions;
  };

  useEffect(() => {
    if (isActive) {
      setDealtCards(0);
      setActiveAnimations([]);
      
      // Generate stable random positions for this animation sequence
      setRandomPositions(generateRandomPositions());
      
      // Simulate dealing cards one by one to each player in turn
      const dealInterval = setInterval(() => {
        setDealtCards(prev => {
          const next = prev + 1;
          
          // Play realistic card dealing sounds
          playDealSound(); // Initial card slide sound
          setTimeout(() => playCardFlip(), 50); // Card flip sound as it flies
          
          // Add animation for this card
          setActiveAnimations(current => {
            const newAnimations = [...current, next];
            return newAnimations;
          });
          
          // Trigger animation after a small delay
          setTimeout(() => {
            setAnimatedCards(current => ({
              ...current,
              [next]: true
            }));
          }, 100); // Increased delay for better effect
          
          // Remove animation after it completes (much longer duration)
          setTimeout(() => {
            setActiveAnimations(current => {
              const filtered = current.filter(id => id !== next);
              return filtered;
            });
            setAnimatedCards(current => {
              const updated = { ...current };
              delete updated[next];
              return updated;
            });
          }, 4500); // Increased from 3200ms to 4500ms for much longer animation

          if (next >= totalCards) {
            clearInterval(dealInterval);
            setTimeout(() => onComplete?.(), 2000); // Wait longer for all animations to complete
            return totalCards;
          }
          return next;
        });
      }, 150); // Slower dealing: increased from 200ms to 150ms between cards

      return () => clearInterval(dealInterval);
    } else {
      setRandomPositions([]);
      setAnimatedCards({});
    }
  }, [isActive, totalCards, onComplete, playDealSound]);

  if (!isActive) return null;

  // Create a dummy card for the deck
  const deckCard: Card = {
    id: 'deck',
    rank: 'A',
    suit: '♠',
    points: 0,
    isKaliTiri: false
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      {/* Central deck position */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <PlayingCard 
            card={deckCard}
            size="large"
            isHidden={true}
          />
        </div>
      </div>

      {/* Flying cards animation */}
      {randomPositions.length > 0 && activeAnimations.map((cardId) => {
        const positionIndex = (cardId - 1) % randomPositions.length;
        const targetPosition = randomPositions[positionIndex];
        const animationKey = `card-${cardId}`;
        const isAnimated = animatedCards[cardId];
        
        // Calculate the offset from center to target position
        const offsetX = isAnimated ? targetPosition.x - 400 : 0; // 400 is roughly center x
        const offsetY = isAnimated ? targetPosition.y - 300 : 0; // 300 is roughly center y
        
        return (
          <div
            key={animationKey}
            className="flying-card"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) translateX(${offsetX}px) translateY(${offsetY}px) scale(${isAnimated ? 0.6 : 1}) rotate(${isAnimated ? targetPosition.rotation : 0}deg)`,
              pointerEvents: 'none',
              zIndex: 1000 + cardId,
              opacity: isAnimated ? 0.1 : 1,
              transition: 'all 2.0s ease-out' // Increased from 1.2s to 2.0s for much longer, smoother animation
            }}
          >
            <PlayingCard 
              card={deckCard}
              size="medium"
              isHidden={true}
            />
          </div>
        );
      })}

    </div>
  );
};

export default DealingAnimation;
