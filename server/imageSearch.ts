
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

console.log("Environment Variables geladen:");
console.log("UNSPLASH_ACCESS_KEY vorhanden:", !!UNSPLASH_ACCESS_KEY);
console.log("PEXELS_API_KEY vorhanden:", !!PEXELS_API_KEY);
console.log("OPENAI_API_KEY vorhanden:", !!OPENAI_API_KEY);

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

  console.log(`🔍 Starte intelligente Bildsuche für "${word}" (${translation}) in Kategorie "${category}"`);

  try {
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
      // Erst Unsplash versuchen, dann Pexels als Fallback
      let strategyCandidates = await searchUnsplashWithFiltering(query);
      
      // Falls Unsplash keine Ergebnisse oder Rate Limit, verwende Pexels
      if (strategyCandidates.length === 0) {
        console.log(`🔄 Fallback zu Pexels für Query: "${query}"`);
        strategyCandidates = await searchPexelsWithFiltering(query);
      }
      
      allCandidates.push(...strategyCandidates);
      
      // Kurze Pause zwischen Anfragen
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Fehler bei Suchstrategie "${query}":`, error);
      
      // Bei Unsplash-Fehler, versuche Pexels
      try {
        console.log(`🔄 Pexels Fallback für fehlerhafte Query: "${query}"`);
        const pexelsCandidates = await searchPexelsWithFiltering(query);
        allCandidates.push(...pexelsCandidates);
      } catch (pexelsError) {
        console.error(`❌ Auch Pexels fehlgeschlagen für "${query}":`, pexelsError);
      }
    }
  }

  // Duplikate entfernen und nach Qualität sortieren
  const uniqueCandidates = removeDuplicatesAndSort(allCandidates);
  
  console.log(`📊 ${uniqueCandidates.length} eindeutige Bildkandidaten für "${word}" gefunden`);
  return uniqueCandidates.slice(0, 10); // Erhöht auf 10 beste Kandidaten
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
    
    // Immer Pexels als Fallback versuchen
    console.log("🔄 Verwende Pexels als Fallback");
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
Du bist ein EXTREM kritischer Bildexperte für deutsche Kinder-Lernmaterialien. Analysiere diese Bilder mit HÖCHSTER PRÄZISION.

KONTEXT:
- Kategorie: "${category}"
- Englisches Wort: "${word}"
- Deutsche Übersetzung: "${translation}"
- Zielgruppe: Deutsche Kinder 6-11 Jahre, die Englisch lernen

ULTRA-STRENGE BEWERTUNGSKRITERIEN:

1. PERFEKTE SEMANTISCHE ÜBEREINSTIMMUNG (40%):
   - Zeigt das Bild EXAKT "${word}" als HAUPTOBJEKT?
   - Ist es das BESTE Beispiel für "${word}"?
   - Keine ähnlichen Objekte akzeptiert (Auto ≠ LKW, Katze ≠ Kätzchen)

2. PÄDAGOGISCHE EIGNUNG (25%):
   - Für 6-11-Jährige sofort erkennbar?
   - Einfacher, ungestörter Hintergrund?
   - Objekt nimmt mindestens 40% des Bildes ein?

3. BILDQUALITÄT (20%):
   - Scharfer Fokus auf Hauptobjekt?
   - Gute Beleuchtung und Kontrast?
   - Professionelle Bildqualität?

4. KINDERFREUNDLICHKEIT (15%):
   - Absolut keine verstörenden Inhalte?
   - Positive, lernförderliche Darstellung?
   - Altersgerechte Ästhetik?

KRITISCHE ABLEHNUNGSGRÜNDE:
- Objekt ist nicht das gesuchte Wort
- Mehrere Objekte wenn Einzahl gesucht
- Objekt zu klein oder unklar
- Hintergrund zu ablenkend
- Schlechte Bildqualität
- Ungeeignet für Kinder

BILDKANDIDATEN ZUR ANALYSE:
${candidates.map((c, i) => `${i + 1}. URL: ${c.url}
   Beschreibung: "${c.description}"
   Alt-Text: "${c.alt_description}"
   Qualität: ${c.downloads} Downloads, ${c.likes} Likes, ${c.width}x${c.height}px`).join('\n\n')}

STRENGE LOGIKPRÜFUNG ERFORDERLICH:
- Ist das ausgewählte Bild WIRKLICH das beste für "${word}"?
- Würde ein 7-jähriges Kind sofort "${word}" erkennen?
- Gibt es IRGENDWELCHE Zweifel an der Eignung?

ANTWORTE NUR MIT VALIDEM JSON:
{
  "bestImageIndex": number (1-${candidates.length} oder -1 wenn ALLE ungeeignet),
  "confidence": number (0.0-1.0, sei SEHR konservativ),
  "reasoning": "Detaillierte deutsche Begründung der Auswahl",
  "semanticMatch": boolean (true nur bei PERFEKTER Übereinstimmung),
  "qualityScore": number (0.0-1.0, strenge Bewertung der Bildqualität),
  "logicCheck": boolean (true nur wenn 100% sicher für Kinder geeignet),
  "detailedAnalysis": "Kritische Analyse jedes Bildes mit spezifischen Stärken/Schwächen",
  "criticalIssues": ["Liste aller gefundenen Probleme"]
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

  console.log(`🔍 Führe Logikprüfung für "${word}" durch...`);

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

  // 2. Strenge Qualitätsprüfung
  const qualityPassed = 
    evaluation.confidence >= 0.75 &&        // Mindest-Confidence erhöht
    evaluation.semanticMatch === true &&     // Perfekte semantische Übereinstimmung
    evaluation.qualityScore >= 0.7 &&       // Hohe Bildqualität
    evaluation.logicCheck === true &&       // GPT-4o Logikprüfung bestanden
    selectedCandidate.downloads >= 1000 &&  // Beliebtes Bild
    selectedCandidate.likes >= 30;          // Gut bewertetes Bild

  // 3. Zusätzliche Sicherheitsprüfungen
  const safetyChecks = {
    hasValidUrl: selectedCandidate.url && selectedCandidate.url.startsWith('https://'),
    hasDescription: selectedCandidate.description || selectedCandidate.alt_description,
    goodDimensions: selectedCandidate.width >= 400 && selectedCandidate.height >= 300,
    noCriticalIssues: evaluation.criticalIssues.length === 0
  };

  const allSafetyChecksPassed = Object.values(safetyChecks).every(check => check);

  // 4. Finale Entscheidung
  if (qualityPassed && allSafetyChecksPassed) {
    console.log(`✅ Bild für "${word}" besteht alle Prüfungen - Confidence: ${evaluation.confidence}`);
    console.log(`📊 Detaillierte Analyse: ${evaluation.detailedAnalysis}`);
    
    return {
      bestImageUrl: selectedCandidate.url,
      confidence: evaluation.confidence,
      reasoning: `Hochwertiges Bild ausgewählt: ${evaluation.reasoning}`,
      logicCheck: true
    };
  } else {
    console.log(`❌ Bild für "${word}" fällt durch Qualitätsprüfung:`);
    console.log(`   - Qualität bestanden: ${qualityPassed}`);
    console.log(`   - Sicherheit bestanden: ${allSafetyChecksPassed}`);
    console.log(`   - Kritische Probleme: ${evaluation.criticalIssues.join(', ')}`);
    
    return {
      bestImageUrl: getCuratedFallbackImage(word, category),
      confidence: 0.6,
      reasoning: `Automatische Suche unzureichend (Confidence: ${evaluation.confidence}, Logik: ${evaluation.logicCheck}). Verwende kuratiertes Bild. Probleme: ${evaluation.criticalIssues.join(', ')}`,
      logicCheck: false
    };
  }
}

function getCuratedFallbackImage(word: string, category: string): string {
  // Hochwertige, manuell kuratierte Bilder für perfekte Lernqualität
  const curatedImages: Record<string, Record<string, string>> = {
    animals: {
      cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400&q=80",
      dog: "https://images.unsplash.com/photo-1552053831-71594a27632d?fit=crop&w=600&h=400&q=80",
      bird: "https://images.unsplash.com/photo-1444464666168-49d633b86797?fit=crop&w=600&h=400&q=80",
      fish: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?fit=crop&w=600&h=400&q=80",
      bear: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?fit=crop&w=600&h=400&q=80",
      horse: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?fit=crop&w=600&h=400&q=80",
      cow: "https://images.unsplash.com/photo-1516467508483-a9ba5d0fe6a5?fit=crop&w=600&h=400&q=80",
      sheep: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400&q=80",
      pig: "https://images.unsplash.com/photo-1563281577-b9afd1ad8b8d?fit=crop&w=600&h=400&q=80",
      duck: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?fit=crop&w=600&h=400&q=80",
      rabbit: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?fit=crop&w=600&h=400&q=80"
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
      bus: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?fit=crop&w=600&h=400&q=80",
      train: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?fit=crop&w=600&h=400&q=80",
      bike: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fit=crop&w=600&h=400&q=80",
      plane: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?fit=crop&w=600&h=400&q=80",
      boat: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?fit=crop&w=600&h=400&q=80"
    },
    family: {
      mother: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400&q=80",
      father: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&h=400&q=80",
      baby: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?fit=crop&w=600&h=400&q=80",
      child: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?fit=crop&w=600&h=400&q=80",
      family: "https://images.unsplash.com/photo-1511895426328-dc8714191300?fit=crop&w=600&h=400&q=80"
    },
    colors: {
      red: "https://images.unsplash.com/photo-1549298916-b41d501d3772?fit=crop&w=600&h=400&q=80",
      blue: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?fit=crop&w=600&h=400&q=80",
      green: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?fit=crop&w=600&h=400&q=80",
      yellow: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?fit=crop&w=600&h=400&q=80"
    },
    home: {
      house: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400&q=80",
      door: "https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?fit=crop&w=600&h=400&q=80",
      window: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?fit=crop&w=600&h=400&q=80",
      bed: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400&q=80"
    }
  };

  // Spezifisches Bild für das Wort suchen
  const categoryImages = curatedImages[category.toLowerCase()];
  if (categoryImages && categoryImages[word.toLowerCase()]) {
    console.log(`📚 Verwende kuratiertes Bild für "${word}"`);
    return categoryImages[word.toLowerCase()];
  }

  // Fallback zu besten Standard-Bildern pro Kategorie
  const categoryDefaults: Record<string, string> = {
    animals: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400&q=80",
    food: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?fit=crop&w=600&h=400&q=80",
    transport: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?fit=crop&w=600&h=400&q=80",
    family: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400&q=80",
    colors: "https://images.unsplash.com/photo-1549298916-b41d501d3772?fit=crop&w=600&h=400&q=80",
    home: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400&q=80"
  };

  const fallbackUrl = categoryDefaults[category.toLowerCase()] || categoryDefaults.animals;
  console.log(`📚 Verwende Kategorie-Fallback für "${word}" in "${category}"`);
  return fallbackUrl;
}
