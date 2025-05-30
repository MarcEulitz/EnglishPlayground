import OpenAI from "openai";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";

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
  const query = `${category} ${word} for children clear`;
  const imageUrls = await searchUnsplash(query);

  return imageUrls.map((url, index) => ({
    url,
    description: `${category} ${word} candidate ${index + 1}`,
    relevanceScore: 0,
    childFriendly: true
  }));
}

async function searchUnsplash(query: string): Promise<string[]> {
  // Return fallback images if no API key is configured
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY.trim() === "") {
    console.log("Keine Unsplash API-Schlüssel konfiguriert, verwende Fallback-Bilder");
    return [
      "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400",
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?fit=crop&w=600&h=400",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400"
    ];
  }

  try {
    const response = await axios.get("https://api.unsplash.com/search/photos", {
      params: {
        query,
        per_page: 3,
        orientation: "squarish"
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    const results = response.data.results;
    return results.map((r: any) => r.urls.small);
  } catch (error) {
    console.error("Fehler bei der Unsplash-Suche:", error);
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
  You are evaluating images for a children's English learning app. 
  Context:
  - Category: "${category}" 
  - English word: "${word}"
  - German translation: "${translation}"
  - Target audience: German children aged 6-11

  Task: Analyze these ${candidates.length} image URLs and determine which one is MOST suitable.

  Evaluation criteria:
  1. Semantic match
  2. Child-appropriateness
  3. Clear and recognizable
  4. Context accuracy

  Image URLs to evaluate:
  ${candidates.map((c, i) => `${i + 1}. ${c.url}`).join('\n')}

  Respond with JSON in this exact format:
  {
    "bestImageIndex": 1,
    "confidence": 0.9,
    "reasoning": "..."
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

    if (!bestCandidate || !bestCandidate.url) {
      return {
        bestImageUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400",
        confidence: 0.5,
        reasoning: "Invalid candidate selected, using fallback image"
      };
    }

    return {
      bestImageUrl: bestCandidate.url,
      confidence: evaluation.confidence || 0.8,
      reasoning: evaluation.reasoning || `Selected image ${bestIndex + 1}`
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
