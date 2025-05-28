
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ImageCandidate {
  url: string;
  description: string;
  relevanceScore: number;
  childFriendly: boolean;
  unsplashId?: string;
  photographer?: string;
}

interface ImageSearchResult {
  bestImageUrl: string;
  confidence: number;
  reasoning: string;
  unsplashId?: string;
  photographer?: string;
}

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description?: string;
  description?: string;
  user: {
    name: string;
  };
}

interface UnsplashSearchResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
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
  
  // Versuche zuerst echte Unsplash API-Suche
  let candidates = await searchUnsplashImages(category, word, translation);
  
  // Falls Unsplash fehlschlägt, verwende kuratierte Fallback-Bilder
  if (candidates.length === 0) {
    console.log("Unsplash API nicht verfügbar, verwende kuratierte Bilder");
    candidates = await generateFallbackImageCandidates(category, word, translation);
  }
  
  // Verwende GPT-4o zur semantischen Bewertung der Bilder
  const evaluation = await evaluateImageCandidates(candidates, category, word, translation);
  
  return evaluation;
}

/**
 * Sucht Bilder über die echte Unsplash API
 */
async function searchUnsplashImages(
  category: string, 
  word: string, 
  translation: string
): Promise<ImageCandidate[]> {
  
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.log("Unsplash Access Key nicht gefunden");
    return [];
  }

  try {
    // Generiere kindgerechte Suchbegriffe
    const searchQueries = generateChildFriendlySearchQueries(category, word, translation);
    const allCandidates: ImageCandidate[] = [];

    for (const query of searchQueries) {
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&content_filter=high`,
          {
            headers: {
              'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
              'Accept-Version': 'v1'
            }
          }
        );

        if (!response.ok) {
          console.error(`Unsplash API Fehler: ${response.status} ${response.statusText}`);
          continue;
        }

        const data: UnsplashSearchResponse = await response.json();
        
        const candidates = data.results.map((image): ImageCandidate => ({
          url: image.urls.regular,
          description: image.alt_description || image.description || `${category} ${word}`,
          relevanceScore: 0, // Wird von GPT bewertet
          childFriendly: true, // Wird von GPT überprüft
          unsplashId: image.id,
          photographer: image.user.name
        }));

        allCandidates.push(...candidates);
        
        // Kurze Pause zwischen API-Aufrufen
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Fehler bei Unsplash-Suche für "${query}":`, error);
        continue;
      }
    }

    console.log(`✅ ${allCandidates.length} Bilder von Unsplash gefunden für "${word}"`);
    return allCandidates.slice(0, 8); // Maximal 8 Kandidaten für GPT-Bewertung

  } catch (error) {
    console.error("Unsplash API Fehler:", error);
    return [];
  }
}

/**
 * Generiert kindgerechte Suchbegriffe für die Unsplash API
 */
function generateChildFriendlySearchQueries(
  category: string, 
  word: string, 
  translation: string
): string[] {
  
  const baseQueries = [
    `${word} ${category} child friendly educational`,
    `${word} for children learning simple clean`,
    `${translation} ${category} kind lernen`,
    `${word} illustration educational material`,
    `${category} ${word} bright colorful safe`,
    `${word} isolated white background clear`,
    `${translation} einfach klar kinder`,
    `${word} ${category} family friendly`
  ];

  // Spezielle Begriffe für häufige Kategorien
  const categorySpecificTerms: Record<string, string[]> = {
    'animals': ['cute', 'friendly', 'cartoon', 'pet', 'wildlife'],
    'motorrad': ['motorcycle', 'bike', 'vehicle', 'transport'],
    'family': ['people', 'portrait', 'happy', 'together'],
    'food': ['fresh', 'healthy', 'colorful', 'delicious'],
    'nature': ['beautiful', 'outdoor', 'landscape', 'green']
  };

  const categoryTerms = categorySpecificTerms[category.toLowerCase()] || [];
  
  // Erweitere Suchanfragen mit kategoriespezifischen Begriffen
  const enhancedQueries = categoryTerms.map(term => 
    `${word} ${term} ${category} educational`
  );

  return [...baseQueries, ...enhancedQueries].slice(0, 5); // Maximal 5 Suchanfragen
}

/**
 * Fallback-Funktion mit kuratierten Bildern (wie bisher)
 */
async function generateFallbackImageCandidates(
  category: string, 
  word: string, 
  translation: string
): Promise<ImageCandidate[]> {
  
  // Kuratierte, themenspezifische Bildauswahl (wie vorher)
  const imageMap: Record<string, Record<string, string[]>> = {
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
    "animals": {
      "cat": [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&h=600&fit=crop"
      ],
      "dog": [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop"
      ],
      "bird": [
        "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800&h=600&fit=crop"
      ],
      "fish": [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
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
  
  let candidateUrls: string[] = [];
  
  if (imageMap[categoryLower]?.[wordLower]) {
    candidateUrls = imageMap[categoryLower][wordLower];
  } else {
    // Fallback für unbekannte Begriffe
    candidateUrls = [
      `https://images.unsplash.com/photo-1500259571355-332da5cb07aa?w=800&h=600&fit=crop&q=${encodeURIComponent(word)}`,
      `https://images.unsplash.com/photo-1516467508483-a9ba5d0fe6a5?w=800&h=600&fit=crop&q=${encodeURIComponent(category)}`,
      `https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=600&fit=crop&q=${encodeURIComponent(translation)}`
    ];
  }
  
  return candidateUrls.map((url, index) => ({
    url,
    description: `${category} ${word} fallback candidate ${index + 1}`,
    relevanceScore: 0,
    childFriendly: true
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
    5. Visual quality: Is the image clear, well-lit, and high quality?
    
    Image URLs to evaluate:
    ${candidates.map((c, i) => `${i + 1}. ${c.url} (Description: ${c.description})`).join('\n')}
    
    Respond with JSON in this exact format:
    {
      "bestImageIndex": 1,
      "confidence": 0.9,
      "reasoning": "Image 1 shows a clear motorcycle wheel with chrome rim, perfect for children to understand 'wheel' in motorcycle context. The image is bright, well-lit, and child-friendly. Image 2 shows a bicycle wheel (wrong context), Image 3 shows a car wheel (wrong context)."
    }
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500
    });
    
    const evaluation = JSON.parse(response.choices[0].message.content || "{}");
    
    const bestIndex = Math.max(0, Math.min(candidates.length - 1, (evaluation.bestImageIndex || 1) - 1));
    const bestCandidate = candidates[bestIndex];
    
    return {
      bestImageUrl: bestCandidate.url,
      confidence: evaluation.confidence || 0.8,
      reasoning: evaluation.reasoning || `Selected image ${bestIndex + 1} as best match for ${category} - ${word}`,
      unsplashId: bestCandidate.unsplashId,
      photographer: bestCandidate.photographer
    };
    
  } catch (error) {
    console.error("Error evaluating images:", error);
    
    // Fallback: Verwende das erste Bild
    const bestCandidate = candidates[0];
    return {
      bestImageUrl: bestCandidate.url,
      confidence: 0.5,
      reasoning: `Fallback selection due to evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      unsplashId: bestCandidate?.unsplashId,
      photographer: bestCandidate?.photographer
    };
  }
}

/**
 * Hilfsfunktion für direkte Unsplash-Suche (kann in anderen Teilen der App verwendet werden)
 */
export async function searchUnsplashDirect(
  query: string, 
  perPage: number = 10
): Promise<UnsplashImage[]> {
  
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    throw new Error("Unsplash Access Key nicht konfiguriert");
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&content_filter=high`,
      {
        headers: {
          'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API Error: ${response.status} ${response.statusText}`);
    }

    const data: UnsplashSearchResponse = await response.json();
    return data.results;

  } catch (error) {
    console.error("Direct Unsplash search failed:", error);
    throw error;
  }
}
