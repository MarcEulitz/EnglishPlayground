import React, { useEffect, useRef } from 'react';

interface AudioWaveProps {
  playing: boolean;
  onComplete?: () => void;
  duration?: number;
}

const AudioWave: React.FC<AudioWaveProps> = ({ 
  playing, 
  onComplete,
  duration = 2000
}) => {
  const waveRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (playing && waveRef.current) {
      // Clear any existing bars
      waveRef.current.innerHTML = '';
      
      // Create bars for the wave effect
      for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.animationDuration = `${110 + i * 20}ms`;
        waveRef.current.appendChild(bar);
      }
      
      // Hide after duration
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [playing, duration, onComplete]);
  
  return (
    <div 
      ref={waveRef} 
      className={`audio-wave ${playing ? 'flex' : 'hidden'}`}
    ></div>
  );
};

export default AudioWave;
