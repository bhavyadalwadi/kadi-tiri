import { useCallback } from 'react';

interface SoundEffects {
  playDealSound: () => void;
  playDeal: () => void; // Alias for playDealSound
  playCardFlip: () => void;
  playButtonClick: () => void;
  playWin: () => void;
  playError: () => void;
}

export const useSoundEffects = (): SoundEffects => {
  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      // Silently fail if audio context is not supported
      console.warn('Audio not supported:', error);
    }
  }, []);

  const playDealSound = useCallback(() => {
    playSound(800, 0.1, 'sine');
  }, [playSound]);

  const playCardFlip = useCallback(() => {
    playSound(600, 0.15, 'triangle');
  }, [playSound]);

  const playButtonClick = useCallback(() => {
    playSound(1000, 0.1, 'square');
  }, [playSound]);

  const playWin = useCallback(() => {
    // Play a victory chord
    setTimeout(() => playSound(523, 0.3), 0);   // C
    setTimeout(() => playSound(659, 0.3), 100); // E
    setTimeout(() => playSound(784, 0.3), 200); // G
  }, [playSound]);

  const playError = useCallback(() => {
    playSound(200, 0.3, 'sawtooth');
  }, [playSound]);

  return {
    playDealSound,
    playDeal: playDealSound, // Alias for backward compatibility
    playCardFlip,
    playButtonClick,
    playWin,
    playError
  };
};
