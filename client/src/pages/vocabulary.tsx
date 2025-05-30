import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import axios from "axios";
import { useUserContext } from "@/contexts/UserContext";
import ProgressBar from "@/components/ProgressBar";
import AudioWave from "@/components/AudioWave";
import CharacterFeedback from "@/components/CharacterFeedback";
import useAudio from "@/hooks/use-audio";
import { getRandomItems, shuffleArray } from "@/lib/utils";
import { vocabularyData, generateTopicData } from "@/lib/data";

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
  const { currentUser } = useUserContext();
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
  const [feedbackType, setFeedbackType] = useState<"correct" | "wrong">(
    "correct",
  );

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const topic = params.topic || "animals";
      const topicData = vocabularyData[topic] || generateTopicData(topic);
      const itemCount = Math.min(topicData.length, 5);
      const selectedVocab = getRandomItems(topicData, itemCount);

      const preparedQuestions = await Promise.all(
        selectedVocab.map(async (vocab: any, index: number) => {
          const otherWords = topicData
            .filter((v: any) => v.word !== vocab.word)
            .map((v: any) => v.word);
          const optionCount = Math.min(otherWords.length, 3);
          const wrongOptions = getRandomItems(otherWords, optionCount);
          const options = shuffleArray([vocab.word, ...wrongOptions]);

          let imageUrl = vocab.imageUrl;
          try {
            const response = await axios.post("/api/find-best-image", {
              category: topic,
              word: vocab.word,
              translation: vocab.translation,
            });
            imageUrl = response.data.bestImageUrl;
            console.log("Bild erfolgreich geladen:", imageUrl);
          } catch (error) {
            console.error("Fehler beim Abrufen des Bildes:", error);
          }

          return {
            id: index + 1,
            word: vocab.word,
            translation: vocab.translation,
            imageUrl,
            options,
          };
        }),
      );

      setQuestions(preparedQuestions);
    };

    fetchQuestions();
  }, [params.topic]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

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

  const handleOptionClick = (option: string) => {
    if (isAnswerChecked) return;

    setSelectedAnswer(option);
    const correct = option === currentQuestion.word;
    setIsCorrect(correct);
    setIsAnswerChecked(true);
    setShowFeedback(true);
    setFeedbackType(correct ? "correct" : "wrong");

    if (correct) {
      playAudio("correct");
      playCharacterPhrase("correct", { character: "mia" });
      setScore(score + 1);
    } else {
      playAudio("wrong");
      playCharacterPhrase("wrong", { character: "buddy" });
      setLives((prev) => Math.max(prev - 1, 0));
    }

    timerRef.current = window.setTimeout(() => {
      setShowFeedback(false);
      setIsAnswerChecked(false);
      setSelectedAnswer(null);

      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        navigate("/success");
      }
    }, 2000);
  };

  const handleBackClick = () => {
    playAudio("click");
    navigate("/home");
  };

  const handlePlayAudio = () => {
    playWord(currentQuestion.word);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen">
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
        <div className="mt-3">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={questions.length}
            label={`Aufgabe ${currentQuestionIndex + 1} von ${questions.length}`}
          />
        </div>
      </div>

      <div className="p-5 flex flex-col items-center">
        <div className="w-full bg-white rounded-xl shadow-md p-5 mb-6">
          <div className="w-full h-48 flex items-center justify-center rounded-lg mb-4 overflow-hidden bg-gray-100">
            <img
              src={currentQuestion.imageUrl}
              alt={currentQuestion.word}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <button
              className="audio-button p-3 bg-primary rounded-full text-white flex items-center"
              onClick={handlePlayAudio}
              disabled={isPlaying}
            >
              <i className="ri-volume-up-line text-xl mr-2"></i>
              <span className="font-medium">Listen</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 mb-1">Deutsch:</p>
              <p className="text-xl font-semibold">
                {currentQuestion.translation}
              </p>
            </div>
            <AudioWave
              playing={isPlaying}
              onComplete={() => setIsPlaying(false)}
            />
          </div>
        </div>

        <p className="text-lg font-bold mb-4">Was ist das auf Englisch?</p>

        <div className="grid grid-cols-2 gap-4 w-full">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`p-4 rounded-xl shadow-md flex items-center justify-center font-bold text-lg transition-all ${
                selectedAnswer === option ? "ring-2 ring-primary" : ""
              } ${
                isAnswerChecked && option === currentQuestion.word
                  ? "bg-success text-white"
                  : isAnswerChecked && selectedAnswer === option
                    ? "bg-destructive text-white"
                    : "bg-white hover:shadow-lg"
              }`}
              onClick={() => handleOptionClick(option)}
              disabled={isAnswerChecked}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {showFeedback && <CharacterFeedback type={feedbackType} />}

      <div className="h-16"></div>
    </div>
  );
};

export default VocabularyPage;
