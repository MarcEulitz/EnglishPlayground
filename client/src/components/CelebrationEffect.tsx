import React, { useEffect, useRef } from 'react';
import useAudio from '@/hooks/use-audio';

interface CelebrationEffectProps {
  active: boolean;
  onComplete?: () => void;
}

const CelebrationEffect: React.FC<CelebrationEffectProps> = ({ active, onComplete }) => {
  const celebrationRef = useRef<HTMLDivElement>(null);
  const { playAudio } = useAudio();

  // Create confetti pieces
  const createConfetti = () => {
    if (!celebrationRef.current) return;

    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    
    // Random position
    const startX = Math.random() * 100;
    
    // Random colors
    const colors = ['#4A6CD3', '#FF9F43', '#19CB97', '#FF6B6B', '#66BB6A'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Random size
    const size = Math.random() * 10 + 5;
    
    // Apply styles
    confetti.style.left = `${startX}%`;
    confetti.style.backgroundColor = color;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    
    // Random animation duration
    confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
    
    celebrationRef.current.appendChild(confetti);
  };

  useEffect(() => {
    if (active && celebrationRef.current) {
      // Play celebration sound
      playAudio('success');
      
      // Create confetti
      for (let i = 0; i < 100; i++) {
        createConfetti();
      }
      
      // Clean up after animation completes
      const timer = setTimeout(() => {
        if (celebrationRef.current) {
          celebrationRef.current.innerHTML = '';
        }
        if (onComplete) {
          onComplete();
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [active, onComplete, playAudio]);

  return (
    <div 
      ref={celebrationRef} 
      className={`celebration ${active ? 'active' : ''}`}
    ></div>
  );
};

export default CelebrationEffect;
