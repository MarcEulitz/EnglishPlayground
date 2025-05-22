import React, { useEffect } from 'react';
import useAudio from '@/hooks/use-audio';

interface CharacterFeedbackProps {
  character?: 'mia' | 'buddy' | 'teacher';
  scenario: 'greeting' | 'correct' | 'wrong';
  emotion?: 'happy' | 'excited' | 'encouraging' | 'neutral';
  autoPlay?: boolean;
  children?: React.ReactNode;
}

/**
 * CharacterFeedback component provides cute character voice feedback
 * for different scenarios in the app
 */
const CharacterFeedback: React.FC<CharacterFeedbackProps> = ({
  character = 'mia',
  scenario,
  emotion = 'happy',
  autoPlay = true,
  children
}) => {
  const { playCharacterPhrase } = useAudio();

  useEffect(() => {
    if (autoPlay) {
      playCharacterPhrase(scenario, {
        character,
        emotion
      });
    }
  }, [playCharacterPhrase, scenario, character, emotion, autoPlay]);

  // This component can be triggered programmatically or wrap content
  return <>{children}</>;
};

export default CharacterFeedback;