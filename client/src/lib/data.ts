// Vocabulary data for different topics
export interface VocabularyItem {
  word: string;
  translation: string;
  imageUrl: string;
}

export const vocabularyData: Record<string, VocabularyItem[]> = {
  animals: [
    {
      word: "cat",
      translation: "Katze",
      imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400"
    },
    {
      word: "dog",
      translation: "Hund",
      imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?fit=crop&w=600&h=400"
    },
    {
      word: "bird",
      translation: "Vogel",
      imageUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86797?fit=crop&w=600&h=400"
    },
    {
      word: "mouse",
      translation: "Maus",
      imageUrl: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?fit=crop&w=600&h=400"
    },
    {
      word: "rabbit",
      translation: "Kaninchen",
      imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?fit=crop&w=600&h=400"
    },
    {
      word: "fish",
      translation: "Fisch",
      imageUrl: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?fit=crop&w=600&h=400"
    },
    {
      word: "horse",
      translation: "Pferd",
      imageUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400"
    },
    {
      word: "cow",
      translation: "Kuh",
      imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?fit=crop&w=600&h=400"
    },
    {
      word: "lion",
      translation: "Löwe",
      imageUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?fit=crop&w=600&h=400"
    },
    {
      word: "elephant",
      translation: "Elefant",
      imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?fit=crop&w=600&h=400"
    }
  ],
  colors: [
    {
      word: "red",
      translation: "rot",
      imageUrl: "https://images.unsplash.com/photo-1531804055935-76f44d7c3621?fit=crop&w=600&h=400"
    },
    {
      word: "blue",
      translation: "blau",
      imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?fit=crop&w=600&h=400"
    },
    {
      word: "green",
      translation: "grün",
      imageUrl: "https://images.unsplash.com/photo-1564419320461-6870880221ad?fit=crop&w=600&h=400"
    },
    {
      word: "yellow",
      translation: "gelb",
      imageUrl: "https://images.unsplash.com/photo-1557800636-894a64c1696f?fit=crop&w=600&h=400"
    },
    {
      word: "black",
      translation: "schwarz",
      imageUrl: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?fit=crop&w=600&h=400"
    },
    {
      word: "white",
      translation: "weiß",
      imageUrl: "https://images.unsplash.com/photo-1558470598-a5dda9640f68?fit=crop&w=600&h=400"
    },
    {
      word: "purple",
      translation: "lila",
      imageUrl: "https://images.unsplash.com/photo-1564419229895-7bd50f3abb13?fit=crop&w=600&h=400"
    },
    {
      word: "orange",
      translation: "orange",
      imageUrl: "https://images.unsplash.com/photo-1557800634-7bf3c7305596?fit=crop&w=600&h=400"
    }
  ],
  numbers: [
    {
      word: "one",
      translation: "eins",
      imageUrl: "https://images.unsplash.com/photo-1596448215038-2ce720a84319?fit=crop&w=600&h=400"
    },
    {
      word: "two",
      translation: "zwei",
      imageUrl: "https://images.unsplash.com/photo-1596448215038-2ce720a84319?fit=crop&w=600&h=400"
    },
    {
      word: "three",
      translation: "drei",
      imageUrl: "https://images.unsplash.com/photo-1596448215038-2ce720a84319?fit=crop&w=600&h=400"
    },
    {
      word: "four",
      translation: "vier",
      imageUrl: "https://images.unsplash.com/photo-1596448215038-2ce720a84319?fit=crop&w=600&h=400"
    },
    {
      word: "five",
      translation: "fünf",
      imageUrl: "https://images.unsplash.com/photo-1596448215038-2ce720a84319?fit=crop&w=600&h=400"
    },
    {
      word: "six",
      translation: "sechs",
      imageUrl: "https://images.unsplash.com/photo-1596448215038-2ce720a84319?fit=crop&w=600&h=400"
    },
    {
      word: "seven",
      translation: "sieben",
      imageUrl: "https://images.unsplash.com/photo-1596448215038-2ce720a84319?fit=crop&w=600&h=400"
    },
    {
      word: "eight",
      translation: "acht",
      imageUrl: "https://images.unsplash.com/photo-1596448215038-2ce720a84319?fit=crop&w=600&h=400"
    },
    {
      word: "nine",
      translation: "neun",
      imageUrl: "https://images.unsplash.com/photo-1596448215038-2ce720a84319?fit=crop&w=600&h=400"
    },
    {
      word: "ten",
      translation: "zehn",
      imageUrl: "https://images.unsplash.com/photo-1596448215038-2ce720a84319?fit=crop&w=600&h=400"
    }
  ],
  family: [
    {
      word: "mother",
      translation: "Mutter",
      imageUrl: "https://images.unsplash.com/photo-1540479859555-17af45c78602?fit=crop&w=600&h=400"
    },
    {
      word: "father",
      translation: "Vater",
      imageUrl: "https://images.unsplash.com/photo-1565538420870-da08ff96a207?fit=crop&w=600&h=400"
    },
    {
      word: "sister",
      translation: "Schwester",
      imageUrl: "https://images.unsplash.com/photo-1543342384-1f1350e27861?fit=crop&w=600&h=400"
    },
    {
      word: "brother",
      translation: "Bruder",
      imageUrl: "https://images.unsplash.com/photo-1511551203524-9a24350a5771?fit=crop&w=600&h=400"
    },
    {
      word: "grandmother",
      translation: "Großmutter",
      imageUrl: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?fit=crop&w=600&h=400"
    },
    {
      word: "grandfather",
      translation: "Großvater",
      imageUrl: "https://images.unsplash.com/photo-1605457867610-e640a7339009?fit=crop&w=600&h=400"
    },
    {
      word: "baby",
      translation: "Baby",
      imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?fit=crop&w=600&h=400"
    }
  ]
};

// Gap-fill exercises for different topics
export interface GapFillItem {
  sentence: string[];
  gapIndex: number;
  correctWord: string;
  imageUrl: string;
}

export const gapFillData: Record<string, GapFillItem[]> = {
  animals: [
    {
      sentence: ["The", "boy", "has", "a", "", "."],
      gapIndex: 4,
      correctWord: "dog",
      imageUrl: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?fit=crop&w=600&h=400"
    },
    {
      sentence: ["I", "like", "my", "", "very", "much", "."],
      gapIndex: 3,
      correctWord: "cat",
      imageUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "", "is", "swimming", "in", "the", "water", "."],
      gapIndex: 1,
      correctWord: "fish",
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "", "is", "jumping", "high", "."],
      gapIndex: 1,
      correctWord: "horse",
      imageUrl: "https://images.unsplash.com/photo-1598974357801-cbca100e65d3?fit=crop&w=600&h=400"
    },
    {
      sentence: ["Look", "at", "the", "", "in", "the", "tree", "."],
      gapIndex: 3,
      correctWord: "bird",
      imageUrl: "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?fit=crop&w=600&h=400"
    }
  ],
  colors: [
    {
      sentence: ["The", "apple", "is", "", "."],
      gapIndex: 3,
      correctWord: "red",
      imageUrl: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "sky", "is", "", "."],
      gapIndex: 3,
      correctWord: "blue",
      imageUrl: "https://images.unsplash.com/photo-1514454529242-9e4677563e7b?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "banana", "is", "", "."],
      gapIndex: 3,
      correctWord: "yellow",
      imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "grass", "is", "", "."],
      gapIndex: 3,
      correctWord: "green",
      imageUrl: "https://images.unsplash.com/photo-1528495612343-9ca9f4a9f67c?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "snow", "is", "", "."],
      gapIndex: 3,
      correctWord: "white",
      imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?fit=crop&w=600&h=400"
    }
  ],
  numbers: [
    {
      sentence: ["She", "has", "", "cat", "."],
      gapIndex: 2,
      correctWord: "one",
      imageUrl: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?fit=crop&w=600&h=400"
    },
    {
      sentence: ["He", "has", "", "dogs", "."],
      gapIndex: 2,
      correctWord: "two",
      imageUrl: "https://images.unsplash.com/photo-1549291981-56d443d5e2a2?fit=crop&w=600&h=400"
    },
    {
      sentence: ["There", "are", "", "birds", "in", "the", "tree", "."],
      gapIndex: 2,
      correctWord: "three",
      imageUrl: "https://images.unsplash.com/photo-1549619856-ac562a3ed1a3?fit=crop&w=600&h=400"
    },
    {
      sentence: ["I", "have", "", "fingers", "on", "each", "hand", "."],
      gapIndex: 2,
      correctWord: "five",
      imageUrl: "https://images.unsplash.com/photo-1583065643211-0df753225309?fit=crop&w=600&h=400"
    },
    {
      sentence: ["She", "is", "", "years", "old", "."],
      gapIndex: 2,
      correctWord: "ten",
      imageUrl: "https://images.unsplash.com/photo-1484665754804-74b091e253e3?fit=crop&w=600&h=400"
    }
  ],
  family: [
    {
      sentence: ["My", "", "is", "cooking", "dinner", "."],
      gapIndex: 1,
      correctWord: "mother",
      imageUrl: "https://images.unsplash.com/photo-1551516594-56cb78394645?fit=crop&w=600&h=400"
    },
    {
      sentence: ["My", "", "is", "reading", "a", "book", "."],
      gapIndex: 1,
      correctWord: "father",
      imageUrl: "https://images.unsplash.com/photo-1488654715439-fbf461f0eb8d?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "", "is", "playing", "with", "toys", "."],
      gapIndex: 1,
      correctWord: "baby",
      imageUrl: "https://images.unsplash.com/photo-1485423036251-8b2a2909899f?fit=crop&w=600&h=400"
    },
    {
      sentence: ["My", "", "is", "older", "than", "me", "."],
      gapIndex: 1,
      correctWord: "sister",
      imageUrl: "https://images.unsplash.com/photo-1511085248744-86226c8fa2a8?fit=crop&w=600&h=400"
    },
    {
      sentence: ["My", "", "tells", "great", "stories", "."],
      gapIndex: 1,
      correctWord: "grandfather",
      imageUrl: "https://images.unsplash.com/photo-1603415814096-c7c5068c5187?fit=crop&w=600&h=400"
    }
  ]
};

// Achievement data
export interface AchievementData {
  type: 'trophy' | 'sticker';
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'completions' | 'score' | 'streak';
    value: number;
    topic?: string;
  };
}

export const achievementData: AchievementData[] = [
  {
    type: 'trophy',
    name: 'animalsExperte',
    description: 'Du kennst jetzt viele Tiere auf Englisch!',
    icon: 'ri-trophy-fill',
    requirement: {
      type: 'score',
      value: 4,
      topic: 'animals'
    }
  },
  {
    type: 'trophy',
    name: 'colorsExperte',
    description: 'Du kennst jetzt viele Farben auf Englisch!',
    icon: 'ri-trophy-fill',
    requirement: {
      type: 'score',
      value: 4,
      topic: 'colors'
    }
  },
  {
    type: 'trophy',
    name: 'numbersExperte',
    description: 'Du kennst jetzt viele Zahlen auf Englisch!',
    icon: 'ri-trophy-fill',
    requirement: {
      type: 'score',
      value: 4,
      topic: 'numbers'
    }
  },
  {
    type: 'trophy',
    name: 'familyExperte',
    description: 'Du kennst jetzt viele Familienwörter auf Englisch!',
    icon: 'ri-trophy-fill',
    requirement: {
      type: 'score',
      value: 4,
      topic: 'family'
    }
  },
  {
    type: 'sticker',
    name: 'animalsFleißig',
    description: 'Du hast 3 Übungen zum Thema Tiere gemacht!',
    icon: 'ri-price-tag-3-fill',
    requirement: {
      type: 'completions',
      value: 3,
      topic: 'animals'
    }
  },
  {
    type: 'sticker',
    name: 'colorsFleißig',
    description: 'Du hast 3 Übungen zum Thema Farben gemacht!',
    icon: 'ri-price-tag-3-fill',
    requirement: {
      type: 'completions',
      value: 3,
      topic: 'colors'
    }
  },
  {
    type: 'sticker',
    name: 'numbersFleißig',
    description: 'Du hast 3 Übungen zum Thema Zahlen gemacht!',
    icon: 'ri-price-tag-3-fill',
    requirement: {
      type: 'completions',
      value: 3,
      topic: 'numbers'
    }
  },
  {
    type: 'sticker',
    name: 'familyFleißig',
    description: 'Du hast 3 Übungen zum Thema Familie gemacht!',
    icon: 'ri-price-tag-3-fill',
    requirement: {
      type: 'completions',
      value: 3,
      topic: 'family'
    }
  },
  {
    type: 'trophy',
    name: 'Lernstar',
    description: '3 Tage in Folge gelernt!',
    icon: 'ri-star-fill',
    requirement: {
      type: 'streak',
      value: 3
    }
  },
  {
    type: 'trophy',
    name: 'Perfektionist',
    description: '100% richtig in einer Übung!',
    icon: 'ri-check-double-line',
    requirement: {
      type: 'score',
      value: 5
    }
  }
];

// Topic icons and colors
export const topicData = {
  animals: {
    icon: 'ri-bear-smile-line',
    color: 'secondary'
  },
  colors: {
    icon: 'ri-palette-line',
    color: 'accent'
  },
  numbers: {
    icon: 'ri-numbers-line',
    color: 'primary'
  },
  family: {
    icon: 'ri-group-line',
    color: 'destructive'
  }
};
