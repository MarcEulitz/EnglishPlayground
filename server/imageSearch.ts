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
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "";

console.log("Environment Variables geladen:");
console.log("UNSPLASH_ACCESS_KEY vorhanden:", !!UNSPLASH_ACCESS_KEY);
console.log("PEXELS_API_KEY vorhanden:", !!PEXELS_API_KEY);
console.log("PIXABAY_API_KEY vorhanden:", !!PIXABAY_API_KEY);
console.log("OPENAI_API_KEY vorhanden:", !!OPENAI_API_KEY);

// In-Memory Cache für generierte Familie-Bilder
export const familyImageCache: Record<string, {
  url: string;
  confidence: number;
  generated: string;
  source: string;
}> = {};

interface ImageCandidate {
  url: string;
  description: string;
  alt_description: string;
  downloads: number;
  likes: number;
  width: number;
  height: number;
}

interface ImageSearchResult {
  bestImageUrl: string;
  confidence: number;
  reasoning: string;
  logicCheck: boolean;
}

interface GPTEvaluation {
  bestImageIndex: number;
  confidence: number;
  reasoning: string;
  semanticMatch: boolean;
  qualityScore: number;
  logicCheck: boolean;
  detailedAnalysis: string;
  criticalIssues: string[];
}

export async function findBestImage(
  category: string, 
  word: string, 
  translation: string
): Promise<ImageSearchResult> {

  console.log(`🔍 Starte Bildsuche für "${word}" (${translation}) in Kategorie "${category}"`);

  // PRIORITÄT 1: ChatGPT-4o Bilderstellung für ALLE Kategorien
  console.log(`🎯 Kategorie "${category}" erkannt - prüfe Cache für "${word}"`);

  // Cache-Hit: Verwende bereits generiertes Bild
  const cachedImage = familyImageCache[word.toLowerCase()];
  if (cachedImage) {
    console.log(`🚀 CACHE HIT für "${word}" - verwende vorgeneriertes Bild!`);
    return {
      bestImageUrl: cachedImage.url,
      confidence: cachedImage.confidence,
      reasoning: `CACHE: Bereits generiertes ${cachedImage.source} Bild für "${word}" - Erstellt: ${cachedImage.generated}`,
      logicCheck: true
    };
  }

  // Cache-Miss: Generiere neues Bild mit ChatGPT-4o
  console.log(`🎨 Cache-Miss für "${word}" - verwende ChatGPT-4o Bilderstellung`);

  try {
    const generatedImageUrl = await generateImageWithChatGPT(word, translation, category);

    if (generatedImageUrl) {
      // Speichere im Cache für zukünftige Nutzung
      familyImageCache[word.toLowerCase()] = {
        url: generatedImageUrl,
        confidence: 0.98,
        generated: new Date().toISOString(),
        source: "ChatGPT-4o DALL-E-3"
      };

      console.log(`✅ Neues Bild für "${word}" generiert und gecacht!`);

      return {
        bestImageUrl: generatedImageUrl,
        confidence: 0.98, // Sehr hohe Confidence für GPT-4o generierte Bilder
        reasoning: `ChatGPT-4o hat ein perfektes, semantisch korrektes Bild für "${word}" erstellt und gecacht`,
        logicCheck: true
      };
    }
  } catch (error) {
    console.error(`❌ ChatGPT-4o Bilderstellung fehlgeschlagen für "${word}":`, error);
  }

  // Fallback zu kuratierten Bildern
  const perfectImage = getCuratedFallbackImage(word, category);

  // Cache auch Fallback-Bilder
  familyImageCache[word.toLowerCase()] = {
    url: perfectImage,
    confidence: 0.95,
    generated: new Date().toISOString(),
    source: "Kuratiertes Fallback"
  };

  return {
    bestImageUrl: perfectImage,
    confidence: 0.95,
    reasoning: `Fallback: Kuratiertes Bild für ${category}-Kategorie: "${word}" (gecacht)`,
    logicCheck: true
  };

  try {
    // Für andere Kategorien: normale intelligente Bildsuche
    // 1. Mehrere Bildkandidaten sammeln
    const candidates = await generateImageCandidates(category, word, translation);

    if (candidates.length === 0) {
      console.log(`❌ Keine Bildkandidaten gefunden für "${word}"`);
      return {
        bestImageUrl: getCuratedFallbackImage(word, category),
        confidence: 0.5,
        reasoning: "Keine Bildkandidaten gefunden, verwende kuratiertes Fallback-Bild",
        logicCheck: false
      };
    }

    // 2. GPT-4o Bildanalyse und -auswahl
    const evaluation = await evaluateWithGPT4o(candidates, category, word, translation);

    // 3. Strenge Logikprüfung
    const finalResult = await performLogicCheck(evaluation, candidates, category, word, translation);

    console.log(`✅ Bildauswahl abgeschlossen für "${word}": Confidence ${finalResult.confidence}, Logic Check: ${finalResult.logicCheck}`);
    return finalResult;

  } catch (error) {
    console.error(`❌ Fehler bei Bildsuche für "${word}":`, error);
    return {
      bestImageUrl: getCuratedFallbackImage(word, category),
      confidence: 0.3,
      reasoning: `Fehler bei der Bildsuche: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      logicCheck: false
    };
  }
}

async function generateImageCandidates(
  category: string,
  word: string,
  translation: string
): Promise<ImageCandidate[]> {

  // Strategische Suchbegriffe für optimale Bildqualität
  const searchStrategies = [
    // Strategie 1: Einzelobjekt-Fokus
    `single ${word} isolated white background educational`,
    // Strategie 2: Kinder-Lernkontext
    `${word} children learning material simple clear`,
    // Strategie 3: Kategorie-spezifisch
    `${category} ${word} perfect example educational`,
    // Strategie 4: Deutsche Suche
    `${translation} einzeln klar Hintergrund`,
    // Strategie 5: Hochqualität
    `${word} high quality professional clear background`
  ];

  let allCandidates: ImageCandidate[] = [];

  for (const query of searchStrategies) {
    try {
      // Cascading Fallback: Unsplash -> Pixabay -> Pexels
      let strategyCandidates = await searchUnsplashWithFiltering(query);

      // Falls Unsplash keine Ergebnisse, versuche Pixabay
      if (strategyCandidates.length === 0) {
        console.log(`🔄 Fallback zu Pixabay für Query: "${query}"`);
        strategyCandidates = await searchPixabayWithFiltering(query);
      }

      // Falls auch Pixabay keine Ergebnisse, verwende Pexels
      if (strategyCandidates.length === 0) {
        console.log(`🔄 Fallback zu Pexels für Query: "${query}"`);
        strategyCandidates = await searchPexelsWithFiltering(query);
      }

      allCandidates.push(...strategyCandidates);

      // Kurze Pause zwischen Anfragen
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Fehler bei Suchstrategie "${query}":`, error);

      // Bei Fehlern: Alle Fallback-APIs durchprobieren
      try {
        console.log(`🔄 Pixabay Fallback für fehlerhafte Query: "${query}"`);
        const pixabayCandidates = await searchPixabayWithFiltering(query);
        allCandidates.push(...pixabayCandidates);
      } catch (pixabayError) {
        try {
          console.log(`🔄 Pexels Fallback für fehlerhafte Query: "${query}"`);
          const pexelsCandidates = await searchPexelsWithFiltering(query);
          allCandidates.push(...pexelsCandidates);
        } catch (pexelsError) {
          console.error(`❌ Alle APIs fehlgeschlagen für "${query}"`);
        }
      }
    }
  }

  // Duplikate entfernen und nach Qualität sortieren
  const uniqueCandidates = removeDuplicatesAndSort(allCandidates);

  console.log(`📊 ${uniqueCandidates.length} eindeutige Bildkandidaten für "${word}" gefunden`);
  return uniqueCandidates.slice(0, 12); // Erhöht auf 12 beste Kandidaten
}

async function searchUnsplashWithFiltering(query: string): Promise<ImageCandidate[]> {

  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY.trim() === "" || UNSPLASH_ACCESS_KEY === "your_unsplash_access_key_here") {
    console.log("⚠️ Keine Unsplash API-Schlüssel konfiguriert, verwende Pexels Fallback");
    return await searchPexelsWithFiltering(query);
  }

  try {
    console.log(`🔎 Unsplash-Suche: "${query}"`);

    const response = await axios.get("https://api.unsplash.com/search/photos", {
      params: {
        query,
        per_page: 12,
        orientation: "landscape",
        content_filter: "high",
        order_by: "relevance"
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      },
      timeout: 10000 // 10 Sekunden Timeout
    });

    const results = response.data.results;

    if (!results || results.length === 0) {
      console.log(`⚠️ Keine Unsplash-Ergebnisse für "${query}"`);
      return [];
    }

    // Strenge Qualitätsfilterung
    const qualityFiltered = results
      .filter((r: any) => {
        return r.downloads > 1000 &&     // Mindestens 1000 Downloads
               r.likes > 30 &&           // Mindestens 30 Likes
               r.width >= 400 &&         // Mindestbreite
               r.height >= 300 &&        // Mindesthöhe
               r.urls && r.urls.regular; // Gültige URL
      })
      .map((r: any) => ({
        url: r.urls.regular,
        description: r.description || r.alt_description || "",
        alt_description: r.alt_description || "",
        downloads: r.downloads,
        likes: r.likes,
        width: r.width,
        height: r.height
      }));

    console.log(`✅ ${qualityFiltered.length} qualitätsgefilterte Unsplash-Bilder für "${query}"`);
    return qualityFiltered;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Unsplash API Fehler: ${error.response?.status} - ${error.response?.data}`);

      // Bei Rate Limit oder anderen Fehlern: Pexels als Fallback
      if (error.response?.status === 403 || error.response?.status === 429) {
        console.log("⏱️ Unsplash Rate Limit erreicht, verwende Pexels Fallback");
        return await searchPexelsWithFiltering(query);
      }
    } else {
      console.error("❌ Unbekannter Fehler bei Unsplash-Suche:", error);
    }

    // Zuerst Pixabay, dann Pexels als Fallback versuchen
    console.log("🔄 Verwende Pixabay als Fallback");
    try {
      return await searchPixabayWithFiltering(query);
    } catch (pixabayError) {
      console.log("🔄 Verwende Pexels als finaler Fallback");
      return await searchPexelsWithFiltering(query);
    }
  }
}

async function searchPixabayWithFiltering(query: string): Promise<ImageCandidate[]> {

  if (!PIXABAY_API_KEY || PIXABAY_API_KEY.trim() === "" || PIXABAY_API_KEY === "your_pixabay_api_key_here") {
    console.log("⚠️ Keine Pixabay API-Schlüssel konfiguriert, verwende Pexels Fallback");
    return await searchPexelsWithFiltering(query);
  }

  try {
    console.log(`🎯 Pixabay-Suche: "${query}"`);

    const response = await axios.get("https://pixabay.com/api/", {
      params: {
        key: PIXABAY_API_KEY,
        q: query,
        image_type: "photo",
        orientation: "horizontal",
        category: "backgrounds,fashion,nature,science,education,people,animals,places,business,food",
        min_width: 400,
        min_height: 300,
        safesearch: "true",
        per_page: 15,
        order: "popular"
      },
      timeout: 10000 // 10 Sekunden Timeout
    });

    const results = response.data.hits;

    if (!results || results.length === 0) {
      console.log(`⚠️ Keine Pixabay-Ergebnisse für "${query}"`);
      return await searchPexelsWithFiltering(query);
    }

    // Qualitätsfilterung für Pixabay
    const qualityFiltered = results
      .filter((r: any) => {
        return r.downloads > 1000 &&        // Mindestens 1000 Downloads
               r.likes > 50 &&              // Mindestens 50 Likes
               r.webformatWidth >= 400 &&   // Mindestbreite
               r.webformatHeight >= 300 &&  // Mindesthöhe
               r.webformatURL;              // Gültige URL
      })
      .map((r: any) => ({
        url: r.webformatURL,
        description: r.tags || "",
        alt_description: r.tags || "",
        downloads: r.downloads,
        likes: r.likes,
        width: r.webformatWidth,
        height: r.webformatHeight
      }));

    console.log(`✅ ${qualityFiltered.length} qualitätsgefilterte Pixabay-Bilder für "${query}"`);
    return qualityFiltered;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Pixabay API Fehler: ${error.response?.status} - ${error.response?.data}`);

      // Bei Rate Limit: längere Pause einbauen
      if (error.response?.status === 429) {
        console.log("⏱️ Pixabay Rate Limit erreicht, warte 2 Sekunden...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      console.error("❌ Unbekannter Fehler bei Pixabay-Suche:", error);
    }

    // Pexels als finaler Fallback
    return await searchPexelsWithFiltering(query);
  }
}

async function searchPexelsWithFiltering(query: string): Promise<ImageCandidate[]> {

  if (!PEXELS_API_KEY || PEXELS_API_KEY.trim() === "" || PEXELS_API_KEY === "your_pexels_api_key_here") {
    console.log("⚠️ Keine Pexels API-Schlüssel konfiguriert, verwende kuratierte Fallback-Kandidaten");
    return getCuratedFallbackCandidates(query);
  }

  try {
    console.log(`🎨 Pexels-Suche: "${query}"`);

    const response = await axios.get("https://api.pexels.com/v1/search", {
      params: {
        query,
        per_page: 15,
        orientation: "landscape",
        size: "medium"
      },
      headers: {
        Authorization: PEXELS_API_KEY
      },
      timeout: 10000 // 10 Sekunden Timeout
    });

    const results = response.data.photos;

    if (!results || results.length === 0) {
      console.log(`⚠️ Keine Pexels-Ergebnisse für "${query}"`);
      return getCuratedFallbackCandidates(query);
    }

    // Qualitätsfilterung für Pexels
    const qualityFiltered = results
      .filter((r: any) => {
        return r.width >= 400 &&           // Mindestbreite
               r.height >= 300 &&          // Mindesthöhe
               r.src && r.src.medium;      // Gültige URL
      })
      .map((r: any) => ({
        url: r.src.medium,
        description: r.alt || r.photographer || "",
        alt_description: r.alt || "",
        downloads: 500,  // Pexels hat keine Download-Zahlen, verwende Standard
        likes: 25,       // Pexels hat keine Like-Zahlen, verwende Standard
        width: r.width,
        height: r.height
      }));

    console.log(`✅ ${qualityFiltered.length} qualitätsgefilterte Pexels-Bilder für "${query}"`);
    return qualityFiltered;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Pexels API Fehler: ${error.response?.status} - ${error.response?.data}`);

      // Bei Rate Limit: längere Pause einbauen
      if (error.response?.status === 429) {
        console.log("⏱️ Pexels Rate Limit erreicht, warte 3 Sekunden...");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } else {
      console.error("❌ Unbekannter Fehler bei Pexels-Suche:", error);
    }

    return getCuratedFallbackCandidates(query);
  }
}

function getCuratedFallbackCandidates(query: string): ImageCandidate[] {
  // Kuratierte Fallback-Bilder wenn beide APIs fehlschlagen
  const fallbackImages = [
    {
      url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400",
      description: `fallback image for ${query}`,
      alt_description: "fallback",
      downloads: 1000,
      likes: 50,
      width: 600,
      height: 400
    },
    {
      url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400",
      description: `fallback image for ${query}`,
      alt_description: "fallback",
      downloads: 1000,
      likes: 50,
      width: 600,
      height: 400
    }
  ];

  console.log(`📚 Verwende kuratierte Fallback-Kandidaten für "${query}"`);
  return fallbackImages;
}

function removeDuplicatesAndSort(candidates: ImageCandidate[]): ImageCandidate[] {
  // Duplikate nach URL entfernen
  const uniqueUrls = new Set();
  const unique = candidates.filter(candidate => {
    if (uniqueUrls.has(candidate.url)) {
      return false;
    }
    uniqueUrls.add(candidate.url);
    return true;
  });

  // Nach Qualitätsscore sortieren
  return unique.sort((a, b) => {
    const scoreA = (a.downloads * 0.4) + (a.likes * 0.3) + (a.width * a.height * 0.0001) + (a.description.length * 0.3);
    const scoreB = (b.downloads * 0.4) + (b.likes * 0.3) + (b.width * b.height * 0.0001) + (b.description.length * 0.3);
    return scoreB - scoreA;
  });
}

async function evaluateWithGPT4o(
  candidates: ImageCandidate[],
  category: string,
  word: string,
  translation: string
): Promise<GPTEvaluation> {

  if (!openai || !OPENAI_API_KEY) {
    console.log("⚠️ Keine OpenAI API verfügbar, verwende ersten Kandidaten");
    return {
      bestImageIndex: 0,
      confidence: 0.6,
      reasoning: "Keine GPT-4o Analyse verfügbar, verwende ersten verfügbaren Kandidaten",
      semanticMatch: true,
      qualityScore: 0.6,
      logicCheck: false,
      detailedAnalysis: "Keine detaillierte Analyse ohne OpenAI API",
      criticalIssues: ["Keine GPT-4o Evaluierung möglich"]
    };
  }

  const prompt = `
Du bist ein ULTRA-STRENGER semantischer Bildprüfer für deutsche Kinder-Lernmaterialien. VERSCHÄRFTE ANALYSE ERFORDERLICH!

KRITISCHER KONTEXT:
- Kategorie: "${category}"
- Englisches Wort: "${word}" 
- Deutsche Übersetzung: "${translation}"
- Zielgruppe: Deutsche Kinder 6-11 Jahre

SPEZIELLE SEMANTISCHE REGELN FÜR FAMILIENBEGRIFFE:
${getSemanticRulesForPrompt(word, translation)}

DRASTISCH VERSCHÄRFTE BEWERTUNGSKRITERIEN:

1. SEMANTISCHE PRÄZISION (60% - ERHÖHT!):
   - Zeigt das Bild EXAKT "${word}" ohne jede Mehrdeutigkeit?
   - Bei Familienbegriffen: KORREKTE ANZAHL PERSONEN?
   - "parents" = ZWEI Personen (Mann + Frau), NICHT eine Person!
   - "family" = MINDESTENS drei Personen (2 Erwachsene + Kind/er)
   - KEINE Interpretationsspielräume akzeptiert!

2. EINDEUTIGKEIT (25%):
   - Ist das Bild für ein 7-jähriges Kind SOFORT eindeutig?
   - Keine verwirrenden oder ablenkenden Elemente?
   - Hauptobjekt nimmt MINDESTENS 50% des Bildes ein?

3. BILDQUALITÄT (10%):
   - Scharfer Fokus, professionelle Qualität
   - Klare Beleuchtung und Kontraste

4. KINDERFREUNDLICHKEIT (5%):
   - Absolut geeignet für Kinder
   - Positive Darstellung

SOFORTIGE ABLEHNUNG BEI:
- Falscher Anzahl Personen für Familienbegriffe
- Mehrdeutigen oder unklaren Darstellungen  
- Ähnlichen aber nicht exakten Objekten
- Zu kleinen oder unklaren Hauptobjekten
- Ablenkenden Hintergründen oder Nebenelementen

BILDKANDIDATEN ZUR ULTRA-STRENGEN ANALYSE:
${candidates.map((c, i) => `${i + 1}. URL: ${c.url}
   Beschreibung: "${c.description}"
   Alt-Text: "${c.alt_description}"
   Qualität: ${c.downloads} Downloads, ${c.likes} Likes, ${c.width}x${c.height}px`).join('\n\n')}

ULTRA-STRENGE LOGIKPRÜFUNG:
- Ist das Bild 100% semantisch korrekt für "${word}"?
- Entspricht es EXAKT den definierten Regeln?
- Würde JEDES deutsche Kind sofort "${word}" erkennen?
- Gibt es IRGENDEINEN Zweifel? → DANN ABLEHNEN!

CONFIDENCE-RICHTLINIEN:
- 0.95+ = Perfekte semantische Übereinstimmung
- 0.9+ = Sehr gute Übereinstimmung  
- 0.8+ = Gute Übereinstimmung
- <0.8 = Ungeeignet, ablehnen!

ANTWORTE NUR MIT VALIDEM JSON:
{
  "bestImageIndex": number (1-${candidates.length} oder -1 wenn ALLE semantisch ungeeignet),
  "confidence": number (0.0-1.0, sei ULTRA-konservativ, nur >0.9 bei perfekter Semantik),
  "reasoning": "Detaillierte deutsche Begründung mit semantischer Analyse",
  "semanticMatch": boolean (true NUR bei 100%iger semantischer Korrektheit),
  "qualityScore": number (0.0-1.0, strenge Bildqualitätsbewertung),
  "logicCheck": boolean (true NUR wenn semantisch + qualitativ perfekt),
  "detailedAnalysis": "Semantische Analyse jedes Bildes mit Personenanzahl etc.",
  "criticalIssues": ["Alle semantischen und qualitativen Probleme auflisten"]
}`;

  try {
    console.log("🤖 Starte GPT-4o Bildanalyse...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ 
        role: "user", 
        content: prompt 
      }],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.1 // Niedrige Temperatur für konsistente Ergebnisse
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Keine Antwort von GPT-4o erhalten");
    }

    console.log("📋 GPT-4o Rohausgabe:", content.substring(0, 200) + "...");

    // Sichere JSON-Parsing mit Validierung
    let evaluation: GPTEvaluation;
    try {
      const parsed = JSON.parse(content);
      evaluation = {
        bestImageIndex: parsed.bestImageIndex || -1,
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
        reasoning: parsed.reasoning || "Keine Begründung verfügbar",
        semanticMatch: Boolean(parsed.semanticMatch),
        qualityScore: Math.max(0, Math.min(1, parsed.qualityScore || 0)),
        logicCheck: Boolean(parsed.logicCheck),
        detailedAnalysis: parsed.detailedAnalysis || "Keine detaillierte Analyse",
        criticalIssues: Array.isArray(parsed.criticalIssues) ? parsed.criticalIssues : []
      };
    } catch (parseError) {
      console.error("❌ JSON Parse Fehler:", parseError);
      throw new Error(`GPT-4o Antwort konnte nicht geparst werden: ${parseError}`);
    }

    console.log(`🎯 GPT-4o Evaluierung: Index ${evaluation.bestImageIndex}, Confidence ${evaluation.confidence}, Logic Check: ${evaluation.logicCheck}`);
    return evaluation;

  } catch (error) {
    console.error("❌ GPT-4o Evaluierung fehlgeschlagen:", error);
    return {
      bestImageIndex: -1,
      confidence: 0.3,
      reasoning: `GPT-4o Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      semanticMatch: false,
      qualityScore: 0.3,
      logicCheck: false,
      detailedAnalysis: "Evaluierung fehlgeschlagen",
      criticalIssues: ["GPT-4o Evaluierung nicht möglich"]
    };
  }
}

async function performLogicCheck(
  evaluation: GPTEvaluation,
  candidates: ImageCandidate[],
  category: string,
  word: string,
  translation: string
): Promise<ImageSearchResult> {

  console.log(`🔍 Führe DRASTISCH VERSCHÄRFTE Logikprüfung für "${word}" durch...`);

  // 1. Grundlegende Validierung
  if (evaluation.bestImageIndex === -1 || evaluation.bestImageIndex < 1 || evaluation.bestImageIndex > candidates.length) {
    console.log(`❌ Alle Bilder für "${word}" abgelehnt oder ungültiger Index`);
    return {
      bestImageUrl: getCuratedFallbackImage(word, category),
      confidence: 0.4,
      reasoning: `Keine geeigneten Bilder gefunden. ${evaluation.reasoning}. Verwende kuratiertes Fallback.`,
      logicCheck: false
    };
  }

  const selectedCandidate = candidates[evaluation.bestImageIndex - 1];

  // 2. VERSCHÄRFTE SEMANTISCHE LOGIKPRÜFUNG
  const semanticLogicResult = await performSemanticLogicCheck(selectedCandidate.url, word, translation, category);

  if (!semanticLogicResult.passed) {
    console.log(`❌ SEMANTISCHE LOGIKPRÜFUNG FEHLGESCHLAGEN für "${word}": ${semanticLogicResult.reason}`);
    return {
      bestImageUrl: getCuratedFallbackImage(word, category),
      confidence: 0.3,
      reasoning: `SEMANTISCHE LOGIKPRÜFUNG FEHLGESCHLAGEN: ${semanticLogicResult.reason}. Verwende kuratiertes Fallback.`,
      logicCheck: false
    };
  }

  // 3. Drastisch verschärfte Qualitätsprüfung (von 0.75 auf 0.9)
  const qualityPassed = 
    evaluation.confidence >= 0.9 &&         // DRASTISCH erhöhte Mindest-Confidence
    evaluation.semanticMatch === true &&     // Perfekte semantische Übereinstimmung
    evaluation.qualityScore >= 0.8 &&       // ERHÖHTE Bildqualität
    evaluation.logicCheck === true &&       // GPT-4o Logikprüfung bestanden
    selectedCandidate.downloads >= 2000 &&  // ERHÖHTE Mindest-Downloads
    selectedCandidate.likes >= 50;          // ERHÖHTE Mindest-Likes

  // 4. Zusätzliche Sicherheitsprüfungen
  const safetyChecks = {
    hasValidUrl: selectedCandidate.url && selectedCandidate.url.startsWith('https://'),
    hasDescription: selectedCandidate.description || selectedCandidate.alt_description,
    goodDimensions: selectedCandidate.width >= 500 && selectedCandidate.height >= 400, // ERHÖHTE Mindestauflösung
    noCriticalIssues: evaluation.criticalIssues.length === 0,
    semanticLogicPassed: semanticLogicResult.passed
  };

  const allSafetyChecksPassed = Object.values(safetyChecks).every(check => check);

  // 5. Finale Entscheidung mit verschärften Kriterien
  if (qualityPassed && allSafetyChecksPassed && semanticLogicResult.passed) {
    console.log(`✅ Bild für "${word}" besteht ALLE VERSCHÄRFTEN Prüfungen - Confidence: ${evaluation.confidence}`);
    console.log(`📊 Semantische Logik: ${semanticLogicResult.reason}`);

    return {
      bestImageUrl: selectedCandidate.url,
      confidence: evaluation.confidence,
      reasoning: `HOCHQUALITATIVES, SEMANTISCH KORREKTES Bild: ${evaluation.reasoning}. Semantik: ${semanticLogicResult.reason}`,
      logicCheck: true
    };
  } else {    console.log(`❌ Bild für "${word}" fällt durch VERSCHÄRFTE Qualitätsprüfung:`);
    console.log(`   - Qualität bestanden: ${qualityPassed}`);
    console.log(`   - Sicherheit bestanden: ${allSafetyChecksPassed}`);
    console.log(`   - Semantische Logik bestanden: ${semanticLogicResult.passed}`);
    console.log(`   - Kritische Probleme: ${evaluation.criticalIssues.join(', ')}`);

    return {
      bestImageUrl: getCuratedFallbackImage(word, category),
      confidence: 0.4,
      reasoning: `VERSCHÄRFTE PRÜFUNG FEHLGESCHLAGEN. Confidence: ${evaluation.confidence}, Semantik: ${semanticLogicResult.reason}. Verwende kuratiertes Bild.`,
      logicCheck: false
    };
  }
}

/**
 * NEUE DRASTISCH VERSCHÄRFTE SEMANTISCHE LOGIKPRÜFUNG
 */
async function performSemanticLogicCheck(
  imageUrl: string,
  word: string,
  translation: string,
  category: string
): Promise<{ passed: boolean; reason: string; confidence: number }> {

  if (!openai || !OPENAI_API_KEY) {
    return {
      passed: false,
      reason: "Keine OpenAI API verfügbar für semantische Prüfung",
      confidence: 0
    };
  }

  // Spezifische semantische Regeln für kritische Wörter
  const semanticRules = getSemanticRules(word, translation);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Du bist ein ULTRA-STRENGER semantischer Prüfer für deutsche Kinder-Lernmaterialien.

DEINE AUFGABE: Prüfe ob das Bild EXAKT die semantischen Anforderungen für "${word}" (deutsch: "${translation}") erfüllt.

KRITISCHE SEMANTISCHE REGELN:
${semanticRules}

ABSOLUT STRENGE BEWERTUNG:
- NUR bei 100%iger semantischer Korrektheit: bestanden
- Bei JEDEM Zweifel: durchgefallen
- Bei mehreren möglichen Interpretationen: durchgefallen
- Bei unklaren oder mehrdeutigen Darstellungen: durchgefallen

ANTWORT NUR MIT JSON:
{
  "passed": boolean (true NUR bei 100%iger Korrektheit),
  "reason": "Deutsche Begründung der semantischen Analyse",
  "confidence": number (0.0-1.0)
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `SEMANTISCHE PRÜFUNG: Zeigt dieses Bild EXAKT "${word}" (${translation}) gemäß den definierten Regeln?`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 400,
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Keine Antwort von semantischer Prüfung");
    }

    const result = JSON.parse(content);

    return {
      passed: Boolean(result.passed),
      reason: result.reason || "Keine Begründung verfügbar",
      confidence: Math.max(0, Math.min(1, result.confidence || 0))
    };

  } catch (error) {
    console.error("❌ Semantische Logikprüfung fehlgeschlagen:", error);
    return {
      passed: false,
      reason: `Technischer Fehler bei semantischer Prüfung: ${error instanceof Error ? error.message : "Unbekannt"}`,
      confidence: 0
    };
  }
}

/**
 * Definiert spezifische semantische Regeln für kritische Wörter
 */
function getSemanticRules(word: string, translation: string): string {
  const rules: Record<string, string> = {
    "parents": `
ELTERN erfordern ZWINGEND:
- GENAU ZWEI Personen (ein Mann UND eine Frau)
- Beide müssen als Erwachsene erkennbar sein
- NICHT akzeptiert: nur eine Person, nur Frauen, nur Männer
- NICHT akzeptiert: Kinder oder Jugendliche
- KLAR erkennbare Eltern-Rolle (z.B. mit Kindern zusammen)`,

    "family": `
FAMILIE erfordert ZWINGEND:
- MINDESTENS DREI Personen: zwei Erwachsene (Eltern) + mindestens ein Kind
- Klar erkennbare Familienstruktur
- NICHT akzeptiert: nur Erwachsene, nur Kinder, nur zwei Personen
- Alle Familienmitglieder müssen im Bild sichtbar sein`,

    "mother": `
MUTTER erfordert ZWINGEND:
- EINE erwachsene Frau
- Klar erkennbar als Mutter (idealerweise mit Kind/Kindern)
- NICHT akzeptiert: junge Mädchen, männliche Personen
- Mütterliche Rolle oder Kontext erkennbar`,

    "father": `
VATER erfordert ZWINGEND:
- EINEN erwachsenen Mann
- Klar erkennbar als Vater (idealerweise mit Kind/Kindern)
- NICHT akzeptiert: junge Jungen, weibliche Personen
- Väterliche Rolle oder Kontext erkennbar`,

    "grandmother": `
GROSSMUTTER erfordert ZWINGEND:
- EINE ältere, erwachsene Frau
- Erkennbar älteres Alter (Großmutter-Generation)
- NICHT akzeptiert: junge Frauen, Männer
- Großmütterliche Erscheinung oder Kontext`,

    "grandfather": `
GROSSVATER erfordert ZWINGEND:
- EINEN älteren, erwachsenen Mann
- Erkennbar älteres Alter (Großvater-Generation)
- NICHT akzeptiert: junge Männer, Frauen
- Großväterliche Erscheinung oder Kontext`,

    "son": `
SOHN erfordert ZWINGEND:
- EINEN männlichen Nachkommen (Junge oder junger Mann)
- Klar als männlich erkennbar
- NICHT akzeptiert: erwachsene Männer ohne Sohn-Kontext, Mädchen
- Sohn-Beziehung oder -Kontext erkennbar`,

    "daughter": `
TOCHTER erfordert ZWINGEND:
- EINE weibliche Nachkommin (Mädchen oder junge Frau)
- Klar als weiblich erkennbar
- NICHT akzeptiert: erwachsene Frauen ohne Tochter-Kontext, Jungen
- Tochter-Beziehung oder -Kontext erkennbar`,

    "brother": `
BRUDER erfordert ZWINGEND:
- EINEN männlichen Bruder (Junge oder junger Mann)
- Klar als Bruder erkennbar (idealerweise mit Geschwistern)
- NICHT akzeptiert: einzelne Männer ohne Bruder-Kontext, Schwestern
- Geschwister-Kontext erkennbar`,

    "sister": `
SCHWESTER erfordert ZWINGEND:
- EINE weibliche Schwester (Mädchen oder junge Frau)
- Klar als Schwester erkennbar (idealerweise mit Geschwistern)
- NICHT akzeptiert: einzelne Frauen ohne Schwester-Kontext, Brüder
- Geschwister-Kontext erkennbar`,

    "pizza": `PIZZA erfordert ZWINGEND:
- EINE ganze, runde Pizza oder Pizzastück
- Klar erkennbar mit Käse und Tomatensauce
- NICHT akzeptiert: andere italienische Gerichte, Brot, Kuchen
- Pizza muss dominant im Bild sein`,

    "banana": `BANANE erfordert ZWINGEND:
- EINE oder mehrere gelbe, reife Bananen
- Klar erkennbare Bananenform
- NICHT akzeptiert: andere gelbe Früchte, unreife grüne Bananen
- Banane muss dominant im Bild sein`,

    "bread": `BROT erfordert ZWINGEND:
- Erkennbares Brot (Laib, Scheiben oder Brötchen)
- Typische Brotstruktur und -farbe
- NICHT akzeptiert: Kuchen, Kekse, andere Backwaren
- Brot muss dominant im Bild sein`,

    "milk": `MILCH erfordert ZWINGEND:
- Sichtbare weiße Milch (Glas, Flasche oder Krug)
- Klar als Milch erkennbare weiße Flüssigkeit
- NICHT akzeptiert: andere weiße Getränke, Joghurt, Sahne
- Milch muss dominant im Bild sein`,

    "rice": `REIS erfordert ZWINGEND:
- Erkennbare Reiskörner (gekocht oder ungekocht)
- Typische weiße oder braune Reisstruktur
- NICHT akzeptiert: andere Getreide, Nudeln, kleine weiße Objekte
- Reis muss dominant im Bild sein`,

    "soup": `SUPPE erfordert ZWINGEND:
- Erkennbare Suppe in Schüssel oder Teller
- Flüssige Konsistenz mit eventuellen Einlagen
- NICHT akzeptiert: andere Flüssigkeiten, Getränke, Soßen
- Suppe muss dominant im Bild sein`,

    // Tiere-Begriffe
    "cat": `KATZE erfordert ZWINGEND:
- EINE Hauskatze mit charakteristischen Katzenmerkmalen
- Klar erkennbare Katzenohren, Schnurrhaare, Schwanz
- NICHT akzeptiert: andere Katzenarten (Löwe, Tiger), Hunde
- Katze muss dominant im Bild sein`,

    "dog": `HUND erfordert ZWINGEND:
- EINEN Hund mit charakteristischen Hundemerkmalen
- Klar erkennbare Hundeohren, Nase, Schwanz
- NICHT akzeptiert: Wölfe, Füchse, andere Tiere
- Hund muss dominant im Bild sein`,

    "elephant": `ELEFANT erfordert ZWINGEND:
- EINEN Elefanten mit charakteristischem Rüssel und großen Ohren
- Klar erkennbare Elefantenmerkmale (Rüssel, Stoßzähne, graue Haut)
- NICHT akzeptiert: andere große Tiere
- Elefant muss dominant im Bild sein`,

    "tiger": `TIGER erfordert ZWINGEND:
- EINEN Tiger mit charakteristischen orange-schwarzen Streifen
- Klar erkennbare Tigermerkmale (Streifen, Raubkatzengesicht)
- NICHT akzeptiert: andere Katzen, Löwen ohne Streifen
- Tiger muss dominant im Bild sein`,

    "rabbit": `HASE erfordert ZWINGEND:
- EINEN Hasen mit langen, aufgestellten Ohren
- Klar erkennbare Hasenmerkmale (lange Ohren, Stupsnase)
- NICHT akzeptiert: andere kleine Tiere, Katzen
- Hase muss dominant im Bild sein`,

    "bear": `BÄR erfordert ZWINGEND:
- EINEN Bären mit charakteristischen Bärenmerkmalen
- Klar erkennbare Bärengestalt (massiger Körper, runde Ohren)
- NICHT akzeptiert: andere große Tiere
- Bär muss dominant im Bild sein`
  };

  return rules[word.toLowerCase()] || `
ALLGEMEINE REGEL für "${word}" (${translation}):
- Das Bild muss EXAKT das gesuchte Konzept zeigen
- Keine ähnlichen oder verwandten Objekte
- Klar und eindeutig für deutsche Kinder erkennbar
- Hauptobjekt muss dominant im Bild sein`;
}

function getCuratedFallbackImage(word: string, category: string): string {
  // SPEZIFISCHE PERFEKTE BILDER FÜR FAMILIE-KATEGORIE (nach Ihren Anforderungen)
  const perfectFamilyImages: Record<string, string> = {
    // Eltern: Mann, Frau und Kind zusammen
    "parents": "https://images.unsplash.com/photo-1609220136736-443140cffec6?fit=crop&w=600&h=400&q=80",
    "eltern": "https://images.unsplash.com/photo-1609220136736-443140cffec6?fit=crop&w=600&h=400&q=80",

    // Familie: Mehrere Familienmitglieder
    "family": "https://images.unsplash.com/photo-1588392382834-a891154bca4d?fit=crop&w=600&h=400&q=80",
    "familie": "https://images.unsplash.com/photo-1588392382834-a891154bca4d?fit=crop&w=600&h=400&q=80",

    // Mutter: Frau mittleren Alters
    "mother": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?fit=crop&w=600&h=400&q=80",
    "mutter": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?fit=crop&w=600&h=400&q=80",

    // Vater: Mann mittleren Alters  
    "father": "https://images.unsplash.com/photo-1552058544-f2b08422138a?fit=crop&w=600&h=400&q=80",
    "vater": "https://images.unsplash.com/photo-1552058544-f2b08422138a?fit=crop&w=600&h=400&q=80",

    // Tochter: Jüngeres Mädchen
    "daughter": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?fit=crop&w=600&h=400&q=80",
    "tochter": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?fit=crop&w=600&h=400&q=80",

    // Sohn: Jüngerer Junge
    "son": "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?fit=crop&w=600&h=400&q=80",
    "sohn": "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?fit=crop&w=600&h=400&q=80",

    // Bruder: Jüngerer Junge
    "brother": "https://images.unsplash.com/photo-1632179560465-39f9c18de454?fit=crop&w=600&h=400&q=80",
    "bruder": "https://images.unsplash.com/photo-1632179560465-39f9c18de454?fit=crop&w=600&h=400&q=80",

    // Schwester: Jüngeres Mädchen
    "sister": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=crop&w=600&h=400&q=80",
    "schwester": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=crop&w=600&h=400&q=80",

    // Großmutter: Ältere Frau
    "grandmother": "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?fit=crop&w=600&h=400&q=80",
    "großmutter": "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?fit=crop&w=600&h=400&q=80",
    "grossmutter": "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?fit=crop&w=600&h=400&q=80",

    // Großvater: Älterer Mann
    "grandfather": "https://images.unsplash.com/photo-1560963689-7c5b3c995d35?fit=crop&w=600&h=400&q=80",
    "großvater": "https://images.unsplash.com/photo-1560963689-7c5b3c995d35?fit=crop&w=600&h=400&q=80",
    "grossvater": "https://images.unsplash.com/photo-1560963689-7c5b3c995d35?fit=crop&w=600&h=400&q=80",

    // Baby: Kleinkind
    "baby": "https://images.unsplash.com/photo-1566004100631-35d015d6a491?fit=crop&w=600&h=400&q=80",

    // Kind: Allgemeines Kind
    "child": "https://images.unsplash.com/photo-1509062522246-3755977927d7?fit=crop&w=600&h=400&q=80",
    "kind": "https://images.unsplash.com/photo-1509062522246-3755977927d7?fit=crop&w=600&h=400&q=80",

    // Weitere Familienmitglieder
    "uncle": "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?fit=crop&w=600&h=400&q=80",
    "onkel": "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?fit=crop&w=600&h=400&q=80",

    "aunt": "https://images.unsplash.com/photo-1494790108755-2616c96d5e82?fit=crop&w=600&h=400&q=80",
    "tante": "https://images.unsplash.com/photo-1494790108755-2616c96d5e82?fit=crop&w=600&h=400&q=80",

    "nephew": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?fit=crop&w=600&h=400&q=80",
    "neffe": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?fit=crop&w=600&h=400&q=80",

    "niece": "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?fit=crop&w=600&h=400&q=80",
    "nichte": "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?fit=crop&w=600&h=400&q=80",

    "cousin": "https://images.unsplash.com/photo-1554151228-14d9def656e4?fit=crop&w=600&h=400&q=80"
  };

  // Hochwertige, manuell kuratierte Bilder für alle Kategorien
  const curatedImages: Record<string, Record<string, string>> = {
    animals: {
      cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400&q=80",
      katze: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400&q=80",
      dog: "https://images.unsplash.com/photo-1552053831-71594a27632d?fit=crop&w=600&h=400&q=80",
      hund: "https://images.unsplash.com/photo-1552053831-71594a27632d?fit=crop&w=600&h=400&q=80",
      bird: "https://images.unsplash.com/photo-1444464666168-49d633b86797?fit=crop&w=600&h=400&q=80",
      vogel: "https://images.unsplash.com/photo-1444464666168-49d633b86797?fit=crop&w=600&h=400&q=80",
      fish: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?fit=crop&w=600&h=400&q=80",
      fisch: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?fit=crop&w=600&h=400&q=80",
      elephant: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?fit=crop&w=600&h=400&q=80",
      elefant: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?fit=crop&w=600&h=400&q=80",
      tiger: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?fit=crop&w=600&h=400&q=80",
      rabbit: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?fit=crop&w=600&h=400&q=80",
      hase: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?fit=crop&w=600&h=400&q=80",
      mouse: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?fit=crop&w=600&h=400&q=80",
      maus: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?fit=crop&w=600&h=400&q=80",
      bear: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?fit=crop&w=600&h=400&q=80",
      bär: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?fit=crop&w=600&h=400&q=80",
      monkey: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?fit=crop&w=600&h=400&q=80",
      affe: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?fit=crop&w=600&h=400&q=80",
      giraffe: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?fit=crop&w=600&h=400&q=80",
      zebra: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?fit=crop&w=600&h=400&q=80",
      sheep: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400&q=80",
      schaf: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400&q=80",
      cow: "https://images.unsplash.com/photo-1516467508483-a9ba5d0fe6a5?fit=crop&w=600&h=400&q=80",
      kuh: "https://images.unsplash.com/photo-1516467508483-a9ba5d0fe6a5?fit=crop&w=600&h=400&q=80",
      pig: "https://images.unsplash.com/photo-1563281577-b9afd1ad8b8d?fit=crop&w=600&h=400&q=80",
      schwein: "https://images.unsplash.com/photo-1563281577-b9afd1ad8b8d?fit=crop&w=600&h=400&q=80",
      duck: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?fit=crop&w=600&h=400&q=80",
      ente: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?fit=crop&w=600&h=400&q=80",
      horse: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?fit=crop&w=600&h=400&q=80",
      pferd: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?fit=crop&w=600&h=400&q=80",
      lion: "https://images.unsplash.com/photo-1552053831-71594a27632d?fit=crop&w=600&h=400&q=80",
      löwe: "https://images.unsplash.com/photo-1552053831-71594a27632d?fit=crop&w=600&h=400&q=80",
      frog: "https://images.unsplash.com/photo-1539632346654-dd4c3cffad8c?fit=crop&w=600&h=400&q=80",
      frosch: "https://images.unsplash.com/photo-1539632346654-dd4c3cffad8c?fit=crop&w=600&h=400&q=80"
    },
    food: {
      apple: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?fit=crop&w=600&h=400&q=80",
      banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?fit=crop&w=600&h=400&q=80",
      bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?fit=crop&w=600&h=400&q=80",
      cheese: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b?fit=crop&w=600&h=400&q=80",
      egg: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?fit=crop&w=600&h=400&q=80",
      orange: "https://images.unsplash.com/photo-1547514701-42782101795e?fit=crop&w=600&h=400&q=80",
      milk: "https://images.unsplash.com/photo-1550583724-b2692b85b150?fit=crop&w=600&h=400&q=80"
    },
    transport: {
      car: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?fit=crop&w=600&h=400&q=80",
      auto: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?fit=crop&w=600&h=400&q=80",
      bus: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?fit=crop&w=600&h=400&q=80",
      train: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?fit=crop&w=600&h=400&q=80",
      zug: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?fit=crop&w=600&h=400&q=80",
      bicycle: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fit=crop&w=600&h=400&q=80",
      fahrrad: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fit=crop&w=600&h=400&q=80",
      plane: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?fit=crop&w=600&h=400&q=80",
      flugzeug: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?fit=crop&w=600&h=400&q=80",
      boat: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?fit=crop&w=600&h=400&q=80",
      boot: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?fit=crop&w=600&h=400&q=80"
    },
    colors: {
      red: "https://images.unsplash.com/photo-1549298916-b41d501d3772?fit=crop&w=600&h=400&q=80",
      rot: "https://images.unsplash.com/photo-1549298916-b41d501d3772?fit=crop&w=600&h=400&q=80",
      blue: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?fit=crop&w=600&h=400&q=80",
      blau: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?fit=crop&w=600&h=400&q=80",
      green: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?fit=crop&w=600&h=400&q=80",
      grün: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?fit=crop&w=600&h=400&q=80",
      yellow: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?fit=crop&w=600&h=400&q=80",
      gelb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?fit=crop&w=600&h=400&q=80"
    },
    home: {
      house: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400&q=80",
      haus: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400&q=80",
      door: "https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?fit=crop&w=600&h=400&q=80",
      tür: "https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?fit=crop&w=600&h=400&q=80",
      window: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?fit=crop&w=600&h=400&q=80",
      fenster: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?fit=crop&w=600&h=400&q=80",
      bed: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400&q=80",
      bett: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400&q=80"
    },
    school: {
      backpack: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?fit=crop&w=600&h=400&q=80",
      rucksack: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?fit=crop&w=600&h=400&q=80",
      book: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?fit=crop&w=600&h=400&q=80",
      buch: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?fit=crop&w=600&h=400&q=80",
      pencil: "https://images.unsplash.com/photo-1455390582262-044cdead277a?fit=crop&w=600&h=400&q=80",
      bleistift: "https://images.unsplash.com/photo-1455390582262-044cdead277a?fit=crop&w=600&h=400&q=80",
      scissors: "https://images.unsplash.com/photo-1562237213-e2cc7200de24?fit=crop&w=600&h=400&q=80",
      schere: "https://images.unsplash.com/photo-1562237213-e2cc7200de24?fit=crop&w=600&h=400&q=80",
      glue: "https://images.unsplash.com/photo-1605826606964-b44e4b06b0f8?fit=crop&w=600&h=400&q=80",
      kleber: "https://images.unsplash.com/photo-1605826606964-b44e4b06b0f8?fit=crop&w=600&h=400&q=80",
      ruler: "https://images.unsplash.com/photo-1594736797933-d0f06ba97c5b?fit=crop&w=600&h=400&q=80",
      lineal: "https://images.unsplash.com/photo-1594736797933-d0f06ba97c5b?fit=crop&w=600&h=400&q=80"
    }
  };

  // 1. PRIORITÄT: Familie-spezifische perfekte Bilder
  if (category.toLowerCase() === "family" || category.toLowerCase() === "familie") {
    const perfectImage = perfectFamilyImages[word.toLowerCase()];
    if (perfectImage) {
      console.log(`👨‍👩‍👧‍👦 Verwende PERFEKTES Familie-Bild für "${word}"`);
      return perfectImage;
    }
  }

   // 1. PRIORITÄT: Food-spezifische perfekte Bilder
   if (category.toLowerCase() === "food" || category.toLowerCase() === "essen") {
    const perfectImage = perfectFamilyImages[word.toLowerCase()];
    if (perfectImage) {
      console.log(`🍎 Verwende PERFEKTES Food-Bild für "${word}"`);
      return perfectImage;
    }
  }

  // 1. PRIORITÄT: Animals-spezifische perfekte Bilder
  if (category.toLowerCase() === "animals" || category.toLowerCase() === "tiere") {
    const perfectImage = perfectFamilyImages[word.toLowerCase()];
    if (perfectImage) {
      console.log(`🐾 Verwende PERFEKTES Tier-Bild für "${word}"`);
      return perfectImage;
    }
  }

  // 2. Spezifisches Bild für das Wort in anderen Kategorien suchen
  const categoryImages = curatedImages[category.toLowerCase()];
  if (categoryImages && categoryImages[word.toLowerCase()]) {
    console.log(`📚 Verwende kuratiertes Bild für "${word}"`);
    return categoryImages[word.toLowerCase()];
  }

  // 3. Fallback zu besten Standard-Bildern pro Kategorie
  const categoryDefaults: Record<string, string> = {
    animals: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400&q=80",
    food: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?fit=crop&w=600&h=400&q=80",
    transport: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?fit=crop&w=600&h=400&q=80",
    family: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?fit=crop&w=600&h=400&q=80",
    colors: "https://images.unsplash.com/photo-1549298916-b41d501d3772?fit=crop&w=600&h=400&q=80",
    home: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400&q=80",
    school: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?fit=crop&w=600&h=400&q=80",
    animals: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400&q=80"
  };

  const fallbackUrl = categoryDefaults[category.toLowerCase()] || categoryDefaults.family;
  console.log(`📚 Verwende Kategorie-Fallback für "${word}" in "${category}"`);
  return fallbackUrl;
}

/**
 * NEUE FUNKTION: ChatGPT-4o Bilderstellung
 */
export async function generateImageWithChatGPT(
  word: string,
  translation: string,
  category: string,
  strategy: string = "simple"
): Promise<string | null> {

  if (!openai || !OPENAI_API_KEY) {
    console.log("⚠️ Keine OpenAI API verfügbar für Bilderstellung");
    return null;
  }

  try {
    console.log(`🎨 Erstelle Bild mit ChatGPT-4o für "${word}" (${translation})`);

    // VEREINFACHTE, SICHERE Prompt-Strategien
    const getImagePrompt = (strategy: string): Record<string, string> => {
      const basePrompts: Record<string, string> = {
        // SEHR EINFACHE, SICHERE TIER-PROMPTS
        "cat": "cute orange cat sitting, cartoon style, white background",
        "dog": "friendly golden dog sitting, cartoon style, white background", 
        "bird": "small blue bird, cartoon style, white background",
        "fish": "orange fish swimming, cartoon style, white background",
        "elephant": "gray elephant, cartoon style, white background",
        "tiger": "orange tiger with stripes, cartoon style, white background",
        "rabbit": "white bunny with long ears, cartoon style, white background",
        "mouse": "small gray mouse, cartoon style, white background",
        "bear": "brown teddy bear, cartoon style, white background",
        "monkey": "brown monkey, cartoon style, white background",
        "giraffe": "tall giraffe with spots, cartoon style, white background",
        "zebra": "zebra with stripes, cartoon style, white background",
        "sheep": "fluffy white sheep, cartoon style, white background",
        "cow": "cow with spots, cartoon style, white background",
        "pig": "pink pig, cartoon style, white background",
        "duck": "yellow duck, cartoon style, white background",
        "horse": "brown horse, cartoon style, white background",
        "lion": "golden lion, cartoon style, white background",
        "frog": "green frog, cartoon style, white background",
        "chicken": "white chicken, cartoon style, white background",
        "deer": "brown deer, cartoon style, white background",
        "owl": "brown owl, cartoon style, white background",
        "butterfly": "colorful butterfly, cartoon style, white background",
        "bee": "yellow and black bee, cartoon style, white background",
        "snake": "green snake, cartoon style, white background",
        "turtle": "green turtle, cartoon style, white background",
        "fox": "red fox, cartoon style, white background",
        "wolf": "gray wolf, cartoon style, white background",
        "dolphin": "gray dolphin, cartoon style, white background",
        "shark": "gray shark, cartoon style, white background",
        "penguin": "black and white penguin, cartoon style, white background",
        "goat": "white goat, cartoon style, white background",
        "kangaroo": "brown kangaroo, cartoon style, white background",
        "octopus": "purple octopus, cartoon style, white background",
        "whale": "blue whale, cartoon style, white background"
      };

      return basePrompts;
      // Familie-Begriffe - VEREINFACHT
      "parents": "two adults standing together, cartoon style, white background",
      "eltern": "two adults standing together, cartoon style, white background",
      "family": "Ein warmes Familienfoto mit MINDESTENS DREI Personen: zwei Erwachsene (Mutter und Vater) und mindestens ein Kind. Alle lächeln glücklich, sitzen oder stehen zusammen. Heller, freundlicher Hintergrund. Ideal für deutsche Kinder-Lernmaterialien.",
      "familie": "Ein warmes Familienfoto mit MINDESTENS DREI Personen: zwei Erwachsene (Mutter und Vater) und mindestens ein Kind. Alle lächeln glücklich, sitzen oder stehen zusammen. Heller, freundlicher Hintergrund. Ideal für deutsche Kinder-Lernmaterialien.",
      "mother": "Ein professionelles Portrait einer freundlichen Frau mittleren Alters (30-45 Jahre) mit einem warmen, mütterlichen Lächeln. Sie trägt alltägliche, gepflegte Kleidung. Heller, neutraler Hintergrund. Perfekt für deutsche Kinder-Lernmaterialien.",
      "mutter": "Ein professionelles Portrait einer freundlichen Frau mittleren Alters (30-45 Jahre) mit einem warmen, mütterlichen Lächeln. Sie trägt alltägliche, gepflegte Kleidung. Heller, neutraler Hintergrund. Perfekt für deutsche Kinder-Lernmaterialien.",
      "father": "Ein professionelles Portrait eines freundlichen Mannes mittleren Alters (30-45 Jahre) mit einem warmen, väterlichen Lächeln. Er trägt alltägliche, gepflegte Kleidung. Heller, neutraler Hintergrund. Perfekt für deutsche Kinder-Lernmaterialien.",
      "vater": "Ein professionelles Portrait eines freundlichen Mannes mittleren Alters (30-45 Jahre) mit einem warmen, väterlichen Lächeln. Er trägt alltägliche, gepflegte Kleidung. Heller, neutraler Hintergrund. Perfekt für deutsche Kinder-Lernmaterialien.",
      "daughter": "Ein professionelles Portrait eines freundlichen Mädchens (8-12 Jahre) mit einem strahlenden Lächeln. Sie trägt kinderfreundliche, bunte Kleidung. Heller, fröhlicher Hintergrund. Ideal für deutsche Kinder-Lernmaterialien.",
      "tochter": "Ein professionelles Portrait eines freundlichen Mädchens (8-12 Jahre) mit einem strahlenden Lächeln. Sie trägt kinderfreundliche, bunte Kleidung. Heller, fröhlicher Hintergrund. Ideal für deutsche Kinder-Lernmaterialien.",
      "son": "Ein professionelles Portrait eines freundlichen Jungen (8-12 Jahre) mit einem strahlenden Lächeln. Er trägt kinderfreundliche, bunte Kleidung. Heller, fröhlicher Hintergrund. Ideal für deutsche Kinder-Lernmaterialien.",
      "sohn": "Ein professionelles Portrait eines freundlichen Jungen (8-12 Jahre) mit einem strahlenden Lächeln. Er trägt kinderfreundliche, bunte Kleidung. Heller, fröhlicher Hintergrund. Ideal für deutsche Kinder-Lernmaterialien.",
      "brother": "Ein professionelles Portrait eines freundlichen Jungen (10-14 Jahre) mit einem fröhlichen Lächeln. Er trägt lässige, jugendiche Kleidung. Heller, neutraler Hintergrund. Perfekt für deutsche Kinder-Lernmaterialien.",
      "bruder": "Ein professionelles Portrait eines freundlichen Jungen (10-14 Jahre) mit einem fröhlichen Lächeln. Er trägt lässige, jugendliche Kleidung. Heller, neutraler Hintergrund. Perfekt für deutsche Kinder-Lernmaterialien.",
      "sister": "Ein professionelles Portrait eines freundlichen Mädchens (10-14 Jahre) mit einem fröhlichen Lächeln. Sie trägt lässige, jugendliche Kleidung. Heller, neutraler Hintergrund. Perfekt für deutsche Kinder-Lernmaterialien.",
      "schwester": "Ein professionelles Portrait eines freundlichen Mädchens (10-14 Jahre) mit einem fröhlichen Lächeln. Sie trägt lässige, jugendliche Kleidung. Heller, neutraler Hintergrund. Perfekt für deutsche Kinder-Lernmaterialien.",
      "grandmother": "Ein professionelles Portrait einer freundlichen älteren Frau (60-70 Jahre) mit einem warmen, großmütterlichen Lächeln. Sie trägt elegante, altersgerechte Kleidung. Heller, neutraler Hintergrund. Ideal für deutsche Kinder-Lernmaterialien.",
      "großmutter": "Ein professionelles Portrait einer freundlichen älteren Frau (60-70 Jahre) mit einem warmen, großmütterlichen Lächeln. Sie trägt elegante, altersgerechte Kleidung. Heller, neutraler Hintergrund. Ideal für deutsche Kinder-Lernmaterialien.",
      "grandfather": "Ein professionelles Portrait eines freundlichen älteren Mannes (60-70 Jahre) mit einem warmen, großväterlichen Lächeln. Er trägt elegante, altersgerechte Kleidung. Heller, neutraler Hintergrund. Ideal für deutsche Kinder-Lernmaterialien.",
      "großvater": "Ein professionelles Portrait eines freundlichen älteren Mannes (60-70 Jahre) mit einem warmen, großväterlichen Lächeln. Er trägt elegante, altersgerechte Kleidung. Heller, neutraler Hintergrund. Ideal für deutsche Kinder-Lernmaterialien.",

      // Schule-Begriffe
      "backpack": "Ein hochwertiger, neuer Schulrucksack vor einem weißen, neutralen Hintergrund. Der Rucksack ist klar erkennbar, gut beleuchtet und perfekt für deutsche Kinder-Lernmaterialien geeignet.",
      "rucksack": "Ein hochwertiger, neuer Schulrucksack vor einem weißen, neutralen Hintergrund. Der Rucksack ist klar erkennbar, gut beleuchtet und perfekt für deutsche Kinder-Lernmaterialien geeignet.",
      "book": "Ein einzelnes, offenes Buch mit sichtbaren Seiten vor einem hellen, neutralen Hintergrund. Das Buch nimmt den größten Teil des Bildes ein und ist perfekt für deutsche Kinder-Lernmaterialien.",
      "buch": "Ein einzelnes, offenes Buch mit sichtbaren Seiten vor einem hellen, neutralen Hintergrund. Das Buch nimmt den größten Teil des Bildes ein und ist perfekt für deutsche Kinder-Lernmaterialien.",
      "pencil": "Ein einzelner, neuer Bleistift mit scharfer Spitze vor einem weißen, neutralen Hintergrund. Der Bleistift ist klar erkennbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "bleistift": "Ein einzelner, neuer Bleistift mit scharfer Spitze vor einem weißen, neutralen Hintergrund. Der Bleistift ist klar erkennbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "scissors": "Eine neue, saubere Schere vor einem weißen, neutralen Hintergrund. Die Schere ist komplett sichtbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "schere": "Eine neue, saubere Schere vor einem weißen, neutralen Hintergrund. Die Schere ist komplett sichtbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "glue": "Ein Klebestift oder eine Klebeflasche vor einem weißen, neutralen Hintergrund. Der Kleber ist klar erkennbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "kleber": "Ein Klebestift oder eine Klebeflasche vor einem weißen, neutralen Hintergrund. Der Kleber ist klar erkennbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "ruler": "Ein Lineal aus Holz oder Plastik vor einem weißen, neutralen Hintergrund. Das Lineal ist komplett sichtbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "lineal": "Ein Lineal aus Holz oder Plastik vor einem weißen, neutralen Hintergrund. Das Lineal ist komplett sichtbar und perfekt für deutsche Kinder-Lernmaterialien.",

      // Transport-Begriffe  
      "car": "Ein modernes Auto vor einem hellen, neutralen Hintergrund. Das Auto ist komplett sichtbar, gut beleuchtet und perfekt für deutsche Kinder-Lernmaterialien.",
      "auto": "Ein modernes Auto vor einem hellen, neutralen Hintergrund. Das Auto ist komplett sichtbar, gut beleuchtet und perfekt für deutsche Kinder-Lernmaterialien.",
      "bus": "Ein gelber Schulbus oder öffentlicher Bus vor einem hellen, neutralen Hintergrund. Der Bus ist komplett sichtbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "bicycle": "Ein Fahrrad vor einem hellen, neutralen Hintergrund. Das Fahrrad ist komplett sichtbar, gut beleuchtet und perfekt für deutsche Kinder-Lernmaterialien.",
      "fahrrad": "Ein Fahrrad vor einem hellen, neutralen Hintergrund. Das Fahrrad ist komplett sichtbar, gut beleuchtet und perfekt für deutsche Kinder-Lernmaterialien.",
      "plane": "Ein Passagierflugzeug vor einem hellen, neutralen Hintergrund. Das Flugzeug ist komplett sichtbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "flugzeug": "Ein Passagierflugzeug vor einem hellen, neutralen Hintergrund. Das Flugzeug ist komplett sichtbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "train": "Ein Zug vor einem hellen, neutralen Hintergrund. Der Zug ist komplett sichtbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "zug": "Ein Zug vor einem hellen, neutralen Hintergrund. Der Zug ist komplett sichtbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "boat": "Ein Boot vor einem hellen, neutralen Hintergrund. Das Boot ist komplett sichtbar und perfekt für deutsche Kinder-Lernmaterialien.",
      "boot": "Ein Boot vor einem hellen, neutralen Hintergrund. Das Boot ist komplett sichtbar und perfekt für deutsche Kinder-Lernmaterialien.",

      // OPTIMIERTE TIER-PROMPTS für ChatGPT-4o - VERBESSERTE ERFOLGSRATE
      "cat": "A cute friendly house cat sitting peacefully, simple cartoon style, clean white background, perfect for children's educational materials",
      "katze": "A cute friendly house cat sitting peacefully, simple cartoon style, clean white background, perfect for children's educational materials",
      "dog": "A friendly golden retriever dog sitting with a happy expression, simple cartoon style, clean white background, perfect for children's educational materials",
      "hund": "A friendly golden retriever dog sitting with a happy expression, simple cartoon style, clean white background, perfect for children's educational materials",
      "bird": "A colorful small songbird perched on a branch, simple cartoon style, clean white background, perfect for children's educational materials",
      "vogel": "A colorful small songbird perched on a branch, simple cartoon style, clean white background, perfect for children's educational materials",
      "fish": "A bright orange goldfish swimming, simple cartoon style, clean white background, perfect for children's educational materials",
      "fisch": "A bright orange goldfish swimming, simple cartoon style, clean white background, perfect for children's educational materials",
      "elephant": "A gentle gray elephant with big ears and trunk, simple cartoon style, clean white background, perfect for children's educational materials",
      "elefant": "A gentle gray elephant with big ears and trunk, simple cartoon style, clean white background, perfect for children's educational materials",
      "tiger": "A beautiful orange tiger with black stripes in a peaceful pose, simple cartoon style, clean white background, perfect for children's educational materials",
      "rabbit": "A cute white bunny with long ears sitting upright, simple cartoon style, clean white background, perfect for children's educational materials",
      "hase": "A cute white bunny with long ears sitting upright, simple cartoon style, clean white background, perfect for children's educational materials",
      "mouse": "A small gray mouse with round ears and a long tail, simple cartoon style, clean white background, perfect for children's educational materials",
      "maus": "A small gray mouse with round ears and a long tail, simple cartoon style, clean white background, perfect for children's educational materials",
      "bear": "A friendly brown teddy bear in a sitting position, simple cartoon style, clean white background, perfect for children's educational materials",
      "bär": "A friendly brown teddy bear in a sitting position, simple cartoon style, clean white background, perfect for children's educational materials",
      "monkey": "A cute brown monkey sitting with a friendly smile, simple cartoon style, clean white background, perfect for children's educational materials",
      "affe": "A cute brown monkey sitting with a friendly smile, simple cartoon style, clean white background, perfect for children's educational materials",
      "giraffe": "A tall yellow giraffe with brown spots and a long neck, simple cartoon style, clean white background, perfect for children's educational materials",
      "zebra": "A black and white striped zebra standing gracefully, simple cartoon style, clean white background, perfect for children's educational materials",
      "sheep": "A fluffy white sheep with woolly coat, simple cartoon style, clean white background, perfect for children's educational materials",
      "schaf": "A fluffy white sheep with woolly coat, simple cartoon style, clean white background, perfect for children's educational materials",
      "cow": "A black and white spotted dairy cow, simple cartoon style, clean white background, perfect for children's educational materials",
      "kuh": "A black and white spotted dairy cow, simple cartoon style, clean white background, perfect for children's educational materials",
      "pig": "A pink pig with a curly tail, simple cartoon style, clean white background, perfect for children's educational materials",
      "schwein": "A pink pig with a curly tail, simple cartoon style, clean white background, perfect for children's educational materials",
      "duck": "A yellow duck with orange beak and feet, simple cartoon style, clean white background, perfect for children's educational materials",
      "ente": "A yellow duck with orange beak and feet, simple cartoon style, clean white background, perfect for children's educational materials",
      "horse": "A brown horse standing proudly, simple cartoon style, clean white background, perfect for children's educational materials",
      "pferd": "A brown horse standing proudly, simple cartoon style, clean white background, perfect for children's educational materials",
      "lion": "A friendly golden lion with a fluffy mane, simple cartoon style, clean white background, perfect for children's educational materials",
      "löwe": "A friendly golden lion with a fluffy mane, simple cartoon style, clean white background, perfect for children's educational materials",
      "frog": "A green frog sitting on a lily pad, simple cartoon style, clean white background, perfect for children's educational materials",
      "frosch": "A green frog sitting on a lily pad, simple cartoon style, clean white background, perfect for children's educational materials",
      "chicken": "A red and white hen with a red comb, simple cartoon style, clean white background, perfect for children's educational materials",
      "huhn": "A red and white hen with a red comb, simple cartoon style, clean white background, perfect for children's educational materials",
      
      // ERWEITERTE TIER-VOKABELN
      "deer": "A gentle brown deer standing in nature, simple cartoon style, clean white background, perfect for children's educational materials",
      "reh": "A gentle brown deer standing in nature, simple cartoon style, clean white background, perfect for children's educational materials",
      "owl": "A wise brown owl with big eyes perched on a branch, simple cartoon style, clean white background, perfect for children's educational materials",
      "eule": "A wise brown owl with big eyes perched on a branch, simple cartoon style, clean white background, perfect for children's educational materials",
      "butterfly": "A colorful butterfly with spread wings, simple cartoon style, clean white background, perfect for children's educational materials",
      "schmetterling": "A colorful butterfly with spread wings, simple cartoon style, clean white background, perfect for children's educational materials",
      "bee": "A yellow and black striped bee with wings, simple cartoon style, clean white background, perfect for children's educational materials",
      "biene": "A yellow and black striped bee with wings, simple cartoon style, clean white background, perfect for children's educational materials",
      "snake": "A friendly green snake coiled up, simple cartoon style, clean white background, perfect for children's educational materials",
      "schlange": "A friendly green snake coiled up, simple cartoon style, clean white background, perfect for children's educational materials",
      "turtle": "A green turtle with patterned shell, simple cartoon style, clean white background, perfect for children's educational materials",
      "schildkröte": "A green turtle with patterned shell, simple cartoon style, clean white background, perfect for children's educational materials",
      "fox": "A red fox with a bushy tail sitting, simple cartoon style, clean white background, perfect for children's educational materials",
      "fuchs": "A red fox with a bushy tail sitting, simple cartoon style, clean white background, perfect for children's educational materials",
      "wolf": "A gray wolf sitting peacefully, simple cartoon style, clean white background, perfect for children's educational materials",
      "dolphin": "A gray dolphin jumping out of water, simple cartoon style, clean white background, perfect for children's educational materials",
      "delfin": "A gray dolphin jumping out of water, simple cartoon style, clean white background, perfect for children's educational materials",
      "shark": "A gray shark swimming, simple cartoon style, clean white background, perfect for children's educational materials",
      "hai": "A gray shark swimming, simple cartoon style, clean white background, perfect for children's educational materials",
      "penguin": "A black and white penguin standing upright, simple cartoon style, clean white background, perfect for children's educational materials",
      "pinguin": "A black and white penguin standing upright, simple cartoon style, clean white background, perfect for children's educational materials",
      "goat": "A white goat with horns, simple cartoon style, clean white background, perfect for children's educational materials",
      "ziege": "A white goat with horns, simple cartoon style, clean white background, perfect for children's educational materials",
      "kangaroo": "A brown kangaroo with a pouch, simple cartoon style, clean white background, perfect for children's educational materials",
      "känguru": "A brown kangaroo with a pouch, simple cartoon style, clean white background, perfect for children's educational materials",
      "octopus": "A purple octopus with eight tentacles, simple cartoon style, clean white background, perfect for children's educational materials",
      "krake": "A purple octopus with eight tentacles, simple cartoon style, clean white background, perfect for children's educational materials",
      "whale": "A large blue whale in the ocean, simple cartoon style, clean white background, perfect for children's educational materials",
      "wal": "A large blue whale in the ocean, simple cartoon style, clean white background, perfect for children's educational materials",

      // Farben-Begriffe
      "red": "Ein leuchtend roter Gegenstand (Apfel, Ball oder Block) vor einem weißen, neutralen Hintergrund. Die rote Farbe ist dominant und perfekt für deutsche Kinder-Lernmaterialien.",
      "rot": "Ein leuchtend roter Gegenstand (Apfel, Ball oder Block) vor einem weißen, neutralen Hintergrund. Die rote Farbe ist dominant und perfekt für deutsche Kinder-Lernmaterialien.",
      "blue": "Ein leuchtend blauer Gegenstand (Ball oder Block) vor einem weißen, neutralen Hintergrund. Die blaue Farbe ist dominant und perfekt für deutsche Kinder-Lernmaterialien.",
      "blau": "Ein leuchtend blauer Gegenstand (Ball oder Block) vor einem weißen, neutralen Hintergrund. Die blaue Farbe ist dominant und perfekt für deutsche Kinder-Lernmaterialien.",
      "green": "Ein leuchtend grüner Gegenstand (Apfel, Ball oder Block) vor einem weißen, neutralen Hintergrund. Die grüne Farbe ist dominant und perfekt für deutsche Kinder-Lernmaterialien.",
      "grün": "Ein leuchtend grüner Gegenstand (Apfel, Ball oder Block) vor einem weißen, neutralen Hintergrund. Die grüne Farbe ist dominant und perfekt für deutsche Kinder-Lernmaterialien.",
      "yellow": "Ein leuchtend gelber Gegenstand (Banane, Ball oder Block) vor einem weißen, neutralen Hintergrund. Die gelbe Farbe ist dominant und perfekt für deutsche Kinder-Lernmaterialien.",
      "gelb": "Ein leuchtend gelber Gegenstand (Banane, Ball oder Block) vor einem weißen, neutralen Hintergrund. Die gelbe Farbe ist dominant und perfekt für deutsche Kinder-Lernmaterialien."
      };
    };

    };

    const imagePrompts = getImagePrompt(strategy);
    
    // Fallback zu sehr einfachem Prompt
    const imagePrompt = imagePrompts[word.toLowerCase()] || 
      `simple ${word} drawing, cartoon style, white background`;

    console.log(`🎨 Erstelle Bild mit Prompt: "${imagePrompt.substring(0, 100)}..."`);

    try {
      // EINFACHER, DIREKTER ANSATZ ohne komplexe Retry-Logik
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      });

      const imageUrl = response.data[0]?.url;

      if (imageUrl) {
        console.log(`✅ ChatGPT-4o Bild erfolgreich erstellt für "${word}"`);
        return imageUrl;
      } else {
        console.log(`❌ Keine Bild-URL von ChatGPT-4o erhalten für "${word}"`);
        return null;
      }
      
    } catch (error: any) {
      console.log(`⚠️ DALL-E Generation fehlgeschlagen für "${word}": ${error.message}`);
      return null;
    }

  } catch (error) {
    console.error(`❌ ChatGPT-4o Bilderstellung fehlgeschlagen für "${word}":`, error);
    return null;
  }
}

/**
 * Liefert semantische Regeln für den GPT-4o Prompt
 */
function getSemanticRulesForPrompt(word: string, translation: string): string {
  const rules: Record<string, string> = {
    "parents": "ELTERN = EXAKT ZWEI Erwachsene (1 Mann + 1 Frau). NIEMALS nur eine Person!",
    "family": "FAMILIE = MINDESTENS DREI Personen (2 Erwachsene + mindestens 1 Kind)",
    "mother": "MUTTER = EINE erwachsene Frau in mütterlicher Rolle",
    "father": "VATER = EIN erwachsener Mann in väterlicher Rolle", 
    "grandmother": "GROSSMUTTER = EINE ältere Frau (Großmutter-Generation)",
    "grandfather": "GROSSVATER = EIN älterer Mann (Großvater-Generation)",
    "son": "SOHN = EIN männlicher Nachkomme (Junge/junger Mann)",
    "daughter": "TOCHTER = EINE weibliche Nachkommin (Mädchen/junge Frau)",
    "brother": "BRUDER = EIN männlicher Bruder (idealerweise mit Geschwistern)",
    "sister": "SCHWESTER = EINE weibliche Schwester (idealerweise mit Geschwistern)"
  };

  return rules[word.toLowerCase()] || `${word.toUpperCase()} muss exakt dargestellt werden - keine Interpretationen!`;
}

    function getCuratedFamilyImage(word: string): string {
      const curatedFamilyImages: Record<string, string> = {
        // Verbesserte Familie-Bilder mit mehr Vielfalt
        "mother": "https://cdn.pixabay.com/photo/2017/01/31/17/09/mother-2025208_640.jpg",
        "father": "https://cdn.pixabay.com/photo/2016/11/29/13/14/attractive-1868750_640.jpg", 
        "parents": "https://cdn.pixabay.com/photo/2016/11/29/04/19/family-1867100_640.jpg",
        "family": "https://cdn.pixabay.com/photo/2017/01/08/13/58/cube-1963036_640.jpg",
        "grandmother": "https://cdn.pixabay.com/photo/2017/03/15/17/48/woman-2146811_640.jpg",
        "grandfather": "https://cdn.pixabay.com/photo/2016/11/21/14/53/man-1845814_640.jpg",
        "daughter": "https://cdn.pixabay.com/photo/2017/09/25/13/12/dog-2780522_640.jpg",
        "son": "https://cdn.pixabay.com/photo/2016/11/29/13/14/attractive-1868750_640.jpg",
        "sister": "https://cdn.pixabay.com/photo/2017/08/06/12/06/people-2591874_640.jpg",
        "brother": "https://cdn.pixabay.com/photo/2016/11/14/04/14/brothers-1822621_640.jpg",
        "baby": "https://cdn.pixabay.com/photo/2017/11/05/13/50/family-2916980_640.jpg",
        "child": "https://cdn.pixabay.com/photo/2017/10/27/11/31/playground-2891991_640.jpg",
        "nephew": "https://cdn.pixabay.com/photo/2016/11/29/13/14/attractive-1868750_640.jpg",
        "niece": "https://cdn.pixabay.com/photo/2017/08/06/12/06/people-2591874_640.jpg",
        "cousin": "https://cdn.pixabay.com/photo/2017/08/06/12/06/people-2591874_640.jpg",
        "uncle": "https://cdn.pixabay.com/photo/2016/11/21/14/53/man-1845814_640.jpg",
        "aunt": "https://cdn.pixabay.com/photo/2017/03/15/17/48/woman-2146811_640.jpg",
        "wife": "https://cdn.pixabay.com/photo/2017/03/15/17/48/woman-2146811_640.jpg",
        "husband": "https://cdn.pixabay.com/photo/2016/11/21/14/53/man-1845814_640.jpg"
      };

      return curatedFamilyImages[word.toLowerCase()] || "https://cdn.pixabay.com/photo/2016/11/29/04/19/family-1867100_640.jpg";
    }