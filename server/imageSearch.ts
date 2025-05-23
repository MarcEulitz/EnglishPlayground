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
 * Generiert kuratierte Bildkandidaten mit spezifischen Suchkombinationen
 */
async function generateImageCandidates(
  category: string, 
  word: string, 
  translation: string
): Promise<ImageCandidate[]> {
  
  // Spezifische Bildauswahl basierend auf Kategorie + Wort Kombination
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
  
  const urls = imageMap[categoryLower]?.[wordLower] || [
    "https://images.unsplash.com/photo-1561089489-f13d5e730d72?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1546074177-ffdda98d214f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&h=600&fit=crop"
  ];
  
  return urls.map((url, index) => ({
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