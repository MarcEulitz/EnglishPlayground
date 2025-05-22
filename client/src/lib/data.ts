// Vocabulary data for different topics
export interface VocabularyItem {
  word: string;
  translation: string;
  imageUrl: string;
}

// Hier speichern wir alle benutzerdefinierten Themen
export const customTopics: Record<string, VocabularyItem[]> = {};

// Funktion, um neue Themen dynamisch zu erstellen
export function generateTopicData(topic: string): VocabularyItem[] {
  // Prüfen, ob wir dieses benutzerdefinierte Thema bereits erstellt haben
  if (customTopics[topic.toLowerCase()]) {
    console.log("Verwende gespeichertes benutzerdefiniertes Thema:", topic);
    return customTopics[topic.toLowerCase()];
  }

  // Wörterbuch mit Übersetzungen für verschiedene Themen
  const translations: Record<string, {words: string[], images: string[]}> = {
    // Möbel - Furniture
    "möbel": {
      words: ["table", "chair", "sofa", "bed", "wardrobe", "shelf", "desk", "couch", "cupboard", "drawer"],
      images: [
        "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?fit=crop&w=600&h=400", // table
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?fit=crop&w=600&h=400", // chair
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?fit=crop&w=600&h=400", // sofa
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?fit=crop&w=600&h=400", // bed
        "https://images.unsplash.com/photo-1605365070248-299a182a1a6f?fit=crop&w=600&h=400", // wardrobe
        "https://images.unsplash.com/photo-1588447606638-82e9a47d517c?fit=crop&w=600&h=400", // shelf
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?fit=crop&w=600&h=400", // desk
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?fit=crop&w=600&h=400", // couch
        "https://images.unsplash.com/photo-1594640467204-2b3408e8a5f4?fit=crop&w=600&h=400", // cupboard
        "https://images.unsplash.com/photo-1596162954151-cdcb4c0f70a8?fit=crop&w=600&h=400"  // drawer
      ]
    },
    // Häuser - Houses
    "häuser": {
      words: ["house", "apartment", "kitchen", "bathroom", "bedroom", "living room", "garden", "basement", "roof", "garage"],
      images: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?fit=crop&w=600&h=400", // house
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?fit=crop&w=600&h=400", // apartment
        "https://images.unsplash.com/photo-1556911220-bda9f7f3fe9b?fit=crop&w=600&h=400", // kitchen
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?fit=crop&w=600&h=400", // bathroom
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?fit=crop&w=600&h=400", // bedroom
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?fit=crop&w=600&h=400", // living room
        "https://images.unsplash.com/photo-1558521958-0a228e77fc99?fit=crop&w=600&h=400", // garden
        "https://images.unsplash.com/photo-1557417170-7239da1f9fb3?fit=crop&w=600&h=400", // basement
        "https://images.unsplash.com/photo-1564767609363-78b5b9c4f388?fit=crop&w=600&h=400", // roof
        "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?fit=crop&w=600&h=400"  // garage
      ]
    },
    // Geschirr - Tableware
    "geschirr": {
      words: ["plate", "cup", "glass", "fork", "knife", "spoon", "bowl", "mug", "teapot", "pan"],
      images: [
        "https://images.unsplash.com/photo-1589690432517-8c56a024bd95?fit=crop&w=600&h=400", // plate
        "https://images.unsplash.com/photo-1577937927133-66ef06acdf10?fit=crop&w=600&h=400", // cup
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?fit=crop&w=600&h=400", // glass
        "https://images.unsplash.com/photo-1608221344464-7d7e6e23d954?fit=crop&w=600&h=400", // fork
        "https://images.unsplash.com/photo-1608221344454-a95d2f4e3dc1?fit=crop&w=600&h=400", // knife
        "https://images.unsplash.com/photo-1608221344485-ba8062e158d3?fit=crop&w=600&h=400", // spoon
        "https://images.unsplash.com/photo-1557782332-76d84fb1a2aa?fit=crop&w=600&h=400", // bowl
        "https://images.unsplash.com/photo-1577937927258-89af3a453cb2?fit=crop&w=600&h=400", // mug
        "https://images.unsplash.com/photo-1608277361618-e9573ee6400e?fit=crop&w=600&h=400", // teapot
        "https://images.unsplash.com/photo-1590794056599-7d83ac9ec560?fit=crop&w=600&h=400"  // pan
      ]
    }
  };
  
  // Deutsche Übersetzungen
  const germanWords: Record<string, string[]> = {
    "möbel": ["Tisch", "Stuhl", "Sofa", "Bett", "Kleiderschrank", "Regal", "Schreibtisch", "Couch", "Schrank", "Schublade"],
    "häuser": ["Haus", "Wohnung", "Küche", "Badezimmer", "Schlafzimmer", "Wohnzimmer", "Garten", "Keller", "Dach", "Garage"],
    "geschirr": ["Teller", "Tasse", "Glas", "Gabel", "Messer", "Löffel", "Schüssel", "Becher", "Teekanne", "Pfanne"]
  };
  
  // Normalisiere den Themenname (Kleinbuchstaben, ohne Umlaute)
  // Verwende reguläre Ausdrücke mit globalem Flag, um alle Vorkommen zu ersetzen
  let normalizedTopic = topic.toLowerCase()
    .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss');
    
  console.log('Normalisiertes Thema:', normalizedTopic, 'Original:', topic);
  
  // Prüfe, ob wir dieses Thema kennen
  if (translations[normalizedTopic]) {
    const words = translations[normalizedTopic].words;
    const images = translations[normalizedTopic].images;
    const germanWordsList = germanWords[normalizedTopic] || [];
    
    // Erstelle die Vokabelitems
    return words.map((word, index) => ({
      word: word,
      translation: germanWordsList[index] || word,
      imageUrl: images[index] || 'https://images.unsplash.com/photo-1557682250-62777ba51e7a?fit=crop&w=600&h=400'
    }));
  }
  
  // Erstelle neue Vokabeln für unbekannte Themen
  // Je nach Thema werden unterschiedliche Beispiele erstellt
  
  // Vorlagen für generische Bilder
  const genericImages = [
    "https://images.unsplash.com/photo-1561089489-f13d5e730d72?fit=crop&w=600&h=400",
    "https://images.unsplash.com/photo-1546074177-ffdda98d214f?fit=crop&w=600&h=400",
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?fit=crop&w=600&h=400",
    "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?fit=crop&w=600&h=400",
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?fit=crop&w=600&h=400"
  ];
  
  // Vokabeln basierend auf dem Thema generieren
  let genericVocab: VocabularyItem[] = [];
  
  // Thema: Hobby
  if (topic.toLowerCase() === "hobby" || topic.toLowerCase() === "hobbys") {
    genericVocab = [
      { word: "reading", translation: "Lesen", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?fit=crop&w=600&h=400" },
      { word: "hiking", translation: "Wandern", imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?fit=crop&w=600&h=400" },
      { word: "painting", translation: "Malen", imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?fit=crop&w=600&h=400" },
      { word: "swimming", translation: "Schwimmen", imageUrl: "https://images.unsplash.com/photo-1560090995-dff67ad82687?fit=crop&w=600&h=400" },
      { word: "cooking", translation: "Kochen", imageUrl: "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?fit=crop&w=600&h=400" }
    ];
  }
  // Thema: Sport
  else if (topic.toLowerCase() === "sport" || topic.toLowerCase() === "sports") {
    genericVocab = [
      { word: "football", translation: "Fußball", imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?fit=crop&w=600&h=400" },
      { word: "basketball", translation: "Basketball", imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?fit=crop&w=600&h=400" },
      { word: "tennis", translation: "Tennis", imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?fit=crop&w=600&h=400" },
      { word: "running", translation: "Laufen", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?fit=crop&w=600&h=400" },
      { word: "swimming", translation: "Schwimmen", imageUrl: "https://images.unsplash.com/photo-1560090995-dff67ad82687?fit=crop&w=600&h=400" }
    ];
  }
  // Thema: Möbel - wenn der Benutzer es so eingegeben hat, aber die Normalisierung nicht funktionierte
  else if (topic.toLowerCase() === "möbel" || topic.toLowerCase().includes("mobel")) {
    genericVocab = [
      { word: "table", translation: "Tisch", imageUrl: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?fit=crop&w=600&h=400" },
      { word: "chair", translation: "Stuhl", imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?fit=crop&w=600&h=400" },
      { word: "sofa", translation: "Sofa", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?fit=crop&w=600&h=400" },
      { word: "bed", translation: "Bett", imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?fit=crop&w=600&h=400" },
      { word: "wardrobe", translation: "Kleiderschrank", imageUrl: "https://images.unsplash.com/photo-1556020685-ae41abfc9365?fit=crop&w=600&h=400" }
    ];
  }
  // Thema: Häuser
  else if (topic.toLowerCase() === "häuser" || topic.toLowerCase().includes("hauser")) {
    genericVocab = [
      { word: "house", translation: "Haus", imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?fit=crop&w=600&h=400" },
      { word: "apartment", translation: "Wohnung", imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?fit=crop&w=600&h=400" },
      { word: "kitchen", translation: "Küche", imageUrl: "https://images.unsplash.com/photo-1556911220-bda9f7f3fe9b?fit=crop&w=600&h=400" },
      { word: "bathroom", translation: "Badezimmer", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?fit=crop&w=600&h=400" },
      { word: "bedroom", translation: "Schlafzimmer", imageUrl: "https://images.unsplash.com/photo-1540518614846-7eded433c457?fit=crop&w=600&h=400" }
    ];
  }
  // Thema: Geschirr
  else if (topic.toLowerCase() === "geschirr") {
    genericVocab = [
      { word: "plate", translation: "Teller", imageUrl: "https://images.unsplash.com/photo-1589690432517-8c56a024bd95?fit=crop&w=600&h=400" },
      { word: "cup", translation: "Tasse", imageUrl: "https://images.unsplash.com/photo-1577937927133-66ef06acdf10?fit=crop&w=600&h=400" },
      { word: "glass", translation: "Glas", imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?fit=crop&w=600&h=400" },
      { word: "fork", translation: "Gabel", imageUrl: "https://images.unsplash.com/photo-1608221344464-7d7e6e23d954?fit=crop&w=600&h=400" },
      { word: "knife", translation: "Messer", imageUrl: "https://images.unsplash.com/photo-1608221344454-a95d2f4e3dc1?fit=crop&w=600&h=400" }
    ];
  }
  // Thema: Fahrzeuge
  else if (topic.toLowerCase() === "fahrzeuge" || topic.toLowerCase() === "autos") {
    genericVocab = [
      { word: "car", translation: "Auto", imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?fit=crop&w=600&h=400" },
      { word: "bicycle", translation: "Fahrrad", imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?fit=crop&w=600&h=400" },
      { word: "bus", translation: "Bus", imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?fit=crop&w=600&h=400" },
      { word: "train", translation: "Zug", imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?fit=crop&w=600&h=400" },
      { word: "airplane", translation: "Flugzeug", imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?fit=crop&w=600&h=400" }
    ];
  }
  // Andere Themen - generische Vokabeln
  else {
    genericVocab = [
      { word: "first", translation: topic + " Wort 1", imageUrl: genericImages[0] },
      { word: "second", translation: topic + " Wort 2", imageUrl: genericImages[1] },
      { word: "third", translation: topic + " Wort 3", imageUrl: genericImages[2] },
      { word: "fourth", translation: topic + " Wort 4", imageUrl: genericImages[3] },
      { word: "fifth", translation: topic + " Wort 5", imageUrl: genericImages[4] }
    ];
  }
  
  // Speichere diese Vokabeln für zukünftige Verwendung
  customTopics[topic.toLowerCase()] = genericVocab;
  
  return genericVocab;
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
