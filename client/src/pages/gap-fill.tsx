import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { useUserContext } from '@/contexts/UserContext';
import ProgressBar from '@/components/ProgressBar';
import AudioWave from '@/components/AudioWave';
import CharacterFeedback from '@/components/CharacterFeedback';
import useAudio from '@/hooks/use-audio';
import { Button } from '@/components/ui/button';
import { getRandomItems, shuffleArray } from '@/lib/utils';
import { gapFillData } from '@/lib/data';

interface GapFillQuestion {
  id: number;
  sentence: string[];
  gapIndex: number;
  correctWord: string;
  options: string[];
  imageUrl: string;
}

const GapFillPage: React.FC = () => {
  const params = useParams<{ topic: string }>();
  const [, navigate] = useLocation();
  const { currentUser, addLearningStat } = useUserContext();
  const { playAudio, playWord, playCharacterPhrase } = useAudio();
  
  const [lives, setLives] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<GapFillQuestion[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong'>('correct');
  
  const timerRef = useRef<number | null>(null);

  // Prepare questions
  useEffect(() => {
    const topic = params.topic || 'animals';
    const topicData = gapFillData[topic] || gapFillData.animals;
    
    // Get 5 random gap fill items
    const selectedGapFills = getRandomItems(topicData, 5);
    
    // Create questions with options
    const preparedQuestions = selectedGapFills.map((gapFill, index) => {
      // Get 3 wrong options
      const otherWords = topicData
        .filter(g => g.correctWord !== gapFill.correctWord)
        .map(g => g.correctWord);
      
      const wrongOptions = getRandomItems(otherWords, 3);
      
      // Combine correct answer with wrong options and shuffle
      const options = shuffleArray([gapFill.correctWord, ...wrongOptions]);
      
      return {
        id: index + 1,
        sentence: gapFill.sentence,
        gapIndex: gapFill.gapIndex,
        correctWord: gapFill.correctWord,
        options,
        imageUrl: gapFill.imageUrl
      };
    });
    
    setQuestions(preparedQuestions);
  }, [params.topic]);

  // Redirect if no user is selected
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!currentUser || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold text-primary">Lade...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleBackClick = () => {
    playAudio('click');
    navigate('/home');
  };

  const handlePlayAudio = () => {
    // Play the full sentence
    const sentence = [...currentQuestion.sentence];
    if (selectedWord) {
      sentence[currentQuestion.gapIndex] = selectedWord;
    }
    playWord(sentence.join(' '));
    setIsPlaying(true);
  };

  const handleWordSelect = (word: string) => {
    if (isAnswerChecked) return;
    
    playAudio('click');
    setSelectedWord(word);
  };

  const handleCheckAnswer = () => {
    if (!selectedWord) return;
    
    setIsAnswerChecked(true);
    const correct = selectedWord === currentQuestion.correctWord;
    setIsCorrect(correct);
    setFeedbackType(correct ? 'correct' : 'wrong');
    setShowFeedback(true);
    
    if (correct) {
      // Play sound effect first
      playAudio('correct');
      
      // Then play character voice with a slight delay
      setTimeout(() => {
        playCharacterPhrase('correct', { 
          character: 'teacher', 
          emotion: 'happy' 
        });
      }, 500);
      
      setScore(score + 1);
    } else {
      // Play sound effect first
      playAudio('wrong');
      
      // Then play character voice with a slight delay
      setTimeout(() => {
        playCharacterPhrase('wrong', { 
          character: 'teacher', 
          emotion: 'encouraging' 
        });
      }, 500);
      
      setLives(lives - 1);
    }
    
    // Wait before moving to next question (longer to allow for character voice)
    timerRef.current = window.setTimeout(() => {
      setShowFeedback(false);
      
      if (currentQuestionIndex === questions.length - 1 || lives <= 1 && !correct) {
        // End of quiz or out of lives
        saveProgress();
        navigate(`/success/${params.topic}`);
      } else {
        // Next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedWord(null);
        setIsAnswerChecked(false);
      }
    }, 1500);
  };
  
  const saveProgress = async () => {
    if (!currentUser) return;
    
    // Calculate duration in seconds
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      await addLearningStat({
        userId: currentUser.id,
        topic: params.topic,
        score,
        duration
      });
    } catch (error) {
      console.error('Failed to save learning stat', error);
    }
  };

  // Render the sentence with gap
  const renderSentence = () => {
    return currentQuestion.sentence.map((word, index) => {
      if (index === currentQuestion.gapIndex) {
        // This is the gap
        return (
          <div 
            key={index}
            className={`inline-block mx-2 min-w-20 h-10 border-2 border-dashed rounded-lg flex items-center justify-center ${
              isAnswerChecked && isCorrect
                ? 'bg-success/20 border-success'
                : isAnswerChecked && !isCorrect
                ? 'bg-destructive/20 border-destructive'
                : selectedWord
                ? 'bg-primary/20 border-primary'
                : 'bg-primary/10 border-primary'
            }`}
          >
            {selectedWord || ''}
          </div>
        );
      }
      
      // Regular word
      return <span key={index} className="mx-2">{word}</span>;
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header with Navigation */}
      <div className="bg-primary text-white p-4 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between">
          <button 
            className="p-1 rounded-full hover:bg-white/20"
            onClick={handleBackClick}
          >
            <i className="ri-arrow-left-line text-2xl"></i>
          </button>
          <h2 className="font-bold text-xl">Lückentext</h2>
          <div className="flex items-center">
            <i className="ri-heart-fill text-destructive"></i>
            <span className="ml-1 font-bold">{lives}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={questions.length}
            label={`Aufgabe ${currentQuestionIndex + 1} von ${questions.length}`}
          />
        </div>
      </div>
      
      {/* Gap Fill Content */}
      <div className="p-5">
        <div className="w-full bg-white rounded-xl shadow-md p-5 mb-6">
          <img 
            src={currentQuestion.imageUrl} 
            alt="Gap fill exercise" 
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          
          <div className="mb-6">
            <p className="text-lg mb-4">Vervollständige den Satz:</p>
            <div className="flex flex-wrap items-center text-xl font-semibold">
              {renderSentence()}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              className="audio-button p-2 bg-primary rounded-full text-white"
              onClick={handlePlayAudio}
              disabled={isPlaying}
            >
              <i className="ri-volume-up-line text-xl"></i>
            </button>
          </div>
          <AudioWave 
            playing={isPlaying} 
            onComplete={() => setIsPlaying(false)}
          />
        </div>
        
        {/* Word Options */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {currentQuestion.options.map((word, index) => (
            <button
              key={index}
              className={`p-3 rounded-xl shadow-md flex items-center justify-center font-bold text-lg transition-all ${
                selectedWord === word 
                  ? 'ring-2 ring-primary' 
                  : ''
              } ${
                isAnswerChecked && word === currentQuestion.correctWord
                  ? 'bg-success text-white'
                  : isAnswerChecked && selectedWord === word
                  ? 'bg-destructive text-white'
                  : 'bg-white hover:shadow-lg'
              }`}
              onClick={() => handleWordSelect(word)}
              disabled={isAnswerChecked}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
      
      {/* Character Feedback */}
      {showFeedback && (
        <div className={`fixed bottom-24 right-4 p-3 rounded-2xl shadow-lg animate-bounce-small ${
          feedbackType === 'correct' ? 'bg-success/90' : 'bg-primary/90'
        }`}>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-white mr-3 overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/personas/svg?seed=teacher&face=smile&backgroundColor=d1d4f9" 
                alt="Teacher"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white max-w-[150px]">
              <p className="font-bold">Teacher</p>
              <p className="text-sm">
                {feedbackType === 'correct' 
                  ? "Great sentence!" 
                  : "Try a different word."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 max-w-xl mx-auto">
        <Button
          onClick={handleCheckAnswer}
          disabled={!selectedWord || isAnswerChecked}
          className="w-full bg-accent text-white py-4 px-6 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Überprüfen
        </Button>
      </div>
    </div>
  );
};

export default GapFillPage;
