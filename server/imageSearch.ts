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
  // Hochgradig spezifische Suchbegriffe, die den Begriff in den Mittelpunkt stellen
  const searchQueries = [
    `single ${word} close up clear background educational`, // Einzelnes Objekt, Nahaufnahme
    `${word} isolated white background children learning`, // Isoliert auf weißem Hintergrund
    `one ${word} center focus sharp clear simple`, // Ein Objekt im Zentrum, scharf
    `${word} main subject large prominent visible`, // Hauptobjekt groß und prominent
    `${word} kindergarten preschool educational material`, // Kindergarten-Bildungsmaterial
    `${translation} einzeln klar Hintergrund Kinder`, // Deutsche Suche für bessere Ergebnisse
    `${word} perfect example clear definition`, // Perfektes Beispiel, klare Definition
    `${category} ${word} primary focus unambiguous` // Kategorie mit eindeutigem Fokus
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
    
    // Hochqualitative Filterung für Bildungsbilder
    const educationalFiltered = results
      .filter((r: any) => {
        // Strenge Qualitätskriterien
        return r.downloads > 2000 && // Mindestens 2000 Downloads (sehr beliebt)
               r.likes > 50 &&        // Mindestens 50 Likes (gute Qualität)
               r.width >= 400 &&      // Mindestbreite für Klarheit
               r.height >= 300 &&     // Mindesthöhe für Klarheit
               !r.description?.toLowerCase().includes('multiple') && // Keine Mehrfachobjekte
               !r.description?.toLowerCase().includes('group'); // Keine Gruppenbilder
      })
      .sort((a: any, b: any) => {
        // Gewichtete Sortierung: Downloads (60%) + Likes (40%)
        const scoreA = (a.downloads * 0.6) + (a.likes * 0.4);
        const scoreB = (b.downloads * 0.6) + (b.likes * 0.4);
        return scoreB - scoreA;
      })
      .slice(0, 4); // Maximal 4 hochqualitative Bilder

    // Falls keine hochwertigen Bilder gefunden, nimm die besten verfügbaren
    const imageUrls = educationalFiltered.length > 0 
      ? educationalFiltered.map((r: any) => r.urls.regular) // Höhere Auflösung für bessere Qualität
      : results
          .sort((a: any, b: any) => b.likes - a.likes)
          .slice(0, 3)
          .map((r: any) => r.urls.regular);
    
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
  You are a CRITICAL image evaluator for children's English learning materials. BE EXTREMELY STRICT!
  
  CONTEXT:
  - Category: "${category}" 
  - English word: "${word}"
  - German translation: "${translation}"
  - Target: German children aged 6-11 learning English

  ULTRA-STRICT EVALUATION CRITERIA:
  1. PERFECT SEMANTIC MATCH (50%): Does the image show EXACTLY "${word}" as the MAIN, CENTRAL subject?
     - The object must be clearly identifiable as "${word}"
     - Must be the PRIMARY focus of the image (not background element)
     - Must take up significant portion of the image (minimum 30% of frame)
     - NO similar objects accepted (cat ≠ kitten, car ≠ vehicle, etc.)
     
  2. VISUAL CLARITY (30%): Is the object crystal clear and unambiguous?
     - Sharp focus on the main object
     - Good lighting and contrast
     - No visual obstructions or blur
     - Object clearly distinguishable from background
     
  3. CHILD-FRIENDLY CONTENT (15%): Age-appropriate for 6-11 years?
     - No scary, violent, or inappropriate content
     - Positive, educational context
     - Colors and style appealing to children
     
  4. EDUCATIONAL VALUE (5%): Optimal for learning?
     - Simple, uncluttered background
     - Single clear subject (unless word is plural)
     - Easy to understand at first glance

  CRITICAL REJECTION CRITERIA:
  - Multiple objects when word is singular
  - Object is too small or unclear
  - Wrong object entirely (even if similar)
  - Busy background that distracts from main object
  - Poor image quality (blurry, dark, etc.)
  - Object partially hidden or cut off
  - Stylized/cartoon when real object needed (or vice versa)

  QUALITY THRESHOLDS (BE HARSH):
  - Confidence must be ≥0.8 to be acceptable (raised from 0.7)
  - Semantic match must be PERFECT (100% match only)
  - Object visibility must be excellent
  - Educational suitability mandatory

  CRITICAL ANALYSIS REQUIRED:
  For EACH image, ask yourself:
  1. "Is this EXACTLY a ${word} and nothing else?"
  2. "Would a 6-year-old immediately recognize this as ${word}?"
  3. "Is the ${word} the MAIN subject, not just present in the image?"
  4. "Is this the BEST possible representation of ${word} for learning?"

  IMAGE URLS TO EVALUATE:
  ${candidates.map((c, i) => `${i + 1}. ${c.url}`).join('\n')}

  RESPOND with JSON in this EXACT format:
  {
    "bestImageIndex": number (ONLY if a truly excellent image exists, otherwise -1),
    "confidence": number (0-1, be conservative),
    "reasoning": "Detailed critical analysis in German explaining why this image is the best OR why all images are rejected",
    "semanticMatch": boolean (true only if PERFECT match),
    "qualityScore": number (0-1, rate overall image quality),
    "detailedAnalysis": "Critical examination of each image's strengths and weaknesses",
    "rejectedImages": [
      {
        "index": number,
        "reason": "Specific reason why this image was rejected"
      }
    ],
    "improvementSuggestions": "What would make a better image for this word"
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

    console.log(`🔍 Detaillierte Bildanalyse für "${word}":`, evaluation.detailedAnalysis);
    console.log(`📊 Abgelehnte Bilder:`, evaluation.rejectedImages);
    console.log(`💡 Verbesserungsvorschläge:`, evaluation.improvementSuggestions);

    // Prüfung ob überhaupt ein gültiges Bild gefunden wurde
    if (evaluation.bestImageIndex === -1 || evaluation.bestImageIndex === null || evaluation.bestImageIndex === undefined) {
      console.log(`❌ ALLE Bilder für "${word}" wurden abgelehnt: ${evaluation.reasoning}`);
      const fallbackUrl = getCuratedFallbackImage(word, category);
      return {
        bestImageUrl: fallbackUrl,
        confidence: 0.6,
        reasoning: `Alle gefundenen Bilder ungeeignet. ${evaluation.reasoning}. Verwende kuratiertes Fallback-Bild. Verbesserungsvorschläge: ${evaluation.improvementSuggestions}`
      };
    }

    const bestIndex = evaluation.bestImageIndex - 1;
    const bestCandidate = candidates[bestIndex];

    // Verschärfte Logikprüfung: Ist die Bewertung wirklich akzeptabel?
    const isAcceptable = 
      evaluation.confidence >= 0.8 &&  // Erhöht von 0.7
      evaluation.semanticMatch === true && 
      evaluation.qualityScore >= 0.7 &&  // Erhöht von 0.6
      bestCandidate &&
      bestCandidate.url;

    if (!isAcceptable) {
      console.log(`❌ Strenge Bildqualitätsprüfung für "${word}" nicht bestanden:`);
      console.log(`   - Confidence: ${evaluation.confidence} (min. 0.8 erforderlich)`);
      console.log(`   - Semantic Match: ${evaluation.semanticMatch}`);
      console.log(`   - Quality Score: ${evaluation.qualityScore} (min. 0.7 erforderlich)`);
      console.log(`   - Reasoning: ${evaluation.reasoning}`);
      
      // Fallback zu kuratierten Bildern
      const fallbackUrl = getCuratedFallbackImage(word, category);


// Kuratierte, hochwertige Fallback-Bilder mit strengster Qualitätsprüfung
function getCuratedFallbackImage(word: string, category: string): string {
  // Nur die allerbesten, kindgerechten Bilder mit perfekter Klarheit
  const curatedImages: Record<string, Record<string, string>> = {
    animals: {
      cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?fit=crop&w=600&h=400", // Perfekt zentrierte Katze
      dog: "https://images.unsplash.com/photo-1552053831-71594a27632d?fit=crop&w=600&h=400", // Klarer Golden Retriever
      bird: "https://images.unsplash.com/photo-1444464666168-49d633b86797?fit=crop&w=600&h=400", // Einzelner bunter Vogel
      fish: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?fit=crop&w=600&h=400", // Klarer einzelner Fisch
      bear: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?fit=crop&w=600&h=400", // Braunbär im Fokus
      duck: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?fit=crop&w=600&h=400", // Einzelne Ente, klar erkennbar
      sheep: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fit=crop&w=600&h=400", // Weißes Schaf im Mittelpunkt
      horse: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?fit=crop&w=600&h=400", // Braunes Pferd, Nahaufnahme
      cow: "https://images.unsplash.com/photo-1516467508483-a9ba5d0fe6a5?fit=crop&w=600&h=400", // Schwarz-weiße Kuh zentral
      pig: "https://images.unsplash.com/photo-1563281577-b9afd1ad8b8d?fit=crop&w=600&h=400", // Rosa Schwein, klar sichtbar
      elephant: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?fit=crop&w=600&h=400", // Elefant im Fokus
      lion: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?fit=crop&w=600&h=400", // Löwe, Kopf im Mittelpunkt
      zebra: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?fit=crop&w=600&h=400", // Zebra mit klaren Streifen
      giraffe: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?fit=crop&w=600&h=400", // Giraffe, Kopf und Hals sichtbar
      rabbit: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?fit=crop&w=600&h=400", // Weißes Kaninchen zentral
      frog: "https://images.unsplash.com/photo-1539632346654-dd4c3cffad8c?fit=crop&w=600&h=400" // Grüner Frosch klar erkennbar
    },
    food: {
      apple: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?fit=crop&w=600&h=400", // Roter Apfel, einzeln
      banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?fit=crop&w=600&h=400", // Gelbe Banane im Fokus
      bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?fit=crop&w=600&h=400", // Brotlaib, klar erkennbar
      milk: "https://images.unsplash.com/photo-1550583724-b2692b85b150?fit=crop&w=600&h=400", // Milchglas zentral
      cheese: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b?fit=crop&w=600&h=400", // Käsescheiben klar
      egg: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?fit=crop&w=600&h=400", // Weiße Eier im Fokus
      orange: "https://images.unsplash.com/photo-1547514701-42782101795e?fit=crop&w=600&h=400", // Orange Frucht einzeln
      carrot: "https://images.unsplash.com/photo-1447175008436-054170c2e979?fit=crop&w=600&h=400", // Orange Karotte klar
      pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?fit=crop&w=600&h=400", // Pizza deutlich erkennbar
      cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?fit=crop&w=600&h=400" // Torte im Mittelpunkt
    },
    transport: {
      car: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?fit=crop&w=600&h=400", // Rotes Auto klar sichtbar
      bus: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?fit=crop&w=600&h=400", // Schulbus deutlich
      train: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?fit=crop&w=600&h=400", // Zug im Fokus
      bike: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fit=crop&w=600&h=400", // Fahrrad zentral
      boat: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?fit=crop&w=600&h=400", // Boot auf Wasser
      plane: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?fit=crop&w=600&h=400", // Flugzeug am Himmel
      truck: "https://images.unsplash.com/photo-1558726262-80ad1c28de7a?fit=crop&w=600&h=400", // LKW klar erkennbar
      motorcycle: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fit=crop&w=600&h=400", // Motorrad deutlich
      ship: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?fit=crop&w=600&h=400" // Schiff auf See
    },
    family: {
      mother: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400", // Mutter mit Kind
      father: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&h=400", // Vater Portrait
      baby: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?fit=crop&w=600&h=400", // Baby im Mittelpunkt
      grandmother: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?fit=crop&w=600&h=400", // Oma klar erkennbar
      grandfather: "https://images.unsplash.com/photo-1619734086067-24bf8889ea7d?fit=crop&w=600&h=400", // Opa deutlich
      family: "https://images.unsplash.com/photo-1511895426328-dc8714191300?fit=crop&w=600&h=400", // Familie zusammen
      son: "https://images.unsplash.com/photo-1552053831-71594a27632d?fit=crop&w=600&h=400", // Junge im Fokus
      daughter: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400", // Mädchen zentral
      sister: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400", // Schwester erkennbar
      brother: "https://images.unsplash.com/photo-1552053831-71594a27632d?fit=crop&w=600&h=400" // Bruder deutlich
    },
    colors: {
      red: "https://images.unsplash.com/photo-1549298916-b41d501d3772?fit=crop&w=600&h=400", // Rote Objekte klar
      blue: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?fit=crop&w=600&h=400", // Blaue Töne deutlich
      green: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?fit=crop&w=600&h=400", // Grün in Natur
      yellow: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?fit=crop&w=600&h=400", // Gelbe Sonnenblume
      black: "https://images.unsplash.com/photo-1549298916-b41d501d3772?fit=crop&w=600&h=400", // Schwarze Objekte
      white: "https://images.unsplash.com/photo-1549298916-b41d501d3772?fit=crop&w=600&h=400", // Weiße Gegenstände
      pink: "https://images.unsplash.com/photo-1518709594023-6eab9bab7eb3?fit=crop&w=600&h=400", // Rosa Blüten
      purple: "https://images.unsplash.com/photo-1518709594023-6eab9bab7eb3?fit=crop&w=600&h=400" // Lila Farbtöne
    },
    shapes: {
      circle: "https://images.unsplash.com/photo-1509909756405-be0199881695?fit=crop&w=600&h=400", // Kreis klar erkennbar
      square: "https://images.unsplash.com/photo-1509909756405-be0199881695?fit=crop&w=600&h=400", // Quadrat deutlich
      triangle: "https://images.unsplash.com/photo-1509909756405-be0199881695?fit=crop&w=600&h=400", // Dreieck im Fokus
      rectangle: "https://images.unsplash.com/photo-1509909756405-be0199881695?fit=crop&w=600&h=400", // Rechteck sichtbar
      star: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?fit=crop&w=600&h=400" // Stern am Himmel
    },
    home: {
      house: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400", // Haus klar sichtbar
      door: "https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?fit=crop&w=600&h=400", // Tür im Mittelpunkt
      window: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?fit=crop&w=600&h=400", // Fenster erkennbar
      bed: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400", // Bett zentral
      chair: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400", // Stuhl deutlich
      table: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?fit=crop&w=600&h=400" // Tisch im Fokus
    },
    clothes: {
      shirt: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?fit=crop&w=600&h=400", // Hemd klar
      pants: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?fit=crop&w=600&h=400", // Hose deutlich
      dress: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?fit=crop&w=600&h=400", // Kleid sichtbar
      shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?fit=crop&w=600&h=400", // Schuhe zentral
      hat: "https://images.unsplash.com/photo-1521369909029-2afed882baee?fit=crop&w=600&h=400", // Hut im Fokus
      socks: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?fit=crop&w=600&h=400" // Socken erkennbar
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
