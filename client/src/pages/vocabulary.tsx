import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { useUserContext } from '@/contexts/UserContext';
import ProgressBar from '@/components/ProgressBar';
import AudioWave from '@/components/AudioWave';
import CharacterFeedback from '@/components/CharacterFeedback';
import useAudio from '@/hooks/use-audio';
import { Button } from '@/components/ui/button';
import { getRandomItems, shuffleArray } from '@/lib/utils';
import { vocabularyData } from '@/lib/data';

interface VocabularyQuestion {
  id: number;
  word: string;
  translation: string;
  imageUrl: string;
  options: string[];
}

const VocabularyPage: React.FC = () => {
  const params = useParams<{ topic: string }>();
  const [, navigate] = useLocation();
  const { currentUser, addLearningStat } = useUserContext();
  const { playAudio, playWord, playCharacterPhrase, audioEnabled } = useAudio();
  
  const [lives, setLives] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<VocabularyQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
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
    const topicData = vocabularyData[topic] || vocabularyData.animals;
    
    // Get 5 random vocabulary items
    const selectedVocab = getRandomItems(topicData, 5);
    
    // Create questions with options
    const preparedQuestions = selectedVocab.map((vocab, index) => {
      // Get 3 wrong options from other vocabulary items
      const otherWords = topicData
        .filter(v => v.word !== vocab.word)
        .map(v => v.word);
      
      const wrongOptions = getRandomItems(otherWords, 3);
      
      // Combine correct answer with wrong options and shuffle
      const options = shuffleArray([vocab.word, ...wrongOptions]);
      
      return {
        id: index + 1,
        word: vocab.word,
        translation: vocab.translation,
        imageUrl: vocab.imageUrl,
        options
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
    playWord(currentQuestion.word);
    setIsPlaying(true);
  };

  const handleOptionClick = (option: string) => {
    if (isAnswerChecked) return;
    
    playAudio('click');
    setSelectedAnswer(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    
    setIsAnswerChecked(true);
    const correct = selectedAnswer === currentQuestion.word;
    setIsCorrect(correct);
    setFeedbackType(correct ? 'correct' : 'wrong');
    setShowFeedback(true);
    
    if (correct) {
      // Play sound effect first
      playAudio('correct');
      
      // Then play character voice with a slight delay
      setTimeout(() => {
        playCharacterPhrase('correct', { 
          character: 'mia', 
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
          character: 'buddy', 
          emotion: 'encouraging' 
        });
      }, 500);
      
      setLives(lives - 1);
    }
    
    // Wait before moving to next question (longer to allow for character voice)
    timerRef.current = window.setTimeout(() => {
      setShowFeedback(false);
      
      // Small delay after hiding feedback before proceeding
      setTimeout(() => {
        if (currentQuestionIndex === questions.length - 1 || lives <= 1 && !correct) {
          // End of quiz or out of lives
          saveProgress();
          navigate(`/success/${params.topic}`);
        } else {
          // Next question
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setIsAnswerChecked(false);
        }
      }, 300);
    }, 2500);
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
          <h2 className="font-bold text-xl capitalize">{params.topic}</h2>
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
      
      {/* Vocabulary Content */}
      <div className="p-5 flex flex-col items-center">
        <div className="w-full bg-white rounded-xl shadow-md p-5 mb-6">
          <img 
            src={currentQuestion.imageUrl} 
            alt={currentQuestion.word} 
            className="w-full h-48 object-contain rounded-lg mb-4"
          />
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-3xl font-bold text-primary">{currentQuestion.word}</h3>
            <button 
              className="audio-button p-2 bg-primary rounded-full text-white"
              onClick={handlePlayAudio}
              disabled={isPlaying}
            >
              <i className="ri-volume-up-line text-xl"></i>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 mb-1">Deutsch:</p>
              <p className="text-xl font-semibold">{currentQuestion.translation}</p>
            </div>
            <AudioWave 
              playing={isPlaying} 
              onComplete={() => setIsPlaying(false)}
            />
          </div>
        </div>
        
        <p className="text-lg font-bold mb-4">Was ist das auf Englisch?</p>
        
        {/* Options */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`p-4 rounded-xl shadow-md flex items-center justify-center font-bold text-lg transition-all ${
                selectedAnswer === option 
                  ? 'ring-2 ring-primary' 
                  : ''
              } ${
                isAnswerChecked && option === currentQuestion.word
                  ? 'bg-success text-white'
                  : isAnswerChecked && selectedAnswer === option
                  ? 'bg-destructive text-white'
                  : 'bg-white hover:shadow-lg'
              }`}
              onClick={() => handleOptionClick(option)}
              disabled={isAnswerChecked}
            >
              {option}
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
                src={feedbackType === 'correct' 
                  ? "https://api.dicebear.com/7.x/personas/svg?seed=mia&face=smile&backgroundColor=b6e3f4" 
                  : "https://api.dicebear.com/7.x/personas/svg?seed=buddy&face=concerned&backgroundColor=ffdfbf"} 
                alt={feedbackType === 'correct' ? "Mia" : "Buddy"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white max-w-[150px]">
              <p className="font-bold">
                {feedbackType === 'correct' ? "Mia" : "Buddy"}
              </p>
              <p className="text-sm">
                {feedbackType === 'correct' 
                  ? "Well done!" 
                  : "Let's try again!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 max-w-xl mx-auto">
        <Button
          onClick={handleCheckAnswer}
          disabled={!selectedAnswer || isAnswerChecked}
          className="w-full bg-accent text-white py-4 px-6 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Überprüfen
        </Button>
      </div>
    </div>
  );
};

export default VocabularyPage;
