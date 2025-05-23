import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ImageValidationResult {
  isValid: boolean;
  confidence: number;
  reasoning: string;
  childFriendly: boolean;
  suggestedReplacement?: string;
}

/**
 * Intelligente Bildvalidierung für Kinder-Lernapp
 * Prüft ob Bilder semantisch zum englischen Wort passen und kinderfreundlich sind
 */
export async function validateImage(
  imageUrl: string,
  englishWord: string,
  germanTranslation: string,
  category: string
): Promise<ImageValidationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für Bildvalidierung in Kinder-Lern-Apps. 
          Analysiere das Bild und prüfe ob es perfekt für deutsche Kinder (6-11 Jahre) geeignet ist, die Englisch lernen.
          
          Bewerte streng nach diesen Kriterien:
          1. Zeigt das Bild GENAU das englische Wort "${englishWord}" (deutsch: "${germanTranslation}")?
          2. Ist es für Kinder klar erkennbar und eindeutig?
          3. Ist es kinderfreundlich (keine Gewalt, nichts Verstörendes)?
          4. Ist das Hauptobjekt groß und deutlich sichtbar?
          5. Passt es zur Kategorie "${category}"?
          
          Antworte nur mit JSON in diesem Format:
          {
            "isValid": boolean,
            "confidence": number (0-1),
            "reasoning": "Detaillierte Begründung auf Deutsch",
            "childFriendly": boolean,
            "suggestedReplacement": "Falls ungültig, bessere Suchbegriffe vorschlagen"
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Prüfe dieses Bild für das englische Wort "${englishWord}" (deutsch: "${germanTranslation}") in der Kategorie "${category}"`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      isValid: result.isValid || false,
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      reasoning: result.reasoning || 'Keine Analyse verfügbar',
      childFriendly: result.childFriendly || false,
      suggestedReplacement: result.suggestedReplacement
    };

  } catch (error) {
    console.error('Bildvalidierung fehlgeschlagen:', error);
    return {
      isValid: false,
      confidence: 0,
      reasoning: 'Technischer Fehler bei der Bildanalyse',
      childFriendly: false,
      suggestedReplacement: `${englishWord} for children clear simple`
    };
  }
}

/**
 * Sucht und validiert bessere Bilder für ein Wort
 */
export async function findValidatedImage(
  englishWord: string,
  germanTranslation: string,
  category: string
): Promise<{ imageUrl: string; validation: ImageValidationResult } | null> {
  
  // Mehrere hochwertige Suchquellen für Kinder-geeignete Bilder
  const searchQueries = [
    `${englishWord} children illustration simple clear`,
    `${englishWord} kids educational cartoon style`,
    `${englishWord} simple clean background child friendly`,
    `${germanTranslation} für Kinder einfach klar`,
    `${category} ${englishWord} educational material`
  ];

  for (const query of searchQueries) {
    try {
      // Simuliere Bildsuche mit hochwertigen Unsplash-Bildern
      const potentialImages = await searchHighQualityImages(query, englishWord);
      
      for (const imageUrl of potentialImages) {
        const validation = await validateImage(imageUrl, englishWord, germanTranslation, category);
        
        if (validation.isValid && validation.childFriendly && validation.confidence > 0.7) {
          return { imageUrl, validation };
        }
      }
    } catch (error) {
      console.error(`Suche für "${query}" fehlgeschlagen:`, error);
      continue;
    }
  }

  return null;
}

/**
 * Hochwertige Bildsuche für Lernmaterialien
 */
async function searchHighQualityImages(query: string, word: string): Promise<string[]> {
  // Kuratierte, hochwertige Bilder für häufige Lernwörter
  const educationalImages: Record<string, string[]> = {
    'cat': [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?fit=crop&w=600&h=400'
    ],
    'dog': [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?fit=crop&w=600&h=400'
    ],
    'bird': [
      'https://images.unsplash.com/photo-1444464666168-49d633b86797?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?fit=crop&w=600&h=400'
    ],
    'fish': [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?fit=crop&w=600&h=400'
    ],
    'bear': [
      'https://images.unsplash.com/photo-1589656966895-2f33e7653819?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?fit=crop&w=600&h=400'
    ],
    'duck': [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1589987607026-d3e7532c03c3?fit=crop&w=600&h=400'
    ],
    'zebra': [
      'https://images.unsplash.com/photo-1551232864-3f0890e580d9?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1508817628294-5a453fa0b8a8?fit=crop&w=600&h=400'
    ],
    'giraffe': [
      'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?fit=crop&w=600&h=400'
    ],
    'sheep': [
      'https://images.unsplash.com/photo-1533318087102-b9ad633d9b4d?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400'
    ],
    'frog': [
      'https://images.unsplash.com/photo-1539632346654-dd4c3cffad8c?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1496070242169-b672c576566b?fit=crop&w=600&h=400'
    ]
  };

  return educationalImages[word.toLowerCase()] || [
    `https://images.unsplash.com/photo-1500259571355-332da5cb07aa?fit=crop&w=600&h=400&q=${word}`,
    `https://images.unsplash.com/photo-1516467508483-a9ba5d0fe6a5?fit=crop&w=600&h=400&q=${word}`,
    `https://images.unsplash.com/photo-1518717758536-85ae29035b6d?fit=crop&w=600&h=400&q=${word}`
  ];
}

/**
 * Batch-Validierung aller Bilder einer Kategorie
 */
export async function validateAllImagesInCategory(
  vocabularyItems: Array<{ word: string; translation: string; imageUrl: string }>,
  category: string
): Promise<Array<{ word: string; validation: ImageValidationResult; newImageUrl?: string }>> {
  
  const results = [];
  
  for (const item of vocabularyItems) {
    try {
      console.log(`🔍 Prüfe Bild für "${item.word}"...`);
      
      const validation = await validateImage(
        item.imageUrl,
        item.word,
        item.translation,
        category
      );
      
      let newImageUrl = undefined;
      
      // Wenn Bild ungültig ist, suche besseres
      if (!validation.isValid || !validation.childFriendly || validation.confidence < 0.7) {
        console.log(`❌ Bild für "${item.word}" ist ungeeignet: ${validation.reasoning}`);
        
        const betterImage = await findValidatedImage(item.word, item.translation, category);
        if (betterImage) {
          newImageUrl = betterImage.imageUrl;
          console.log(`✅ Besseres Bild für "${item.word}" gefunden!`);
        }
      } else {
        console.log(`✅ Bild für "${item.word}" ist gut: ${validation.reasoning}`);
      }
      
      results.push({
        word: item.word,
        validation,
        newImageUrl
      });
      
      // Kurze Pause um API-Limits zu respektieren
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Fehler bei Validierung von "${item.word}":`, error);
      results.push({
        word: item.word,
        validation: {
          isValid: false,
          confidence: 0,
          reasoning: 'Validierung fehlgeschlagen',
          childFriendly: false
        }
      });
    }
  }
  
  return results;
}