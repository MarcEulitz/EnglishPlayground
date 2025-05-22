import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { useUserContext } from '@/contexts/UserContext';
import ProgressBar from '@/components/ProgressBar';
import AudioWave from '@/components/AudioWave';
import CharacterFeedback from '@/components/CharacterFeedback';
import useAudio from '@/hooks/use-audio';
import { Button } from '@/components/ui/button';
import { getRandomItems, shuffleArray } from '@/lib/utils';
import { vocabularyData, generateTopicData } from '@/lib/data';

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

  // Basis64-kodierte SVG-Bilder direkt im Code - 100% zuverlässig
  const motorcycleSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+CiAgPHN0eWxlPgogICAgLnN0MCB7IGZpbGw6ICM0NDg4ZmY7IH0KICAgIC5zdDEgeyBmaWxsOiAjMzMzOyB9CiAgICAuc3QyIHsgZmlsbDogIzY2NjsgfQogICAgLnN0MyB7IGZpbGw6ICM5OTk7IH0KICAgIC5zdDQgeyBmaWxsOiAjZTBlMGUwOyB9CiAgPC9zdHlsZT4KICA8cmVjdCBmaWxsPSIjZjBmMGYwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZmlsbD0iIzQ0ODhmZiI+TW90b3JyYWQ8L3RleHQ+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAsIDUwKSI+CiAgICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjgwIiByPSIzMCIgY2xhc3M9InN0MiIvPgogICAgPGNpcmNsZSBjeD0iMzAiIGN5PSI4MCIgcj0iMTAiIGNsYXNzPSJzdDMiLz4KICAgIDxjaXJjbGUgY3g9IjEzMCIgY3k9IjgwIiByPSIzMCIgY2xhc3M9InN0MiIvPgogICAgPGNpcmNsZSBjeD0iMTMwIiBjeT0iODAiIHI9IjEwIiBjbGFzcz0ic3QzIi8+CiAgICA8cGF0aCBkPSJNMzUgNTAgTDEyMCA1MCBMMTIwIDcwIEw2MCA3MCBMMzAgODAiIGNsYXNzPSJzdDEiIGZpbGwtb3BhY2l0eT0iMC44Ii8+CiAgICA8cGF0aCBkPSJNMTIwIDUwIEwxNDAgNjUgTDEzMCA4MCIgY2xhc3M9InN0MCIvPgogICAgPHBhdGggZD0iTTEyMCA3MCBMMTIwIDYwIEw2NSA4NSIgY2xhc3M9InN0NCIvPgogIDwvZz4KPC9zdmc+';
  
  const helmetSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+CiAgPHN0eWxlPgogICAgLnN0MCB7IGZpbGw6ICMzMzM7IH0KICAgIC5zdDEgeyBmaWxsOiAjNDQ0OyB9CiAgICAuc3QyIHsgZmlsbDogI2RkZDsgfQogIDwvc3R5bGU+CiAgPHJlY3QgZmlsbD0iI2YwZjBmMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiLz4KICA8dGV4dCB4PSIxMDAiIHk9IjM1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IiM0NDg4ZmYiPkhlbG08L3RleHQ+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAsIDQ1KSI+CiAgICA8cGF0aCBkPSJNNjAgMjAgQzEwMCAyMCAxMTAgNjAgMTEwIDkwIEMxMTAgMTEwIDkwIDExMCA2MCAxMTAgQzMwIDExMCAxMCAxMTAgMTAgOTAgQzEwIDYwIDIwIDIwIDYwIDIwIFoiIGNsYXNzPSJzdDAiLz4KICAgIDxwYXRoIGQ9Ik02MCAyNSBDOTUgMjUgMTA1IDYwIDEwNSA5MCBDMTA1IDEwNSA5MCAxMDUgNjAgMTA1IEMzMCAxMDUgMTUgMTA1IDE1IDkwIEMxNSA2MCAyNSAyNSA2MCAyNSBaIiBjbGFzcz0ic3QxIi8+CiAgICA8cGF0aCBkPSJNMTEwIDgwIEwxMjAgODAgTDEyMCAxMDAgTDExMCAxMDBaIiBjbGFzcz0ic3QwIi8+CiAgICA8cGF0aCBkPSJNNTAgNjUgQzcwIDY1IDg1IDc1IDg1IDk1IEw4NSAxMDUgTDM1IDEwNSBMMzUgOTUgQzM1IDc1IDMwIDY1IDUwIDY1IFoiIGNsYXNzPSJzdDIiLz4KICA8L2c+Cjwvc3ZnPg==';
  
  const jacketSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+CiAgPHN0eWxlPgogICAgLnN0MCB7IGZpbGw6ICM3MjMzMTA7IH0KICAgIC5zdDEgeyBmaWxsOiAjOGIzZDEzOyB9CiAgICAuc3QyIHsgZmlsbDogIzVlMmEwZTsgfQogICAgLnN0MyB7IGZpbGw6ICNmMGYwZjA7IH0KICAgIC5zdDQgeyBmaWxsOiAjY2RjZGNkOyB9CiAgPC9zdHlsZT4KICA8cmVjdCBmaWxsPSIjZjBmMGYwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZmlsbD0iIzQ0ODhmZiI+SmFja2U8L3RleHQ+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzAsIDQwKSI+CiAgICA8cGF0aCBkPSJNMCA0MCBMNDAgMTAgTDEwMCAxMCBMMTQwIDQwIEwxNDAgMTQwIEwwIDE0MCBaIiBjbGFzcz0ic3QwIi8+CiAgICA8cGF0aCBkPSJNNTAgMTAgTDUwIDQwIEw1NSA2MCBMNTUgMTQwIEw4NSAxNDAgTDg1IDYwIEw5MCA0MCBMOTAgMTAgWiIgY2xhc3M9InN0MSIvPgogICAgPHBhdGggZD0iTTU1IDYwIEw4NSA2MCIgc3Ryb2tlPSIjNWUyYTBlIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxwYXRoIGQ9Ik01NSA4MCBMODUgODAiIHN0cm9rZT0iIzVlMmEwZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8cGF0aCBkPSJNNTUgMTAwIEw4NSAxMDAiIHN0cm9rZT0iIzVlMmEwZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8cGF0aCBkPSJNNTUgMTIwIEw4NSAxMjAiIHN0cm9rZT0iIzVlMmEwZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8cGF0aCBkPSJNMTAgNDAgTDEwIDYwIEwzMCA4MCBMMTUgMTIwIEwwIDEyMCIgY2xhc3M9InN0MiIvPgogICAgPHBhdGggZD0iTTEzMCA0MCBMMTMwIDYwIEwxMTAgODAgTDEyNSAxMjAgTDE0MCAxMjAiIGNsYXNzPSJzdDIiLz4KICA8L2c+Cjwvc3ZnPg==';
  
  const glovesSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+CiAgPHN0eWxlPgogICAgLnN0MCB7IGZpbGw6ICM3MjMzMTA7IH0KICAgIC5zdDEgeyBmaWxsOiAjOGIzZDEzOyB9CiAgICAuc3QyIHsgZmlsbDogIzVlMmEwZTsgfQogICAgLnN0MyB7IGZpbGw6ICNmMGYwZjA7IH0KICAgIC5zdDQgeyBmaWxsOiAjY2RjZGNkOyB9CiAgPC9zdHlsZT4KICA8cmVjdCBmaWxsPSIjZjBmMGYwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZmlsbD0iIzQ0ODhmZiI+SGFuZHNjaHVoZTwvdGV4dD4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MCwgNTApIj4KICAgIDwhLS0gTGVmdCBHbG92ZSAtLT4KICAgIDxwYXRoIGQ9Ik0xMCAxMCBMNTAgMTAgTDYwIDIwIEw1NSA4MCBMMTAgODAgTDAgNTAgWiIgY2xhc3M9InN0MCIvPgogICAgPHBhdGggZD0iTTEwIDE1IEw0NSAxNSBMNTMgMjIgTDUwIDc1IEwxNSA3NSBMNSA1MCBaIiBjbGFzcz0ic3QxIi8+CiAgICA8cGF0aCBkPSJNNTAgMTAgTDUwIDAgTDYwIDAgTDYwIDIwIiBjbGFzcz0ic3QwIi8+CiAgICA8cGF0aCBkPSJNNDIgMTAgTDQyIDAgTDQ4IDAgTDQ4IDE1IiBjbGFzcz0ic3QwIi8+CiAgICA8cGF0aCBkPSJNMzQgMTAgTDM0IDAgTDQwIDAgTDQwIDE1IiBjbGFzcz0ic3QwIi8+CiAgICA8cGF0aCBkPSJNMjYgMTAgTDI2IDAgTDMyIDAgTDMyIDE1IiBjbGFzcz0ic3QwIi8+CiAgICA8cGF0aCBkPSJNMTggMTAgTDE4IDAgTDI0IDAgTDI0IDE1IiBjbGFzcz0ic3QwIi8+CiAgICA8IS0tIFJpZ2h0IEdsb3ZlIC0tPgogICAgPHBhdGggZD0iTTgwIDEwIEwxMjAgMTAgTDEzMCA1MCBMMTIwIDgwIEw3NSA4MCBMNzAgMjAgWiIgY2xhc3M9InN0MCIgdHJhbnNmb3JtPSJzY2FsZSgtMSwgMSkiIHRyYW5zZm9ybS1vcmlnaW49IjEwMCwgNDAiLz4KICAgIDxwYXRoIGQ9Ik04NSAxNSBMMTE1IDE1IEwxMjMgNTAgTDExNSA3NSBMODAgNzUgTDc3IDIyIFoiIGNsYXNzPSJzdDEiIHRyYW5zZm9ybT0ic2NhbGUoLTEsIDEpIiB0cmFuc2Zvcm0tb3JpZ2luPSIxMDAsIDQwIi8+CiAgICA8cGF0aCBkPSJNODAgMTAgTDgwIDAgTDcwIDAgTDcwIDIwIiBjbGFzcz0ic3QwIiB0cmFuc2Zvcm09InNjYWxlKC0xLCAxKSIgdHJhbnNmb3JtLW9yaWdpbj0iMTAwLCA0MCIvPgogICAgPHBhdGggZD0iTTg4IDEwIEw4OCAwIEw4MiAwIEw4MiAxNSIgY2xhc3M9InN0MCIgdHJhbnNmb3JtPSJzY2FsZSgtMSwgMSkiIHRyYW5zZm9ybS1vcmlnaW49IjEwMCwgNDAiLz4KICAgIDxwYXRoIGQ9Ik05NiAxMCBMOTYgMCBMOTAgMCBMOTAgMTUiIGNsYXNzPSJzdDAiIHRyYW5zZm9ybT0ic2NhbGUoLTEsIDEpIiB0cmFuc2Zvcm0tb3JpZ2luPSIxMDAsIDQwIi8+CiAgICA8cGF0aCBkPSJNMTA0IDEwIEwxMDQgMCBMOTggMCBMOTggMTUiIGNsYXNzPSJzdDAiIHRyYW5zZm9ybT0ic2NhbGUoLTEsIDEpIiB0cmFuc2Zvcm0tb3JpZ2luPSIxMDAsIDQwIi8+CiAgICA8cGF0aCBkPSJNMTEyIDEwIEwxMTIgMCBMMTA2IDAgTDEwNiAxNSIgY2xhc3M9InN0MCIgdHJhbnNmb3JtPSJzY2FsZSgtMSwgMSkiIHRyYW5zZm9ybS1vcmlnaW49IjEwMCwgNDAiLz4KICA8L2c+Cjwvc3ZnPg==';
  
  const bootsSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+CiAgPHN0eWxlPgogICAgLnN0MCB7IGZpbGw6ICM3MjMzMTA7IH0KICAgIC5zdDEgeyBmaWxsOiAjOGIzZDEzOyB9CiAgICAuc3QyIHsgZmlsbDogIzVlMmEwZTsgfQogICAgLnN0MyB7IGZpbGw6ICNmMGYwZjA7IH0KICAgIC5zdDQgeyBmaWxsOiAjY2RjZGNkOyB9CiAgICAuc3Q1IHsgZmlsbDogIzMzMzsgfQogIDwvc3R5bGU+CiAgPHJlY3QgZmlsbD0iI2YwZjBmMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiLz4KICA8dGV4dCB4PSIxMDAiIHk9IjM1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IiM0NDg4ZmYiPlN0aWVmZWw8L3RleHQ+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzAsIDUwKSI+CiAgICA8IS0tIExlZnQgQm9vdCAtLT4KICAgIDxwYXRoIGQ9Ik0xMCAxMCBMMzAgMTAgTDM1IDMwIEwzNSA4MCBMNSB5MCBMMCA2MCBMMCAxMCBaIiBjbGFzcz0ic3QwIi8+CiAgICA8cGF0aCBkPSJNMTAgMTUgTDI1IDE1IEwzMCAzMCBMMzAgNzUgTDEwIDg1IEw1IDYwIEw1IDE1IFoiIGNsYXNzPSJzdDEiLz4KICAgIDxwYXRoIGQ9Ik0wIDgwIEw0MCA4MCBMNDAgOTAgTDAgOTAgWiIgY2xhc3M9InN0NSIvPgogICAgPHBhdGggZD0iTTMwIDUwIEwzMCA1NSIgc3Ryb2tlPSIjNTAyMDA5IiBzdHJva2Utd2lkdGg9IjUiLz4KICAgIDxwYXRoIGQ9Ik0zMCAzNSBMMzAgNDAiIHN0cm9rZT0iIzUwMjAwOSIgc3Ryb2tlLXdpZHRoPSI1Ii8+CiAgICA8cGF0aCBkPSJNMzAgNjUgTDMwIDcwIiBzdHJva2U9IiM1MDIwMDkiIHN0cm9rZS13aWR0aD0iNSIvPgogICAgPCEtLSBSaWdodCBCb290IC0tPgogICAgPHBhdGggZD0iTTgwIDEwIEwxMTAgMTAgTDExMCA2MCBMMTA1IDkwIEw3NSA4MCBMNzUgMzAgTDgwIDEwIFoiIGNsYXNzPSJzdDAiIHRyYW5zZm9ybT0ic2NhbGUoLTEsIDEpIiB0cmFuc2Zvcm0tb3JpZ2luPSIxMDAsIDUwIi8+CiAgICA8cGF0aCBkPSJNODUgMTUgTDEwNSAxNSBMMTA1IDYwIEwxMDAgODUgTDgwIDc1IEw4MCAzMCBMODUgMTUgWiIgY2xhc3M9InN0MSIgdHJhbnNmb3JtPSJzY2FsZSgtMSwgMSkiIHRyYW5zZm9ybS1vcmlnaW49IjEwMCwgNTAiLz4KICAgIDxwYXRoIGQ9Ik03MCA4MCBMMTA1IDgwIEwxMDUgOTAgTDcwIDkwIFoiIGNsYXNzPSJzdDUiIHRyYW5zZm9ybT0ic2NhbGUoLTEsIDEpIiB0cmFuc2Zvcm0tb3JpZ2luPSIxMDAsIDUwIi8+CiAgICA8cGF0aCBkPSJNODAgNTAgTDgwIDU1IiBzdHJva2U9IiM1MDIwMDkiIHN0cm9rZS13aWR0aD0iNSIgdHJhbnNmb3JtPSJzY2FsZSgtMSwgMSkiIHRyYW5zZm9ybS1vcmlnaW49IjEwMCwgNTAiLz4KICAgIDxwYXRoIGQ9Ik04MCAzNSBMODAgNDAiIHN0cm9rZT0iIzUwMjAwOSIgc3Ryb2tlLXdpZHRoPSI1IiB0cmFuc2Zvcm09InNjYWxlKC0xLCAxKSIgdHJhbnNmb3JtLW9yaWdpbj0iMTAwLCA1MCIvPgogICAgPHBhdGggZD0iTTgwIDY1IEw4MCA3MCIgc3Ryb2tlPSIjNTAyMDA5IiBzdHJva2Utd2lkdGg9IjUiIHRyYW5zZm9ybT0ic2NhbGUoLTEsIDEpIiB0cmFuc2Zvcm0tb3JpZ2luPSIxMDAsIDUwIi8+CiAgPC9nPgo8L3N2Zz4=';

  // Vordefinierte Motorrad-Vokabeln mit Base64-SVG-Bildern
  const motorradWords = [
    {
      id: 1,
      word: "motorcycle",
      translation: "Motorrad",
      imageUrl: motorcycleSvg,
      options: ["motorcycle", "scooter", "bicycle", "car"]
    },
    {
      id: 2,
      word: "helmet",
      translation: "Helm",
      imageUrl: helmetSvg,
      options: ["helmet", "hat", "cap", "gloves"]
    },
    {
      id: 3,
      word: "jacket",
      translation: "Jacke",
      imageUrl: jacketSvg,
      options: ["jacket", "shirt", "pants", "boots"]
    },
    {
      id: 4,
      word: "gloves",
      translation: "Handschuhe",
      imageUrl: glovesSvg,
      options: ["gloves", "socks", "helmet", "jacket"]
    },
    {
      id: 5,
      word: "boots",
      translation: "Stiefel",
      imageUrl: bootsSvg,
      options: ["boots", "shoes", "sandals", "gloves"]
    }
  ];

  // Prepare questions
  useEffect(() => {
    const topic = params.topic || 'animals';
    
    // Spezialfall: Für Motorrad-Thema verwenden wir hart-codierte Fragen
    if (topic.toLowerCase() === "motorrad") {
      console.log("Verwende fest definierte Motorrad-Fragen");
      setQuestions(motorradWords);
      return;
    }
    
    // Prüfen, ob das Thema in den vordefinierten Daten existiert
    // Ansonsten generieren wir dynamische Daten für das benutzerdefinierte Thema
    const topicData = vocabularyData[topic] || generateTopicData(topic);
    
    // Get 5 random vocabulary items (oder alle, wenn weniger als 5 verfügbar sind)
    const itemCount = Math.min(topicData.length, 5);
    const selectedVocab = getRandomItems(topicData, itemCount);
    
    // Create questions with options
    const preparedQuestions = selectedVocab.map((vocab, index) => {
      // Get 3 wrong options from other vocabulary items (oder weniger, falls nicht genug verfügbar)
      const otherWords = topicData
        .filter(v => v.word !== vocab.word)
        .map(v => v.word);
      
      const optionCount = Math.min(otherWords.length, 3);
      const wrongOptions = getRandomItems(otherWords, optionCount);
      
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
    
    // Automatisch die Antwort überprüfen, sobald eine Option ausgewählt wurde
    setIsAnswerChecked(true);
    const correct = option === currentQuestion.word;
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
      
      if (currentQuestionIndex < questions.length - 1 && lives > 0) {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswerChecked(false);
      } else {
        // Game over, either due to no more lives or all questions answered
        // Save progress and return to topic selection page
        saveProgress();
        setTimeout(() => {
          // Zurück zur Themenauswahl statt zur Erfolgsseite
          navigate('/home');
        }, 500);
      }
    }, 3000);
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
          <div className="w-full h-48 flex items-center justify-center rounded-lg mb-4 overflow-hidden bg-gray-100">
            <img 
              src={currentQuestion.imageUrl} 
              alt={currentQuestion.word} 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback zu einem garantierten Bild, wenn das Original nicht geladen werden kann
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Verhindert Endlosschleife
                
                // Themenbasiertes Bild oder ein generisches Bild
                if (params.topic.toLowerCase() === "garten") {
                  target.src = "https://cdn.pixabay.com/photo/2014/07/31/15/04/garden-406125_1280.jpg";
                } else if (params.topic.toLowerCase() === "motorrad") {
                  // Für Motorrad verwenden wir die direkten SVG-Bilder aus der Komponente
                  if (currentQuestion.word === "motorcycle") target.src = motorcycleSvg;
                  else if (currentQuestion.word === "helmet") target.src = helmetSvg;
                  else if (currentQuestion.word === "jacket") target.src = jacketSvg;
                  else if (currentQuestion.word === "gloves") target.src = glovesSvg;
                  else if (currentQuestion.word === "boots") target.src = bootsSvg;
                  else target.src = motorcycleSvg; // Fallback
                } else {
                  target.src = "https://cdn.pixabay.com/photo/2016/09/10/17/18/book-1659717_1280.jpg";
                }
              }}
            />
          </div>
          
          <div className="flex justify-between items-center mb-6">
            {/* English word is now hidden to make it more challenging */}
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

      {/* Bottom padding to prevent content being hidden by navigation */}
      <div className="h-16"></div>
    </div>
  );
};

export default VocabularyPage;
