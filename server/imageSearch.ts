import OpenAI from "openai";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Lade die .env Datei explizit
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";

console.log("Environment Variables geladen:");
console.log("UNSPLASH_ACCESS_KEY vorhanden:", !!UNSPLASH_ACCESS_KEY);
console.log("OPENAI_API_KEY vorhanden:", !!OPENAI_API_KEY);

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

export async function findBestImage(
  category: string, 
  word: string, 
  translation: string
): Promise<ImageSearchResult> {

  const candidates = await generateImageCandidates(category, word, translation);
  const evaluation = await evaluateImageCandidates(candidates, category, word, translation);

  return evaluation;
}

async function generateImageCandidates(
  category: string,
  word: string,
  translation: string
): Promise<ImageCandidate[]> {
  const searchQueries = [
    `${word} children educational clear simple`,
    `${word} ${category} kids learning`,
    `${translation} Kinder einfach klar`,
    `${word} for children illustration`,
    `${category} ${word} child friendly`
  ];

  let allCandidates: ImageCandidate[] = [];

  // Mehrere Suchstrategien verwenden
  for (const query of searchQueries) {
    try {
      const imageUrls = await searchUnsplash(query);
      const candidates = imageUrls.map((url, index) => ({
        url,
        description: `${query} - result ${index + 1}`,
        relevanceScore: 0,
        childFriendly: true
      }));
      allCandidates.push(...candidates);
    } catch (error) {
      console.error(`Fehler bei Suche "${query}":`, error);
    }
  }

  // Duplikate entfernen
  const uniqueCandidates = allCandidates.filter((candidate, index, self) => 
    index === self.findIndex(c => c.url === candidate.url)
  );

  // Maximal 6 Kandidaten für bessere Performance
  return uniqueCandidates.slice(0, 6);
}

async function searchUnsplash(query: string): Promise<string[]> {

  // Return fallback images if no API key is configured
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY.trim() === "" || UNSPLASH_ACCESS_KEY === "your_unsplash_access_key_here") {
    console.log("Keine Unsplash API-Schlüssel konfiguriert, verwende Fallback-Bilder");
    return [
      "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400",
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?fit=crop&w=600&h=400",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400"
    ];
  }

  console.log("Verwende Unsplash API-Schlüssel für Bildsuche:", `${UNSPLASH_ACCESS_KEY.substring(0, 10)}...`);

  try {
    console.log(`Suche Bilder auf Unsplash für: "${query}"`);
    const response = await axios.get("https://api.unsplash.com/search/photos", {
      params: {
        query,
        per_page: 9, // Mehr Bilder für bessere Auswahl
        orientation: "squarish",
        content_filter: "high", // Höhere Qualität
        order_by: "relevance" // Nach Relevanz sortieren
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    const results = response.data.results;
    console.log(`Unsplash API Response: ${results.length} Bilder gefunden für "${query}"`);
    
    if (results.length === 0) {
      console.log("Keine Bilder von Unsplash erhalten, verwende Fallback-Bilder");
      return [
        "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400",
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?fit=crop&w=600&h=400",
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400"
      ];
    }
    
    // Filtere Bilder mit hoher Qualität (Downloads als Qualitätsindikator)
    const qualityFiltered = results
      .filter((r: any) => r.downloads > 1000) // Nur beliebte Bilder
      .sort((a: any, b: any) => b.likes - a.likes) // Nach Likes sortieren
      .slice(0, 6); // Maximal 6 Bilder

    const imageUrls = qualityFiltered.length > 0 
      ? qualityFiltered.map((r: any) => r.urls.small)
      : results.slice(0, 3).map((r: any) => r.urls.small);
    
    console.log(`Qualitätsgefilterte Bild-URLs (${imageUrls.length}):`, imageUrls);
    return imageUrls;
  } catch (error) {
    console.error("Fehler bei der Unsplash-Suche:", error);
    if (axios.isAxiosError(error)) {
      console.error("Unsplash API Fehler Status:", error.response?.status);
      console.error("Unsplash API Fehler Message:", error.response?.data);
    }

    // Return fallback images on error
    return [
      "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400",
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?fit=crop&w=600&h=400",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400"
    ];

  }
}

async function evaluateImageCandidates(
  candidates: ImageCandidate[],
  category: string,
  word: string,
  translation: string
): Promise<ImageSearchResult> {


  // Handle empty candidates array
  if (!candidates || candidates.length === 0) {
    return {
      bestImageUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400",
      confidence: 0.5,
      reasoning: "No candidates available, using fallback image"
    };
  }


  const prompt = `
  You are an expert evaluator for children's English learning materials. 
  
  CONTEXT:
  - Category: "${category}" 
  - English word: "${word}"
  - German translation: "${translation}"
  - Target: German children aged 6-11 learning English

  STRICT EVALUATION CRITERIA:
  1. SEMANTIC ACCURACY (40%): Does the image show EXACTLY "${word}"? Not similar objects.
  2. CLARITY (25%): Is the main object large, clear, unambiguous?
  3. CHILD-FRIENDLY (20%): Age-appropriate, no scary/violent content?
  4. EDUCATIONAL VALUE (15%): Simple background, good for learning?

  LOGIC CHECKS:
  - If word is "cat", image must show a cat, not dog/tiger/lion
  - If word is "car", image must show a car, not truck/bus/bicycle
  - If word is "apple", image must show an apple, not orange/fruit mix
  - Reject images with multiple objects unless word is plural
  - Reject images where main object is too small or unclear

  QUALITY THRESHOLDS:
  - Confidence must be ≥0.7 to be acceptable
  - Semantic match must be perfect (not "close enough")
  - Child-appropriateness is mandatory

  IMAGE URLS TO EVALUATE:
  ${candidates.map((c, i) => `${i + 1}. ${c.url}`).join('\n')}

  Respond with JSON in this EXACT format:
  {
    "bestImageIndex": number,
    "confidence": number,
    "reasoning": "Detailed explanation in German",
    "semanticMatch": boolean,
    "qualityScore": number,
    "rejectedImages": [array of rejected indices with reasons]
  }
  `;

  try {

    // If no OpenAI API key is available, use the first candidate or fallback
    if (!openai || !OPENAI_API_KEY) {
      console.log("Keine OpenAI API-Schlüssel konfiguriert, verwende ersten Kandidaten");
      const bestCandidate = candidates[0];
      
      if (!bestCandidate || !bestCandidate.url) {
        return {
          bestImageUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400",
          confidence: 0.5,
          reasoning: "No OpenAI API key and no candidates available, using fallback image"
        };
      }

      return {
        bestImageUrl: bestCandidate.url,
        confidence: 0.7,
        reasoning: "Selected first candidate (no OpenAI evaluation available)"
      };
    }


    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    const evaluation = JSON.parse(response.choices[0].message.content || "{}");

    const bestIndex = (evaluation.bestImageIndex || 1) - 1;
    const bestCandidate = candidates[bestIndex] || candidates[0];

    // Logikprüfung: Ist die Bewertung akzeptabel?
    const isAcceptable = 
      evaluation.confidence >= 0.7 && 
      evaluation.semanticMatch === true && 
      evaluation.qualityScore >= 0.6;

    if (!isAcceptable) {
      console.log(`❌ Bildqualität für "${word}" nicht ausreichend:`, evaluation.reasoning);
      
      // Fallback zu kuratierten Bildern
      const fallbackUrl = getCuratedFallbackImage(word, category);


// Kuratierte, hochwertige Fallback-Bilder nach Kategorien organisiert
function getCuratedFallbackImage(word: string, category: string): string {
  const curatedImages: Record<string, Record<string, string>> = {
    animals: {
      cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400",
      dog: "https://images.unsplash.com/photo-1552053831-71594a27632d?fit=crop&w=600&h=400",
      bird: "https://images.unsplash.com/photo-1444464666168-49d633b86797?fit=crop&w=600&h=400",
      fish: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?fit=crop&w=600&h=400",
      bear: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?fit=crop&w=600&h=400",
      duck: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?fit=crop&w=600&h=400",
      sheep: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400",
      horse: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?fit=crop&w=600&h=400",
      cow: "https://images.unsplash.com/photo-1516467508483-a9ba5d0fe6a5?fit=crop&w=600&h=400",
      pig: "https://images.unsplash.com/photo-1516467508483-a9ba5d0fe6a5?fit=crop&w=600&h=400"
    },
    food: {
      apple: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?fit=crop&w=600&h=400",
      banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?fit=crop&w=600&h=400",
      bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?fit=crop&w=600&h=400",
      milk: "https://images.unsplash.com/photo-1550583724-b2692b85b150?fit=crop&w=600&h=400",
      cheese: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b?fit=crop&w=600&h=400",
      egg: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?fit=crop&w=600&h=400"
    },
    transport: {
      car: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?fit=crop&w=600&h=400",
      bus: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?fit=crop&w=600&h=400",
      train: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?fit=crop&w=600&h=400",
      bike: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fit=crop&w=600&h=400",
      boat: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?fit=crop&w=600&h=400"
    },
    family: {
      mother: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400",
      father: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&h=400",
      baby: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?fit=crop&w=600&h=400",
      grandmother: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?fit=crop&w=600&h=400",
      grandfather: "https://images.unsplash.com/photo-1619734086067-24bf8889ea7d?fit=crop&w=600&h=400"
    },
    colors: {
      red: "https://images.unsplash.com/photo-1549298916-b41d501d3772?fit=crop&w=600&h=400",
      blue: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?fit=crop&w=600&h=400",
      green: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?fit=crop&w=600&h=400",
      yellow: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?fit=crop&w=600&h=400"
    }
  };

  // Versuche spezifisches Bild für Wort zu finden
  const categoryImages = curatedImages[category.toLowerCase()];
  if (categoryImages && categoryImages[word.toLowerCase()]) {
    return categoryImages[word.toLowerCase()];
  }

  // Fallback zu Standard-Kategorien
  const fallbacks: Record<string, string> = {
    animals: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400",
    food: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?fit=crop&w=600&h=400",
    transport: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?fit=crop&w=600&h=400",
    family: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400",
    colors: "https://images.unsplash.com/photo-1549298916-b41d501d3772?fit=crop&w=600&h=400",
    shapes: "https://images.unsplash.com/photo-1509909756405-be0199881695?fit=crop&w=600&h=400",
    nature: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?fit=crop&w=600&h=400",
    home: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400",
    clothes: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?fit=crop&w=600&h=400"
  };

  return fallbacks[category.toLowerCase()] || fallbacks.animals;
}

      return {
        bestImageUrl: fallbackUrl,
        confidence: 0.6,
        reasoning: `Automatische Suche unzureichend. Grund: ${evaluation.reasoning}. Verwende kuratiertes Fallback-Bild.`
      };
    }

    if (!bestCandidate || !bestCandidate.url) {
      const fallbackUrl = getCuratedFallbackImage(word, category);
      return {
        bestImageUrl: fallbackUrl,
        confidence: 0.5,
        reasoning: "Ungültiger Kandidat ausgewählt, verwende kuratiertes Fallback-Bild"
      };
    }

    console.log(`✅ Hochwertiges Bild für "${word}" gefunden:`, evaluation.reasoning);
    return {
      bestImageUrl: bestCandidate.url,
      confidence: evaluation.confidence || 0.8,
      reasoning: evaluation.reasoning || `Ausgewähltes Bild ${bestIndex + 1} mit Qualitätsprüfung`
    };

  } catch (error) {
    console.error("Fehler bei der Bewertung:", error);


    // Safely access the first candidate
    const fallbackUrl = (candidates[0] && candidates[0].url) 
      ? candidates[0].url 
      : "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400";


    return {
      bestImageUrl: fallbackUrl,
      confidence: 0.5,
      reasoning: `Fallback due to error: ${error instanceof Error ? error.message : "unknown"}`
    };
  }
}
