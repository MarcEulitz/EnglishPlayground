import { useState, useEffect, useCallback } from "react";

interface AudioOptions {
  volume?: number;
  loop?: boolean;
  character?: CharacterVoice;
  emotion?: Emotion;
}

type AudioType = "correct" | "wrong" | "success" | "click";
type CharacterVoice = "mia" | "buddy" | "teacher" | "default";
type Emotion = "happy" | "excited" | "curious" | "encouraging" | "neutral";

// Sound effect files
const audioFiles = {
  correct: "https://cdn.freesound.org/previews/171/171671_2437358-lq.mp3",
  wrong: "https://cdn.freesound.org/previews/142/142608_1840739-lq.mp3",
  success: "https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3",
  click: "https://cdn.freesound.org/previews/156/156031_2538033-lq.mp3",
};

// Phrases for different scenarios by character and emotion
const characterPhrases = {
  mia: {
    correct: {
      happy: ["Super!", "Toll gemacht!", "Das stimmt!", "Richtig!"],
      excited: ["Fantastisch!", "Wunderbar!", "Das ist großartig!"],
      encouraging: ["Sehr gut!", "Genau richtig!", "Klasse gemacht!"],
    },
    wrong: {
      neutral: ["Nicht ganz.", "Versuche es noch einmal.", "Fast richtig!"],
      encouraging: ["Keine Sorge, probiere es nochmal!", "Du schaffst das!"],
    },
    greeting: {
      happy: [
        "Hallo! Ich bin Mia!",
        "Willkommen zurück!",
        "Schön, dass du da bist!",
      ],
      excited: ["Wir lernen heute Englisch!", "Es wird Spaß machen!"],
    },
  },
  buddy: {
    correct: {
      happy: ["Brilliant!", "You did it!", "That's right!"],
      excited: ["Wow, amazing!", "Excellent job!", "Fantastic!"],
      encouraging: ["Great work!", "You're doing great!"],
    },
    wrong: {
      neutral: ["Not quite.", "Let's try again.", "Almost there!"],
      encouraging: ["You can do it!", "Let's try once more!"],
    },
    greeting: {
      happy: [
        "Hi there! I'm Buddy!",
        "Ready to learn?",
        "Let's learn English together!",
      ],
      excited: ["This is going to be fun!", "I'm happy to see you!"],
    },
  },
  teacher: {
    correct: {
      happy: ["Very good!", "Excellent!", "Perfect!", "Well done!"],
      encouraging: ["Nice work!", "Good job!", "That's correct!"],
    },
    wrong: {
      neutral: ["Try again.", "Not correct.", "Let's review this."],
      encouraging: ["You're almost there!", "Another attempt, please."],
    },
    greeting: {
      happy: [
        "Welcome to class!",
        "Let's start our lesson!",
        "Ready to learn English?",
      ],
      encouraging: ["You'll do great today!", "I'm here to help you learn!"],
    },
  },
  default: {
    correct: {
      happy: ["Correct!", "Great!", "Yes!"],
      excited: ["Fantastic!", "Amazing!"],
      encouraging: ["Good job!", "Well done!"],
    },
    wrong: {
      neutral: ["Not quite.", "Try again."],
      encouraging: ["You can do it!", "Keep trying!"],
    },
    greeting: {
      happy: ["Hello!", "Welcome!"],
      excited: ["Let's go!", "Ready to learn?"],
    },
  },
};

// Voice parameters for each character
const characterVoices = {
  mia: { lang: "de-DE", pitch: 1.2, rate: 1, voiceName: "Google Deutsch" },
  buddy: {
    lang: "en-US",
    pitch: 1.1,
    rate: 1.1,
    voiceName: "Google US English",
  },
  teacher: {
    lang: "en-GB",
    pitch: 0.9,
    rate: 0.9,
    voiceName: "Google UK English Female",
  },
  default: { lang: "en-US", pitch: 1, rate: 1 },
};

const useAudio = () => {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);

  // Initialize available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Check if sound effects should be enabled from localStorage
  useEffect(() => {
    const storedPreference = localStorage.getItem("soundEffects");
    if (storedPreference !== null) {
      setAudioEnabled(storedPreference === "true");
    }
  }, []);

  const toggleAudio = useCallback(() => {
    const newValue = !audioEnabled;
    setAudioEnabled(newValue);
    localStorage.setItem("soundEffects", String(newValue));
  }, [audioEnabled]);

  const playAudio = useCallback(
    (type: AudioType, options: AudioOptions = {}) => {
      if (!audioEnabled) return;

      const { volume = 0.5, loop = false } = options;
      const audio = new Audio(audioFiles[type]);

      audio.volume = volume;
      audio.loop = loop;

      // Handle iOS Safari context - needs user interaction
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Audio play failed:", error);
        });
      }

      return audio;
    },
    [audioEnabled],
  );

  const playWord = useCallback(
    (word: string, options: AudioOptions = {}) => {
      if (!audioEnabled) return;

      const {
        volume = 0.7,
        character = "default",
        emotion = "neutral",
      } = options;

      const utterance = new SpeechSynthesisUtterance(word);

      // Apply character voice settings
      const voiceSettings = characterVoices[character];
      utterance.lang = voiceSettings.lang;
      utterance.pitch = voiceSettings.pitch;
      utterance.rate = voiceSettings.rate;
      utterance.volume = volume;

      // Try to find the requested voice
      if (voiceSettings.voiceName && availableVoices.length > 0) {
        const voice = availableVoices.find((v) =>
          v.name.includes(voiceSettings.voiceName || ""),
        );
        if (voice) {
          utterance.voice = voice;
        }
      }

      window.speechSynthesis.speak(utterance);
    },
    [audioEnabled, availableVoices],
  );

  // Play character phrases based on scenario, character, and emotion
  const playCharacterPhrase = useCallback(
    (
      scenario: "correct" | "wrong" | "greeting",
      options: AudioOptions = {},
    ) => {
      if (!audioEnabled) return;

      const { character = "mia", emotion = "happy", volume = 0.7 } = options;

      // Get phrases for this character, scenario and emotion
      // (fallback to neutral if the specific emotion isn't available)
      const characterSet =
        characterPhrases[character] || characterPhrases.default;
      const scenarioSet = characterSet[scenario] || {};
      const phrases = (scenarioSet && scenarioSet[emotion]) ||
        (scenarioSet && scenarioSet.neutral) ||
        (characterPhrases.default[scenario] &&
          characterPhrases.default[scenario].neutral) || ["Gut gemacht!"]; // Fallback-Phrase

      // Select a random phrase
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];

      // Play the phrase with the character's voice
      playWord(phrase, { character, volume });

      // For correct/wrong scenarios, also play the corresponding sound effect
      if (scenario === "correct" || scenario === "wrong") {
        playAudio(scenario, { volume: volume * 0.6 });
      }
    },
    [audioEnabled, playAudio, playWord],
  );

  return {
    audioEnabled,
    toggleAudio,
    playAudio,
    playWord,
    playCharacterPhrase,
  };
};

export default useAudio;
