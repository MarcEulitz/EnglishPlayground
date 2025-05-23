// Vocabulary data for different topics
export interface VocabularyItem {
  word: string;
  translation: string;
  imageUrl: string;
}

// Hier speichern wir alle benutzerdefinierten Themen
export const customTopics: Record<string, VocabularyItem[]> = {};

// Fixierte Daten für das Motorrad-Thema mit hochwertigen SVG-Bildern
const motorradVocab: VocabularyItem[] = [
  { 
    word: "motorcycle", 
    translation: "Motorrad", 
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Cdefs%3E%3ClinearGradient id='bike' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ff4444'/%3E%3Cstop offset='100%25' stop-color='%23cc0000'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle fill='%23222' cx='40' cy='85' r='25'/%3E%3Ccircle fill='%23444' cx='40' cy='85' r='18'/%3E%3Ccircle fill='%23222' cx='160' cy='85' r='25'/%3E%3Ccircle fill='%23444' cx='160' cy='85' r='18'/%3E%3Cpath fill='url(%23bike)' d='M65 60 L135 60 L150 75 L135 75 L65 75 Z'/%3E%3Cpath stroke='%23333' stroke-width='4' fill='none' d='M65 75 L90 45 L130 45'/%3E%3Cpath stroke='%23666' stroke-width='3' fill='none' d='M40 85 L65 75 L160 85'/%3E%3Ccircle fill='%23333' cx='100' cy='40' r='8'/%3E%3C/svg%3E"
  },
  { 
    word: "helmet", 
    translation: "Helm", 
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Cdefs%3E%3ClinearGradient id='helmet' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ff0000'/%3E%3Cstop offset='100%25' stop-color='%23990000'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cellipse fill='url(%23helmet)' cx='100' cy='60' rx='45' ry='35'/%3E%3Crect fill='%23333' width='50' height='12' x='75' y='55' rx='6'/%3E%3Cellipse fill='%23666' cx='100' cy='35' rx='15' ry='8'/%3E%3C/svg%3E"
  },
  { 
    word: "wheel", 
    translation: "Rad", 
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Ccircle fill='%23222' cx='100' cy='60' r='45'/%3E%3Ccircle fill='%23444' cx='100' cy='60' r='35'/%3E%3Ccircle fill='%23666' cx='100' cy='60' r='25'/%3E%3Ccircle fill='%23999' cx='100' cy='60' r='10'/%3E%3Cpath stroke='%23333' stroke-width='3' d='M100 25 L100 95 M75 35 L125 85 M125 35 L75 85 M65 60 L135 60'/%3E%3C/svg%3E"
  },
  { 
    word: "engine", 
    translation: "Motor", 
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect fill='%23555' width='80' height='50' x='60' y='35' rx='8'/%3E%3Crect fill='%23777' width='60' height='30' x='70' y='45' rx='4'/%3E%3Crect fill='%23333' width='20' height='15' x='50' y='50'/%3E%3Crect fill='%23333' width='20' height='15' x='130' y='50'/%3E%3Ccircle fill='%23ff4444' cx='100' cy='25' r='8'/%3E%3Cpath stroke='%23999' stroke-width='2' d='M80 35 L80 20 M120 35 L120 20'/%3E%3C/svg%3E"
  },
  { 
    word: "speed", 
    translation: "Geschwindigkeit", 
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Cpath stroke='%23ff4444' stroke-width='6' fill='none' d='M30 60 L60 40 L90 60 L120 40 L150 60 L180 40'/%3E%3Cpath stroke='%23ff6666' stroke-width='4' fill='none' d='M35 75 L65 60 L95 75 L125 60 L155 75 L185 60'/%3E%3Cpath stroke='%23ff8888' stroke-width='3' fill='none' d='M40 90 L70 80 L100 90 L130 80 L160 90'/%3E%3C/svg%3E"
  }
];

// Funktion, um neue Themen dynamisch zu erstellen
export function generateTopicData(topic: string): VocabularyItem[] {
  // Spezieller Fall für das Motorrad-Thema
  if (topic.toLowerCase() === "motorrad") {
    console.log("Verwende feste Motorrad-Vokabeln");
    return motorradVocab;
  }
  
  // Lösche den Cache für alle anderen benutzerdefinierten Themen
  delete customTopics[topic.toLowerCase()];

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
      { word: "car", translation: "Auto", imageUrl: "https://cdn.pixabay.com/photo/2015/05/28/23/12/auto-788747_1280.jpg" },
      { word: "bicycle", translation: "Fahrrad", imageUrl: "https://cdn.pixabay.com/photo/2016/11/18/12/49/bicycle-1834265_1280.jpg" },
      { word: "bus", translation: "Bus", imageUrl: "https://cdn.pixabay.com/photo/2016/01/08/14/30/bus-1127787_1280.jpg" },
      { word: "train", translation: "Zug", imageUrl: "https://cdn.pixabay.com/photo/2016/07/29/19/18/train-1555348_1280.jpg" },
      { word: "airplane", translation: "Flugzeug", imageUrl: "https://cdn.pixabay.com/photo/2016/09/07/11/37/tropical-1651426_1280.jpg" }
    ];
  }
  // Thema: Garten
  else if (topic.toLowerCase() === "garten") {
    genericVocab = [
      { word: "garden", translation: "Garten", imageUrl: "https://cdn.pixabay.com/photo/2014/07/31/15/04/garden-406125_1280.jpg" },
      { word: "flower", translation: "Blume", imageUrl: "https://cdn.pixabay.com/photo/2015/04/19/08/32/rose-729509_1280.jpg" },
      { word: "tree", translation: "Baum", imageUrl: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg" },
      { word: "grass", translation: "Gras", imageUrl: "https://cdn.pixabay.com/photo/2017/05/11/20/48/green-2305489_1280.jpg" },
      { word: "bench", translation: "Bank", imageUrl: "https://cdn.pixabay.com/photo/2015/11/07/11/28/park-bench-1031332_1280.jpg" }
    ];
  }
  // Thema: Numbers/Zahlen
  else if (topic.toLowerCase() === "numbers" || topic.toLowerCase() === "zahlen") {
    genericVocab = [
      { word: "one", translation: "Eins", imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect fill='%23f0f0f0' width='200' height='120'/%3E%3Ctext x='100' y='70' text-anchor='middle' font-size='60' font-weight='bold' fill='%2344ff44'%3E1%3C/text%3E%3C/svg%3E" },
      { word: "two", translation: "Zwei", imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect fill='%23f0f0f0' width='200' height='120'/%3E%3Ctext x='100' y='70' text-anchor='middle' font-size='60' font-weight='bold' fill='%23ff4444'%3E2%3C/text%3E%3C/svg%3E" },
      { word: "three", translation: "Drei", imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect fill='%23f0f0f0' width='200' height='120'/%3E%3Ctext x='100' y='70' text-anchor='middle' font-size='60' font-weight='bold' fill='%234444ff'%3E3%3C/text%3E%3C/svg%3E" },
      { word: "four", translation: "Vier", imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect fill='%23f0f0f0' width='200' height='120'/%3E%3Ctext x='100' y='70' text-anchor='middle' font-size='60' font-weight='bold' fill='%23ff8800'%3E4%3C/text%3E%3C/svg%3E" },
      { word: "five", translation: "Fünf", imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect fill='%23f0f0f0' width='200' height='120'/%3E%3Ctext x='100' y='70' text-anchor='middle' font-size='60' font-weight='bold' fill='%238800ff'%3E5%3C/text%3E%3C/svg%3E" }
    ];
  }
  // Thema: Family/Familie
  else if (topic.toLowerCase() === "family" || topic.toLowerCase() === "familie") {
    genericVocab = [
      { word: "mother", translation: "Mutter", imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?fit=crop&w=600&h=400" },
      { word: "father", translation: "Vater", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&w=600&h=400" },
      { word: "brother", translation: "Bruder", imageUrl: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?fit=crop&w=600&h=400" },
      { word: "sister", translation: "Schwester", imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fit=crop&w=600&h=400" },
      { word: "baby", translation: "Baby", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?fit=crop&w=600&h=400" }
    ];
  }
  // Andere Themen - standardisierte Vokabeln mit besseren Namen statt nur Nummern
  else {
    // Typische Wörter und Übersetzungen für unbekannte Themen
    const typicalWords = [
      { english: "important", german: "wichtig" },
      { english: "beautiful", german: "schön" },
      { english: "interesting", german: "interessant" },
      { english: "useful", german: "nützlich" },
      { english: "special", german: "besonders" }
    ];
    
    genericVocab = [
      { 
        word: typicalWords[0].english, 
        translation: typicalWords[0].german, 
        imageUrl: genericImages[0] 
      },
      { 
        word: typicalWords[1].english, 
        translation: typicalWords[1].german, 
        imageUrl: genericImages[1] 
      },
      { 
        word: typicalWords[2].english, 
        translation: typicalWords[2].german, 
        imageUrl: genericImages[2] 
      },
      { 
        word: typicalWords[3].english, 
        translation: typicalWords[3].german, 
        imageUrl: genericImages[3] 
      },
      { 
        word: typicalWords[4].english, 
        translation: typicalWords[4].german, 
        imageUrl: genericImages[4] 
      }
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
      imageUrl: "https://images.unsplash.com/photo-1563804447974-0f954a157bef?fit=crop&w=600&h=400"
    },
    {
      word: "brown",
      translation: "braun",
      imageUrl: "https://images.unsplash.com/photo-1541387809875-7fa64a9fbcdd?fit=crop&w=600&h=400"
    },
    {
      word: "pink",
      translation: "rosa",
      imageUrl: "https://images.unsplash.com/photo-1564419229766-39e9d067c7eb?fit=crop&w=600&h=400"
    }
  ],
  food: [
    {
      word: "apple",
      translation: "Apfel",
      imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?fit=crop&w=600&h=400"
    },
    {
      word: "bread",
      translation: "Brot",
      imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?fit=crop&w=600&h=400"
    },
    {
      word: "cheese",
      translation: "Käse",
      imageUrl: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b?fit=crop&w=600&h=400"
    },
    {
      word: "potato",
      translation: "Kartoffel",
      imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?fit=crop&w=600&h=400"
    },
    {
      word: "tomato",
      translation: "Tomate",
      imageUrl: "https://images.unsplash.com/photo-1561136594-7f68413baa99?fit=crop&w=600&h=400"
    },
    {
      word: "chicken",
      translation: "Huhn",
      imageUrl: "https://images.unsplash.com/photo-1546548970-71785318a17b?fit=crop&w=600&h=400"
    },
    {
      word: "egg",
      translation: "Ei",
      imageUrl: "https://images.unsplash.com/photo-1552663651-2e4250e6c7c8?fit=crop&w=600&h=400"
    },
    {
      word: "milk",
      translation: "Milch",
      imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?fit=crop&w=600&h=400"
    },
    {
      word: "banana",
      translation: "Banane",
      imageUrl: "https://images.unsplash.com/photo-1526364163643-89405f33c1d8?fit=crop&w=600&h=400"
    },
    {
      word: "carrot",
      translation: "Karotte",
      imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?fit=crop&w=600&h=400"
    }
  ],
  school: [
    {
      word: "pen",
      translation: "Stift",
      imageUrl: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?fit=crop&w=600&h=400"
    },
    {
      word: "pencil",
      translation: "Bleistift",
      imageUrl: "https://images.unsplash.com/photo-1596254769041-7ca77c96f04a?fit=crop&w=600&h=400"
    },
    {
      word: "notebook",
      translation: "Heft",
      imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?fit=crop&w=600&h=400"
    },
    {
      word: "book",
      translation: "Buch",
      imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?fit=crop&w=600&h=400"
    },
    {
      word: "ruler",
      translation: "Lineal",
      imageUrl: "https://images.unsplash.com/photo-1519167874167-2860fc3e55a9?fit=crop&w=600&h=400"
    },
    {
      word: "backpack",
      translation: "Rucksack",
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?fit=crop&w=600&h=400"
    },
    {
      word: "scissors",
      translation: "Schere",
      imageUrl: "https://images.unsplash.com/photo-1547333101-6bb18e609b2f?fit=crop&w=600&h=400"
    },
    {
      word: "glue",
      translation: "Kleber",
      imageUrl: "https://images.unsplash.com/photo-1562246229-37b3069e9f1e?fit=crop&w=600&h=400"
    },
    {
      word: "eraser",
      translation: "Radiergummi",
      imageUrl: "https://images.unsplash.com/photo-1595952387747-469ababa2225?fit=crop&w=600&h=400"
    },
    {
      word: "calculator",
      translation: "Taschenrechner",
      imageUrl: "https://images.unsplash.com/photo-1586449480584-34302e933441?fit=crop&w=600&h=400"
    }
  ],
  body: [
    {
      word: "head",
      translation: "Kopf",
      imageUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?fit=crop&w=600&h=400"
    },
    {
      word: "hand",
      translation: "Hand",
      imageUrl: "https://images.unsplash.com/photo-1527633412983-d80af308e660?fit=crop&w=600&h=400"
    },
    {
      word: "foot",
      translation: "Fuß",
      imageUrl: "https://images.unsplash.com/photo-1550324790-389e48f6a6ae?fit=crop&w=600&h=400"
    },
    {
      word: "eye",
      translation: "Auge",
      imageUrl: "https://images.unsplash.com/photo-1559001625-569674cf4ab4?fit=crop&w=600&h=400"
    },
    {
      word: "nose",
      translation: "Nase",
      imageUrl: "https://images.unsplash.com/photo-1589392954089-8b7a77c842c8?fit=crop&w=600&h=400"
    },
    {
      word: "mouth",
      translation: "Mund",
      imageUrl: "https://images.unsplash.com/photo-1581512798633-9d17cd32d8c5?fit=crop&w=600&h=400"
    },
    {
      word: "ear",
      translation: "Ohr",
      imageUrl: "https://images.unsplash.com/photo-1583323856340-b12ff42381eb?fit=crop&w=600&h=400"
    },
    {
      word: "leg",
      translation: "Bein",
      imageUrl: "https://images.unsplash.com/photo-1603069889648-7159c05068e5?fit=crop&w=600&h=400"
    },
    {
      word: "arm",
      translation: "Arm",
      imageUrl: "https://images.unsplash.com/photo-1526889576439-7da0d25901bc?fit=crop&w=600&h=400"
    },
    {
      word: "hair",
      translation: "Haar",
      imageUrl: "https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?fit=crop&w=600&h=400"
    }
  ]
};

// Struktur für Gap-fill Aufgaben
export interface GapFillItem {
  sentence: string[];
  gapIndex: number;
  correctWord: string;
  imageUrl: string;
}

// Gap-fill Übungen
export const gapFillData: Record<string, GapFillItem[]> = {
  animals: [
    {
      sentence: ["The", "", "is", "chasing", "a", "mouse"],
      gapIndex: 1,
      correctWord: "cat",
      imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "", "is", "barking", "loudly"],
      gapIndex: 1,
      correctWord: "dog",
      imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "", "is", "flying", "in", "the", "sky"],
      gapIndex: 1,
      correctWord: "bird",
      imageUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86797?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "", "is", "swimming", "in", "the", "water"],
      gapIndex: 1,
      correctWord: "fish",
      imageUrl: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "", "is", "eating", "a", "carrot"],
      gapIndex: 1,
      correctWord: "rabbit",
      imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?fit=crop&w=600&h=400"
    }
  ],
  colors: [
    {
      sentence: ["The", "apple", "is", ""],
      gapIndex: 3,
      correctWord: "red",
      imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "sky", "is", ""],
      gapIndex: 3,
      correctWord: "blue",
      imageUrl: "https://images.unsplash.com/photo-1528495612343-9ca9f4a9f67c?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "grass", "is", ""],
      gapIndex: 3,
      correctWord: "green",
      imageUrl: "https://images.unsplash.com/photo-1564419320461-6870880221ad?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "banana", "is", ""],
      gapIndex: 3,
      correctWord: "yellow",
      imageUrl: "https://images.unsplash.com/photo-1526364163643-89405f33c1d8?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "snow", "is", ""],
      gapIndex: 3,
      correctWord: "white",
      imageUrl: "https://images.unsplash.com/photo-1578505427953-99771217a626?fit=crop&w=600&h=400"
    }
  ],
  food: [
    {
      sentence: ["I", "eat", "an", "", "every", "day"],
      gapIndex: 3,
      correctWord: "apple",
      imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?fit=crop&w=600&h=400"
    },
    {
      sentence: ["I", "like", "", "and", "butter"],
      gapIndex: 2,
      correctWord: "bread",
      imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "", "has", "two", "eggs"],
      gapIndex: 1,
      correctWord: "chicken",
      imageUrl: "https://images.unsplash.com/photo-1546548970-71785318a17b?fit=crop&w=600&h=400"
    },
    {
      sentence: ["I", "drink", "", "for", "breakfast"],
      gapIndex: 2,
      correctWord: "milk",
      imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?fit=crop&w=600&h=400"
    },
    {
      sentence: ["The", "", "is", "orange", "and", "healthy"],
      gapIndex: 1,
      correctWord: "carrot",
      imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?fit=crop&w=600&h=400"
    }
  ],
  school: [
    {
      sentence: ["I", "write", "with", "a", ""],
      gapIndex: 4,
      correctWord: "pen",
      imageUrl: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?fit=crop&w=600&h=400"
    },
    {
      sentence: ["I", "read", "a", "", "about", "animals"],
      gapIndex: 3,
      correctWord: "book",
      imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?fit=crop&w=600&h=400"
    },
    {
      sentence: ["My", "", "has", "many", "books", "inside"],
      gapIndex: 1,
      correctWord: "backpack",
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?fit=crop&w=600&h=400"
    },
    {
      sentence: ["I", "cut", "paper", "with", ""],
      gapIndex: 4,
      correctWord: "scissors",
      imageUrl: "https://images.unsplash.com/photo-1547333101-6bb18e609b2f?fit=crop&w=600&h=400"
    },
    {
      sentence: ["I", "use", "an", "", "to", "remove", "mistakes"],
      gapIndex: 3,
      correctWord: "eraser",
      imageUrl: "https://images.unsplash.com/photo-1595952387747-469ababa2225?fit=crop&w=600&h=400"
    }
  ],
  body: [
    {
      sentence: ["I", "see", "with", "my", ""],
      gapIndex: 4,
      correctWord: "eyes",
      imageUrl: "https://images.unsplash.com/photo-1559001625-569674cf4ab4?fit=crop&w=600&h=400"
    },
    {
      sentence: ["I", "hear", "with", "my", ""],
      gapIndex: 4,
      correctWord: "ears",
      imageUrl: "https://images.unsplash.com/photo-1583323856340-b12ff42381eb?fit=crop&w=600&h=400"
    },
    {
      sentence: ["I", "smell", "with", "my", ""],
      gapIndex: 4,
      correctWord: "nose",
      imageUrl: "https://images.unsplash.com/photo-1589392954089-8b7a77c842c8?fit=crop&w=600&h=400"
    },
    {
      sentence: ["I", "eat", "with", "my", ""],
      gapIndex: 4,
      correctWord: "mouth",
      imageUrl: "https://images.unsplash.com/photo-1581512798633-9d17cd32d8c5?fit=crop&w=600&h=400"
    },
    {
      sentence: ["I", "hold", "things", "with", "my", ""],
      gapIndex: 5,
      correctWord: "hands",
      imageUrl: "https://images.unsplash.com/photo-1527633412983-d80af308e660?fit=crop&w=600&h=400"
    }
  ]
};

// Verfügbare Themen für Benutzerinterface
export const topicData = {
  vocabularyTopics: [
    { id: "animals", name: "Tiere", background: "bg-gradient-to-r from-amber-500 to-amber-700" },
    { id: "colors", name: "Farben", background: "bg-gradient-to-r from-purple-500 to-purple-700" },
    { id: "food", name: "Essen", background: "bg-gradient-to-r from-emerald-500 to-emerald-700" },
    { id: "school", name: "Schule", background: "bg-gradient-to-r from-blue-500 to-blue-700" },
    { id: "body", name: "Körper", background: "bg-gradient-to-r from-rose-500 to-rose-700" }
  ],
  gapFillTopics: [
    { id: "animals", name: "Tiere", background: "bg-gradient-to-r from-amber-500 to-amber-700" },
    { id: "colors", name: "Farben", background: "bg-gradient-to-r from-purple-500 to-purple-700" },
    { id: "food", name: "Essen", background: "bg-gradient-to-r from-emerald-500 to-emerald-700" },
    { id: "school", name: "Schule", background: "bg-gradient-to-r from-blue-500 to-blue-700" },
    { id: "body", name: "Körper", background: "bg-gradient-to-r from-rose-500 to-rose-700" }
  ]
};