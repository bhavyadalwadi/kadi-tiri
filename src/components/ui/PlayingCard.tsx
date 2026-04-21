import React from 'react';
import { Card as CardType } from '@/types/game';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface PlayingCardProps {
  card: CardType;
  size?: 'small' | 'medium' | 'large';
  isPlayable?: boolean;
  isSelected?: boolean;
  isHidden?: boolean;
  onClick?: (card: CardType) => void;
  animationDelay?: number;
  showDealAnimation?: boolean;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ 
  card, 
  size = 'medium', 
  isPlayable = false, 
  isSelected = false, 
  isHidden = false,
  onClick,
  animationDelay = 0,
  showDealAnimation = false
}) => {
  const sizeConfig = {
    small: { width: 80, height: 112, fontSize: '14px', suitSize: '18px' },
    medium: { width: 100, height: 140, fontSize: '18px', suitSize: '22px' },
    large: { width: 120, height: 168, fontSize: '22px', suitSize: '26px' }
  };

  const config = sizeConfig[size];
  const isRed = card.suit === '♥' || card.suit === '♦';
  const cardColor = isRed ? '#dc2626' : '#000000';
  const { playCardFlip } = useSoundEffects();

  // Animation styles for dealing
  const dealAnimationStyle = showDealAnimation ? {
    animation: `dealCard 0.6s ease-out ${animationDelay}ms both`,
    transformOrigin: 'center top'
  } : {};

  // Add keyframes for deal animation to the document if not already present
  React.useEffect(() => {
    if (showDealAnimation && !document.querySelector('#deal-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'deal-animation-styles';
      style.textContent = `
        @keyframes dealCard {
          0% {
            transform: translateY(-100px) translateX(-50px) rotate(-15deg) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) translateX(-10px) rotate(-5deg) scale(0.95);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes cardFlip {
          0% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Play sound after animation delay
    if (showDealAnimation && animationDelay) {
      const soundTimeout = setTimeout(() => {
        playCardFlip();
      }, animationDelay + 300); // Play sound when card lands
      
      return () => clearTimeout(soundTimeout);
    }
  }, [showDealAnimation, animationDelay, playCardFlip]);

  if (isHidden) {
    return (
      <div 
        className={`relative cursor-pointer transition-all duration-200 ${
          isPlayable ? 'hover:scale-105' : ''
        }`}
        style={{ 
          width: config.width, 
          height: config.height,
          ...dealAnimationStyle
        }}
      >
        <svg width={config.width} height={config.height} viewBox={`0 0 ${config.width} ${config.height}`}>
          {/* Card back design */}
          <defs>
            <pattern id="cardBackPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#1e40af"/>
              <circle cx="10" cy="10" r="3" fill="#3b82f6"/>
              <circle cx="5" cy="5" r="1" fill="#60a5fa"/>
              <circle cx="15" cy="15" r="1" fill="#60a5fa"/>
            </pattern>
          </defs>
          <rect 
            width={config.width} 
            height={config.height} 
            rx="8" 
            ry="8" 
            fill="#1e40af" 
            stroke="#1e3a8a" 
            strokeWidth="2"
          />
          <rect 
            width={config.width - 8} 
            height={config.height - 8} 
            x="4" 
            y="4" 
            rx="4" 
            fill="url(#cardBackPattern)"
          />
        </svg>
      </div>
    );
  }

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-200 ${
        isPlayable ? 'hover:scale-105 hover:shadow-lg' : ''
      } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      style={{ 
        width: config.width, 
        height: config.height,
        ...dealAnimationStyle
      }}
      onClick={() => onClick?.(card)}
    >
      <svg width={config.width} height={config.height} viewBox={`0 0 ${config.width} ${config.height}`}>
        {/* Card shadow */}
        <defs>
          <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
        </defs>
        
        {/* Card background with gradient and shadow */}
        <rect 
          width={config.width} 
          height={config.height} 
          rx="8" 
          ry="8" 
          fill="url(#cardGradient)" 
          stroke="#e5e7eb" 
          strokeWidth="1.5"
          filter="url(#cardShadow)"
        />
        
        {/* Inner border for premium look */}
        <rect 
          x="3" 
          y="3" 
          width={config.width - 6} 
          height={config.height - 6} 
          rx="5" 
          ry="5" 
          fill="none" 
          stroke="#f3f4f6" 
          strokeWidth="0.5"
        />
        
        {/* Top-left rank and suit */}
        <text 
          x="8" 
          y="18" 
          fill={cardColor} 
          fontSize={config.fontSize} 
          fontWeight="bold" 
          fontFamily="Arial, sans-serif"
        >
          {card.rank}
        </text>
        <text 
          x="8" 
          y="36" 
          fill={cardColor} 
          fontSize={config.suitSize} 
          fontFamily="Arial, sans-serif"
        >
          {card.suit}
        </text>
        
        {/* Center suit symbol with subtle background */}
        <circle 
          cx={config.width / 2} 
          cy={config.height / 2} 
          r={size === 'large' ? '20' : size === 'medium' ? '16' : '12'} 
          fill={isRed ? '#fef2f2' : '#f9fafb'} 
          stroke={cardColor} 
          strokeWidth="0.5" 
          opacity="0.3"
        />
        <text 
          x={config.width / 2} 
          y={config.height / 2 + 8} 
          fill={cardColor} 
          fontSize={size === 'large' ? '32px' : size === 'medium' ? '24px' : '18px'} 
          fontFamily="Arial, sans-serif" 
          textAnchor="middle"
        >
          {card.suit}
        </text>
        
        {/* Bottom-right rank and suit (rotated) */}
        <g transform={`rotate(180 ${config.width - 8} ${config.height - 8})`}>
          <text 
            x={config.width - 8} 
            y={config.height - 18} 
            fill={cardColor} 
            fontSize={config.fontSize} 
            fontWeight="bold" 
            fontFamily="Arial, sans-serif" 
            textAnchor="end"
          >
            {card.rank}
          </text>
          <text 
            x={config.width - 8} 
            y={config.height - 36} 
            fill={cardColor} 
            fontSize={config.suitSize} 
            fontFamily="Arial, sans-serif" 
            textAnchor="end"
          >
            {card.suit}
          </text>
        </g>
        
        {/* Special Kali Tiri indicator */}
        {card.isKaliTiri && (
          <g>
            <circle cx={config.width - 15} cy="15" r="8" fill="#7c3aed" stroke="#5b21b6" strokeWidth="1"/>
            <text 
              x={config.width - 15} 
              y="18" 
              fill="white" 
              fontSize="8px" 
              fontFamily="Arial, sans-serif" 
              textAnchor="middle" 
              fontWeight="bold"
            >
              KT
            </text>
          </g>
        )}
        
        {/* Points indicator with background */}
        {card.points > 0 && (
          <g>
            <rect 
              x={config.width / 2 - 12} 
              y={config.height - 16} 
              width="24" 
              height="12" 
              rx="6" 
              fill="#f3f4f6" 
              stroke="#d1d5db" 
              strokeWidth="0.5"
            />
            <text 
              x={config.width / 2} 
              y={config.height - 8} 
              fill="#374151" 
              fontSize="9px" 
              fontFamily="Arial, sans-serif" 
              textAnchor="middle" 
              fontWeight="bold"
            >
              {card.points}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default PlayingCard;
