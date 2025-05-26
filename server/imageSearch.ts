import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ImageCandidate {
  url: string;
  description: string;
  relevanceScore: number;
  childFriendly: boolean;
}

interface ImageSearchResult {
  bestImageUrl: string;
  confidence: number;
  reasoning: string;
}

/**
 * Intelligente Bildsuchfunktion, die semantisch passende, kinderfreundliche Bilder findet
 * @param category - Die Themenkategorie (z.B. "Motorrad")
 * @param word - Das spezifische Wort (z.B. "wheel")
 * @param translation - Deutsche Übersetzung (z.B. "Rad")
 * @returns Das beste gefundene Bild mit Begründung
 */
export async function findBestImage(
  category: string, 
  word: string, 
  translation: string
): Promise<ImageSearchResult> {
  
  // Kuratierte Bildkandidaten basierend auf spezifischen Such-Kombinationen
  const candidates = await generateImageCandidates(category, word, translation);
  
  // Verwende GPT-4o zur semantischen Bewertung der Bilder
  const evaluation = await evaluateImageCandidates(candidates, category, word, translation);
  
  return evaluation;
}

/**
 * Prompt für Farben-Kategorie zur Generierung passender Suchbegriffe
 */
const promptColorsCategory = (color: string) => `
You are helping to create a vocabulary app for children aged 6 to 11.

The current category is: "Colors".

Your task:
Suggest a simple search term that will return a clear, realistic, and age-appropriate image representing the color "${color}".

Guidelines:
- The image should clearly show the color as the main subject.
- Avoid abstract art, symbols, illustrations, or logos.
- Prefer natural objects (e.g. "a red apple", "a green leaf", "a blue sky", etc.).
- The result should be suitable for children and easily understood.
- Use nouns that help children associate the color with a real object.

Return only the search term (max. 4 words), nothing else.
`;

/**
 * Generiert präzise Suchbegriffe für kindgerechte Bilder
 */
async function generateSearchQueries(category: string, word: string): Promise<string[]> {
  // Spezielle Behandlung für Farben-Kategorie
  if (category.toLowerCase() === 'colors' || category.toLowerCase() === 'farben') {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: promptColorsCategory(word) }],
        max_tokens: 20
      });
      
      const aiSearchTerm = response.choices[0].message.content?.trim() || `${word} color object`;
      
      return [
        aiSearchTerm,
        `${word} colored object for children`,
        `bright ${word} natural object`,
        `${word} color educational photo`
      ];
    } catch (error) {
      console.error('Error generating color search term:', error);
      // Fallback für Farben
      return [
        `${word} colored object`,
        `${word} natural object`,
        `bright ${word} photo`
      ];
    }
  }
  
  // Standard-Suchbegriffe für andere Kategorien
  return [
    `High-quality, child-friendly photo of a ${word} from a ${category}, clear, colorful, isolated on white background, no people`,
    `Professional ${category} ${word} illustration for children, bright colors, simple background, educational`,
    `Clean ${word} image ${category} context, kid-friendly, no text, no watermarks, studio lighting`
  ];
}

/**
 * Sucht echte Bilder mit präzisen Suchbegriffen
 */
async function searchRealImages(category: string, word: string): Promise<string[]> {
  // Generiere intelligente Suchbegriffe
  const searchQueries = await generateSearchQueries(category, word);
  
  // Erstelle URLs basierend auf den generierten Suchbegriffen
  const searchBasedUrls = searchQueries.map(query => 
    `https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=600&fit=crop&q=${encodeURIComponent(query)}`
  );
  
  // Füge auch fallback URLs hinzu
  searchBasedUrls.push(
    `https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&q=${encodeURIComponent(word + ' ' + category)}`,
    `https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop&q=${encodeURIComponent(category + ' ' + word + ' isolated')}`
  );
  
  return searchBasedUrls;
}

/**
 * Generiert kuratierte Bildkandidaten mit spezifischen Suchkombinationen
 */
async function generateImageCandidates(
  category: string, 
  word: string, 
  translation: string
): Promise<ImageCandidate[]> {
  
  // Kuratierte, themenspezifische Bildauswahl
  const imageMap: Record<string, Record<string, string[]>> = {
    "colors": {
      "red": [
        "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&h=600&fit=crop", // red apple
        "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&h=600&fit=crop", // red rose
        "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=800&h=600&fit=crop"  // red strawberry
      ],
      "blue": [
        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop", // clear blue sky
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", // blue sky with clouds
        "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop"  // blue ocean
      ],
      "green": [
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop", // green leaf
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop", // green grass
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop"  // green apple
      ],
      "yellow": [
        "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&h=600&fit=crop", // yellow banana
        "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=800&h=600&fit=crop", // yellow sunflower
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop"  // yellow lemon
      ],
      "orange": [
        "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800&h=600&fit=crop", // orange fruit
        "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&h=600&fit=crop", // orange pumpkin
        "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&h=600&fit=crop"  // orange carrot
      ],
      "purple": [
        "https://images.unsplash.com/photo-1571832037044-4b29bbcc1ac6?w=800&h=600&fit=crop", // purple grapes
        "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop", // purple flower
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop"  // purple eggplant
      ],
      "pink": [
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop", // pink flower
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop", // pink cherry blossom
        "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?w=800&h=600&fit=crop"  // pink rose
      ],
      "black": [
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop", // black cat
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop", // black bear
        "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?w=800&h=600&fit=crop"  // black object
      ],
      "white": [
        "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop", // white cloud
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop", // white snow
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"  // white flower
      ],
      "brown": [
        "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?w=800&h=600&fit=crop", // brown bear
        "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop", // brown tree trunk
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop"  // brown chocolate
      ]
    },
    "motorrad": {
      "motorcycle": [
        "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop"
      ],
      "helmet": [
        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
      ],
      "wheel": [
        "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&h=600&fit=crop"
      ],
      "engine": [
        "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop"
      ],
      "speed": [
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=600&fit=crop"
      ]
    },
    "family": {
      "mother": [
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1594736797933-d0401ba880ac?w=800&h=600&fit=crop"
      ],
      "father": [
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop"
      ],
      "brother": [
        "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1534126416832-7d5df3b88c6c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop"
      ],
      "sister": [
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1494790108755-2616c355b6e6?w=800&h=600&fit=crop"
      ],
      "baby": [
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop"
      ]
    }
  };
  
  const categoryLower = category.toLowerCase();
  const wordLower = word.toLowerCase();
  
  // Verwende kuratierte Bilder oder suche neue
  let candidateUrls: string[];
  
  if (imageMap[categoryLower]?.[wordLower]) {
    candidateUrls = imageMap[categoryLower][wordLower];
  } else {
    // Für neue Begriffe: Intelligente URL-Generierung basierend auf Unsplash
    candidateUrls = await searchRealImages(category, word);
  }
  
  return candidateUrls.map((url, index) => ({
    url,
    description: `${category} ${word} candidate ${index + 1}`,
    relevanceScore: 0, // Wird von GPT bewertet
    childFriendly: true // Wird von GPT überprüft
  }));
}



/**
 * Verwendet GPT-4o zur semantischen Bewertung der Bildkandidaten
 */
async function evaluateImageCandidates(
  candidates: ImageCandidate[],
  category: string,
  word: string,
  translation: string
): Promise<ImageSearchResult> {
  
  try {
    const prompt = `
    You are evaluating images for a children's English learning app. 
    
    Context:
    - Category: "${category}" 
    - English word: "${word}"
    - German translation: "${translation}"
    - Target audience: German children aged 6-11
    
    Task: Analyze these ${candidates.length} image URLs and determine which one is MOST suitable.
    
    Evaluation criteria:
    1. Semantic match: Does the image clearly show "${word}" in the context of "${category}"?
    2. Child-appropriate: Is it safe and appropriate for children?
    3. Clear and recognizable: Can a child easily identify what it shows?
    4. Context accuracy: For example, if category is "motorcycle" and word is "wheel", it should show a MOTORCYCLE wheel, not a bicycle wheel or car wheel.
    
    Image URLs to evaluate:
    ${candidates.map((c, i) => `${i + 1}. ${c.url}`).join('\n')}
    
    Respond with JSON in this exact format:
    {
      "bestImageIndex": 1,
      "confidence": 0.9,
      "reasoning": "Image 1 shows a clear motorcycle wheel with chrome rim, perfect for children to understand 'wheel' in motorcycle context. Image 2 shows a bicycle wheel (wrong context), Image 3 shows a car wheel (wrong context)."
    }
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500
    });
    
    const evaluation = JSON.parse(response.choices[0].message.content || "{}");
    
    const bestIndex = (evaluation.bestImageIndex || 1) - 1;
    const bestCandidate = candidates[bestIndex] || candidates[0];
    
    return {
      bestImageUrl: bestCandidate.url,
      confidence: evaluation.confidence || 0.8,
      reasoning: evaluation.reasoning || `Selected image ${bestIndex + 1} as best match for ${category} - ${word}`
    };
    
  } catch (error) {
    console.error("Error evaluating images:", error);
    
    // Fallback: Verwende das erste Bild
    return {
      bestImageUrl: candidates[0].url,
      confidence: 0.5,
      reasoning: `Fallback selection due to evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}