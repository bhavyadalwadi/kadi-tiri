import React from 'react';
import { CardProps } from '@/types/ui';
import PlayingCard from './PlayingCard';

const Card: React.FC<CardProps> = ({ 
  card, 
  isPlayable, 
  isSelected, 
  isHidden, 
  onClick, 
  size = 'medium',
  animationDelay,
  showDealAnimation
}) => {
  return (
    <PlayingCard 
      card={card}
      size={size}
      isPlayable={isPlayable}
      isSelected={isSelected}
      isHidden={isHidden}
      onClick={onClick}
      animationDelay={animationDelay}
      showDealAnimation={showDealAnimation}
    />
  );
};

export default Card;