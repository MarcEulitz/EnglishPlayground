import { useState, useEffect, useCallback } from 'react';

interface AudioOptions {
  volume?: number;
  loop?: boolean;
}

type AudioType = 'correct' | 'wrong' | 'success' | 'click';

const audioFiles = {
  correct: 'https://cdn.freesound.org/previews/171/171671_2437358-lq.mp3',
  wrong: 'https://cdn.freesound.org/previews/142/142608_1840739-lq.mp3',
  success: 'https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3',
  click: 'https://cdn.freesound.org/previews/156/156031_2538033-lq.mp3',
};

const useAudio = () => {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Check if sound effects should be enabled from localStorage
  useEffect(() => {
    const storedPreference = localStorage.getItem('soundEffects');
    if (storedPreference !== null) {
      setAudioEnabled(storedPreference === 'true');
    }
  }, []);

  const toggleAudio = useCallback(() => {
    const newValue = !audioEnabled;
    setAudioEnabled(newValue);
    localStorage.setItem('soundEffects', String(newValue));
  }, [audioEnabled]);

  const playAudio = useCallback((type: AudioType, options: AudioOptions = {}) => {
    if (!audioEnabled) return;
    
    const { volume = 0.5, loop = false } = options;
    const audio = new Audio(audioFiles[type]);
    
    audio.volume = volume;
    audio.loop = loop;
    
    // Handle iOS Safari context - needs user interaction
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error('Audio play failed:', error);
      });
    }
    
    return audio;
  }, [audioEnabled]);

  const playWord = useCallback((word: string, options: AudioOptions = {}) => {
    if (!audioEnabled) return;
    
    const { volume = 0.7 } = options;
    // Using the responsive voice API for TTS (this is just a fallback; in a production app, 
    // you would use a more robust TTS solution or pre-recorded audio files)
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.volume = volume;
    
    window.speechSynthesis.speak(utterance);
  }, [audioEnabled]);

  return {
    audioEnabled,
    toggleAudio,
    playAudio,
    playWord
  };
};

export default useAudio;
