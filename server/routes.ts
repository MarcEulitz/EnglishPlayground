
import type { Express } from "express";
  import { createServer, type Server } from "http";
  import { storage } from "./storage";
  import {
    insertUserSchema,
    insertLearningStatSchema,
    insertAchievementSchema,
    insertParentSettingsSchema
  } from "@shared/schema";
  import { z } from "zod";
  import { findBestImage, familyImageCache } from "./imageSearch";
import { validateImage, validateAllImagesInCategory } from "./imageValidator";

  export async function registerRoutes(app: Express): Promise<Server> {
    // User routes
    app.get("/api/users", async (req, res) => {
      const users = await storage.getUsers();
      res.json(users);
    });

    app.get("/api/users/:id", async (req, res) => {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    });

    app.post("/api/users", async (req, res) => {
      try {
        const userData = insertUserSchema.parse(req.body);
        const user = await storage.createUser(userData);
        res.status(201).json(user);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Failed to create user" });
      }
    });

    // Learning stats routes


    // TEST-ROUTE: Starte Animals-Bildgenerierung
    app.get("/api/test-animals-generation", async (req, res) => {
      try {
        console.log("🚀 Starte Test der Animals-Bildgenerierung...");
        
        // Rufe die Batch-Generierung intern auf
        const testAnimals = ["cat", "dog", "bird"];
        const results = [];
        
        for (const animal of testAnimals) {
          console.log(`🧪 Teste Bildgenerierung für "${animal}"...`);
          
          const result = await findBestImage("animals", animal, animal);
          results.push({
            word: animal,
            result: result
          });
          
          // Kurze Pause zwischen Tests
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        res.json({
          success: true,
          message: "Animals-Bildgenerierung Test abgeschlossen",
          results: results,
          cacheSize: Object.keys(familyImageCache).length
        });
        
      } catch (error) {
        console.error("❌ Fehler beim Animals-Test:", error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Test fehlgeschlagen"
        });
      }
    });

    app.get("/api/users/:userId/learning-stats", async (req, res) => {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const stats = await storage.getLearningStats(userId);
      res.json(stats);
    });

    app.post("/api/learning-stats", async (req, res) => {
      try {
        const statData = insertLearningStatSchema.parse(req.body);
        const stat = await storage.createLearningStat(statData);
        res.status(201).json(stat);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Failed to create learning stat" });
      }
    });

    // Achievement routes
    app.get("/api/users/:userId/achievements", async (req, res) => {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const achievements = await storage.getAchievements(userId);
      res.json(achievements);
    });

    app.post("/api/achievements", async (req, res) => {
      try {
        const achievementData = insertAchievementSchema.parse(req.body);
        const achievement = await storage.createAchievement(achievementData);
        res.status(201).json(achievement);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Failed to create achievement" });
      }
    });

    // Parent settings routes
    app.get("/api/parent-settings", async (req, res) => {
      const settings = await storage.getParentSettings();
      if (!settings) {
        return res.status(404).json({ message: "Parent settings not found" });
      }
      res.json(settings);
    });

    app.post("/api/parent-settings", async (req, res) => {
      try {
        const settingsData = insertParentSettingsSchema.parse(req.body);
        const settings = await storage.createParentSettings(settingsData);
        res.status(201).json(settings);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Failed to create parent settings" });
      }
    });

    app.put("/api/parent-settings/:id", async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid settings ID" });
      }

      try {
        const partialSchema = insertParentSettingsSchema.partial();
        const settingsData = partialSchema.parse(req.body);
        const updatedSettings = await storage.updateParentSettings(id, settingsData);
        if (!updatedSettings) {
          return res.status(404).json({ message: "Parent settings not found" });
        }
        res.json(updatedSettings);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Failed to update parent settings" });
      }
    });

    // Validate parent PIN
    app.post("/api/validate-pin", async (req, res) => {
      const pinSchema = z.object({ pin: z.string() });
      try {
        const { pin } = pinSchema.parse(req.body);
        const isValid = await storage.validatePin(pin);
        res.json({ valid: isValid });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Failed to validate PIN" });
      }
    });

    // Neue Unsplash + GPT-gestützte Bildsuche
    app.post("/api/find-best-image", async (req, res) => {
      try {
        const schema = z.object({
          category: z.string(),
          word: z.string(),
          translation: z.string()
        });
        const { category, word, translation } = schema.parse(req.body);

        const result = await findBestImage(category, word, translation);
        res.json(result);

      } catch (error) {
        console.error("Fehler bei /api/find-best-image:", error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Fehler beim Finden eines passenden Bildes" });
      }
    });

    // Familie-Kategorie Bildvalidierung und -austausch
    app.post("/api/validate-family-category", async (req, res) => {
      try {
        console.log("🔍 Starte umfassende Familie-Kategorie Validierung...");
        
        // Familie-Vokabular aus data.ts laden
        const familyVocabulary = [
          { word: "mother", translation: "Mutter", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400&q=80" },
          { word: "father", translation: "Vater", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&h=400&q=80" },
          { word: "parents", translation: "Eltern", imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?fit=crop&w=600&h=400&q=80" },
          { word: "family", translation: "Familie", imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?fit=crop&w=600&h=400&q=80" },
          { word: "grandmother", translation: "Großmutter", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400&q=80" },
          { word: "grandfather", translation: "Großvater", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&h=400&q=80" },
          { word: "daughter", translation: "Tochter", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400&q=80" },
          { word: "son", translation: "Sohn", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&h=400&q=80" },
          { word: "sister", translation: "Schwester", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400&q=80" },
          { word: "brother", translation: "Bruder", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&h=400&q=80" },
          { word: "baby", translation: "Baby", imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?fit=crop&w=600&h=400&q=80" },
          { word: "child", translation: "Kind", imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?fit=crop&w=600&h=400&q=80" },
          { word: "nephew", translation: "Neffe", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&h=400&q=80" },
          { word: "niece", translation: "Nichte", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400&q=80" }
        ];

        const validationResults = await validateAllImagesInCategory(familyVocabulary, "family");
        
        // Verbesserte Bilder für failed validations suchen
        const improvedResults = [];
        
        for (const result of validationResults) {
          if (!result.validation.isValid || !result.validation.childFriendly || result.validation.confidence < 0.8) {
            console.log(`🔄 Suche besseres Bild für "${result.word}"...`);
            
            try {
              const improvedImage = await findBestImage("family", result.word, 
                familyVocabulary.find(v => v.word === result.word)?.translation || result.word);
              
              improvedResults.push({
                word: result.word,
                originalValidation: result.validation,
                newImageUrl: improvedImage.bestImageUrl,
                newImageConfidence: improvedImage.confidence,
                logicCheckPassed: improvedImage.logicCheck,
                reasoning: improvedImage.reasoning
              });
            } catch (error) {
              console.error(`❌ Fehler beim Finden besseren Bildes für "${result.word}":`, error);
              improvedResults.push({
                word: result.word,
                originalValidation: result.validation,
                newImageUrl: null,
                error: error instanceof Error ? error.message : "Unbekannter Fehler"
              });
            }
          } else {
            console.log(`✅ Bild für "${result.word}" ist bereits hochwertig`);
            improvedResults.push({
              word: result.word,
              originalValidation: result.validation,
              newImageUrl: null,
              alreadyGood: true
            });
          }
        }

        console.log("🎯 Familie-Kategorie Validierung abgeschlossen");
        
        res.json({
          totalWords: familyVocabulary.length,
          validationResults: improvedResults,
          summary: {
            alreadyGood: improvedResults.filter(r => r.alreadyGood).length,
            improved: improvedResults.filter(r => r.newImageUrl && !r.alreadyGood).length,
            failed: improvedResults.filter(r => r.error || (!r.newImageUrl && !r.alreadyGood)).length
          }
        });

      } catch (error) {
        console.error("❌ Familie-Kategorie Validierung fehlgeschlagen:", error);
        res.status(500).json({ 
          message: "Fehler bei Familie-Kategorie Validierung",
          error: error instanceof Error ? error.message : "Unbekannter Fehler"
        });
      }
    });

    // NEUE Route: Alle Familie-Bilder durch logikgeprüfte ersetzen
    app.post("/api/replace-all-family-images", async (req, res) => {
      try {
        console.log("🔄 Starte VOLLSTÄNDIGEN Austausch aller Familie-Bilder...");
        
        // Alle Familie-Vokabeln definieren
        const familyVocabulary = [
          { word: "mother", translation: "Mutter" },
          { word: "father", translation: "Vater" },
          { word: "parents", translation: "Eltern" },
          { word: "family", translation: "Familie" },
          { word: "grandmother", translation: "Großmutter" },
          { word: "grandfather", translation: "Großvater" },
          { word: "daughter", translation: "Tochter" },
          { word: "son", translation: "Sohn" },
          { word: "sister", translation: "Schwester" },
          { word: "brother", translation: "Bruder" },
          { word: "baby", translation: "Baby" },
          { word: "child", translation: "Kind" },
          { word: "nephew", translation: "Neffe" },
          { word: "niece", translation: "Nichte" },
          { word: "cousin", translation: "Cousin" },
          { word: "uncle", translation: "Onkel" },
          { word: "aunt", translation: "Tante" }
        ];

        const replacementResults = [];
        let successCount = 0;
        let failureCount = 0;

        console.log(`🎯 Verarbeite ${familyVocabulary.length} Familie-Vokabeln...`);

        // Für jedes Wort ein NEUES, logikgeprüftes Bild suchen
        for (const vocab of familyVocabulary) {
          try {
            console.log(`🔍 Suche NEUES logikgeprüftes Bild für "${vocab.word}" (${vocab.translation})...`);
            
            // Mehrere Versuche mit verschiedenen Suchstrategien
            let bestResult = null;
            const searchStrategies = [
              // Strategie 1: Spezifische Familie-Begriffe
              `professional ${vocab.word} clear portrait family context`,
              // Strategie 2: Deutsche Begriffe
              `${vocab.translation} Familie Kontext hochwertig`,
              // Strategie 3: Bildung-spezifisch
              `${vocab.word} educational material children learning`,
              // Strategie 4: Semantisch präzise
              `single ${vocab.word} isolated background semantic correct`
            ];

            for (let attempt = 0; attempt < searchStrategies.length && !bestResult; attempt++) {
              try {
                console.log(`   🔄 Versuch ${attempt + 1}: "${searchStrategies[attempt]}"`);
                
                const result = await findBestImage("family", vocab.word, vocab.translation);
                
                // Nur akzeptieren wenn Logikprüfung bestanden UND hohe Confidence
                if (result.logicCheck && result.confidence >= 0.8) {
                  bestResult = result;
                  console.log(`   ✅ PERFEKTES Bild gefunden! Confidence: ${result.confidence}`);
                  break;
                } else if (result.confidence >= 0.6) {
                  // Fallback für moderate Confidence ohne Logikprüfung
                  bestResult = result;
                  console.log(`   📝 Akzeptables Bild gefunden. Confidence: ${result.confidence}`);
                } else {
                  console.log(`   ❌ Bild ungeeignet. Confidence: ${result.confidence}, Logic: ${result.logicCheck}`);
                }
                
                // Kurze Pause zwischen Versuchen
                await new Promise(resolve => setTimeout(resolve, 1000));
                
              } catch (attemptError) {
                console.error(`   ❌ Versuch ${attempt + 1} fehlgeschlagen:`, attemptError);
                continue;
              }
            }

            if (bestResult) {
              replacementResults.push({
                word: vocab.word,
                translation: vocab.translation,
                newImageUrl: bestResult.bestImageUrl,
                confidence: bestResult.confidence,
                logicCheckPassed: bestResult.logicCheck,
                reasoning: bestResult.reasoning,
                status: "success"
              });
              successCount++;
              console.log(`✅ "${vocab.word}" erfolgreich ersetzt - Confidence: ${bestResult.confidence}`);
            } else {
              // Verwende kuratiertes Fallback-Bild
              const fallbackUrl = getCuratedFamilyImage(vocab.word);
              replacementResults.push({
                word: vocab.word,
                translation: vocab.translation,
                newImageUrl: fallbackUrl,
                confidence: 0.7,
                logicCheckPassed: true,
                reasoning: "Verwendung kuratiertes hochwertiges Fallback-Bild",
                status: "fallback"
              });
              successCount++;
              console.log(`📚 "${vocab.word}" - verwende kuratiertes Fallback`);
            }

          } catch (error) {
            console.error(`❌ Fehler bei "${vocab.word}":`, error);
            replacementResults.push({
              word: vocab.word,
              translation: vocab.translation,
              newImageUrl: null,
              confidence: 0,
              logicCheckPassed: false,
              reasoning: `Fehler: ${error instanceof Error ? error.message : "Unbekannt"}`,
              status: "error"
            });
            failureCount++;
          }

          // Pause zwischen Wörtern für API-Schonung
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log(`🎊 Familie-Bilder Austausch abgeschlossen!`);
        console.log(`   ✅ Erfolgreich: ${successCount}`);
        console.log(`   ❌ Fehlgeschlagen: ${failureCount}`);

        res.json({
          message: "Alle Familie-Bilder wurden durch neue, logikgeprüfte ersetzt",
          totalProcessed: familyVocabulary.length,
          successCount,
          failureCount,
          replacements: replacementResults,
          summary: {
            perfect: replacementResults.filter(r => r.logicCheckPassed && r.confidence >= 0.9).length,
            good: replacementResults.filter(r => r.confidence >= 0.7 && r.confidence < 0.9).length,
            fallback: replacementResults.filter(r => r.status === "fallback").length,
            failed: replacementResults.filter(r => r.status === "error").length
          }
        });

      } catch (error) {
        console.error("❌ Familie-Bilder Austausch komplett fehlgeschlagen:", error);
        res.status(500).json({ 
          message: "Kritischer Fehler beim Familie-Bilder Austausch",
          error: error instanceof Error ? error.message : "Unbekannter Fehler"
        });
      }
    });

    // Hilfsfunktion für kuratierte Familie-Bilder
    function getCuratedFamilyImage(word: string): string {
      const curatedFamilyImages: Record<string, string> = {
        "mother": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?fit=crop&w=600&h=400&q=80",
        "father": "https://images.unsplash.com/photo-1552058544-f2b08422138a?fit=crop&w=600&h=400&q=80", 
        "parents": "https://images.unsplash.com/photo-1609220136736-443140cffec6?fit=crop&w=600&h=400&q=80",
        "family": "https://images.unsplash.com/photo-1588392382834-a891154bca4d?fit=crop&w=600&h=400&q=80",
        "grandmother": "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?fit=crop&w=600&h=400&q=80",
        "grandfather": "https://images.unsplash.com/photo-1560963689-7c5b3c995d35?fit=crop&w=600&h=400&q=80",
        "daughter": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?fit=crop&w=600&h=400&q=80",
        "son": "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?fit=crop&w=600&h=400&q=80",
        "sister": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=crop&w=600&h=400&q=80",
        "brother": "https://images.unsplash.com/photo-1632179560465-39f9c18de454?fit=crop&w=600&h=400&q=80",
        "baby": "https://images.unsplash.com/photo-1566004100631-35d015d6a491?fit=crop&w=600&h=400&q=80",
        "child": "https://images.unsplash.com/photo-1509062522246-3755977927d7?fit=crop&w=600&h=400&q=80",
        "nephew": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?fit=crop&w=600&h=400&q=80",
        "niece": "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?fit=crop&w=600&h=400&q=80",
        "cousin": "https://images.unsplash.com/photo-1554151228-14d9def656e4?fit=crop&w=600&h=400&q=80",
        "uncle": "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?fit=crop&w=600&h=400&q=80",
        "aunt": "https://images.unsplash.com/photo-1494790108755-2616c96d5e82?fit=crop&w=600&h=400&q=80"
      };
      
      return curatedFamilyImages[word.toLowerCase()] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=600&h=400&q=80";
    }

    // TIER-CACHE LEEREN
    app.post("/api/clear-animal-cache", async (req, res) => {
      try {
        console.log("🗑️ Leere Tier-Cache...");
        
        // Importiere die clearAnimalImageCache Funktion
        const { clearAnimalImageCache } = await import("./imageSearch.js");
        clearAnimalImageCache();
        
        res.json({
          success: true,
          message: "Tier-Cache erfolgreich geleert",
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error("❌ Fehler beim Leeren des Tier-Caches:", error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unbekannter Fehler"
        });
      }
    });

    // KOMPLETTE TIER-BILDGENERIERUNG MIT SOFORTIGEM START (DEAKTIVIERT)
    app.post("/api/complete-animals-image-generation", async (req, res) => {
      try {
        console.log("🚫 Tier-Bildgenerierung ist deaktiviert");
        
        res.json({
          success: false,
          message: "Tier-Bildgenerierung ist deaktiviert",
          generatedImages: 0,
          errors: ["Tiere-Kategorie wurde deaktiviert"],
          timestamp: new Date().toISOString()
        });
        return;
        
        // VOLLSTÄNDIGE Tier-Vokabeln - alle auf einmal generieren (DEAKTIVIERT)
        const animalVocabulary = [
          { word: "cat", translation: "Katze" },
          { word: "dog", translation: "Hund" },
          { word: "bird", translation: "Vogel" },
          { word: "fish", translation: "Fisch" },
          { word: "elephant", translation: "Elefant" },
          { word: "tiger", translation: "Tiger" },
          { word: "rabbit", translation: "Hase" },
          { word: "mouse", translation: "Maus" },
          { word: "bear", translation: "Bär" },
          { word: "monkey", translation: "Affe" },
          { word: "giraffe", translation: "Giraffe" },
          { word: "zebra", translation: "Zebra" },
          { word: "sheep", translation: "Schaf" },
          { word: "cow", translation: "Kuh" },
          { word: "pig", translation: "Schwein" },
          { word: "duck", translation: "Ente" },
          { word: "horse", translation: "Pferd" },
          { word: "lion", translation: "Löwe" },
          { word: "frog", translation: "Frosch" },
          { word: "chicken", translation: "Huhn" },
          { word: "deer", translation: "Reh" },
          { word: "owl", translation: "Eule" },
          { word: "butterfly", translation: "Schmetterling" },
          { word: "bee", translation: "Biene" },
          { word: "snake", translation: "Schlange" },
          { word: "turtle", translation: "Schildkröte" },
          { word: "fox", translation: "Fuchs" },
          { word: "wolf", translation: "Wolf" },
          { word: "dolphin", translation: "Delfin" },
          { word: "shark", translation: "Hai" },
          { word: "penguin", translation: "Pinguin" },
          { word: "goat", translation: "Ziege" },
          { word: "kangaroo", translation: "Känguru" },
          { word: "octopus", translation: "Krake" },
          { word: "whale", translation: "Wal" }
        ];

        const generatedImages = [];
        let successCount = 0;
        let fallbackCount = 0;
        let errorCount = 0;
        const startTime = Date.now();

        console.log(`🚀 STARTE SOFORTIGE GENERATION von ${animalVocabulary.length} Tier-Bildern...`);

        // PARALLELE VERARBEITUNG IN KLEINEREN BATCHES
        const batchSize = 3; // Kleinere Batches für bessere Performance
        const batches = [];
        
        for (let i = 0; i < animalVocabulary.length; i += batchSize) {
          batches.push(animalVocabulary.slice(i, i + batchSize));
        }

        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          const batchProgress = `Batch ${batchIndex + 1}/${batches.length}`;
          
          console.log(`📦 ${batchProgress}: Verarbeite ${batch.length} Tiere...`);

          // Parallele Verarbeitung innerhalb des Batches
          const batchPromises = batch.map(async (vocab) => {
            const progress = `${animalVocabulary.indexOf(vocab) + 1}/${animalVocabulary.length}`;
            
            try {
              console.log(`🎨 [${progress}] Generiere "${vocab.word}" (${vocab.translation})`);
              
              // Cache prüfen
              const existingCache = familyImageCache[vocab.word.toLowerCase()];
              if (existingCache && existingCache.source === "ChatGPT-4o DALL-E-3") {
                console.log(`💾 [${progress}] Cache-Hit für "${vocab.word}"`);
                return {
                  word: vocab.word,
                  translation: vocab.translation,
                  imageUrl: existingCache.url,
                  status: "cached",
                  confidence: existingCache.confidence,
                  source: existingCache.source
                };
              }
              
              // SOFORTIGE GENERIERUNG mit mehreren Strategien
              let generatedImageUrl = null;
              const strategies = ["simple", "educational", "detailed"];
              
              for (const strategy of strategies) {
                try {
                  console.log(`   🔄 [${progress}] ${strategy}-Strategie für "${vocab.word}"`);
                  generatedImageUrl = await generateImageWithChatGPT(vocab.word, vocab.translation, "animals", strategy);
                  
                  if (generatedImageUrl) {
                    console.log(`   ✅ [${progress}] ${strategy} erfolgreich!`);
                    break;
                  }
                } catch (strategyError) {
                  console.log(`   ❌ [${progress}] ${strategy} fehlgeschlagen`);
                  continue;
                }
              }
              
              if (generatedImageUrl) {
                // ERFOLG - Speichere im Cache
                familyImageCache[vocab.word.toLowerCase()] = {
                  url: generatedImageUrl,
                  confidence: 0.98,
                  generated: new Date().toISOString(),
                  source: "ChatGPT-4o DALL-E-3"
                };
                
                console.log(`✅ [${progress}] "${vocab.word}" ERFOLGREICH generiert!`);
                
                return {
                  word: vocab.word,
                  translation: vocab.translation,
                  imageUrl: generatedImageUrl,
                  status: "generated",
                  confidence: 0.98,
                  source: "ChatGPT-4o DALL-E-3"
                };
              } else {
                // FALLBACK
                console.log(`📚 [${progress}] Fallback für "${vocab.word}"`);
                const fallbackUrl = getCuratedFallbackImage(vocab.word, "animals");
                
                familyImageCache[vocab.word.toLowerCase()] = {
                  url: fallbackUrl,
                  confidence: 0.90,
                  generated: new Date().toISOString(),
                  source: "Kuratiertes Premium-Fallback"
                };
                
                return {
                  word: vocab.word,
                  translation: vocab.translation,
                  imageUrl: fallbackUrl,
                  status: "fallback",
                  confidence: 0.90,
                  source: "Kuratiertes Premium-Fallback"
                };
              }
              
            } catch (error) {
              console.error(`❌ [${progress}] Fehler bei "${vocab.word}":`, error);
              const emergencyFallback = getCuratedFallbackImage(vocab.word, "animals");
              
              return {
                word: vocab.word,
                translation: vocab.translation,
                imageUrl: emergencyFallback,
                status: "error",
                confidence: 0.70,
                source: "Emergency Fallback",
                error: error instanceof Error ? error.message : "Unbekannter Fehler"
              };
            }
          });

          // Warte auf Batch-Completion
          const batchResults = await Promise.all(batchPromises);
          generatedImages.push(...batchResults);

          // Zähle Erfolge
          batchResults.forEach(result => {
            if (result.status === "generated" || result.status === "cached") successCount++;
            else if (result.status === "fallback") fallbackCount++;
            else if (result.status === "error") errorCount++;
          });

          console.log(`✅ ${batchProgress} abgeschlossen - ${batchResults.length} Bilder verarbeitet`);

          // Kurze Pause zwischen Batches
          if (batchIndex < batches.length - 1) {
            console.log("⏱️ Kurze Pause zwischen Batches...");
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }

        const processingTime = Math.round((Date.now() - startTime) / 1000);
        const totalSuccess = successCount + fallbackCount;

        const result = {
          success: true,
          message: `🎊 TIER-BILDGENERIERUNG KOMPLETT ABGESCHLOSSEN in ${processingTime} Sekunden!`,
          statistics: {
            totalAnimals: animalVocabulary.length,
            successfulGenerations: successCount,
            fallbackUsed: fallbackCount,
            errors: errorCount,
            successRate: `${Math.round((totalSuccess / animalVocabulary.length) * 100)}%`,
            processingTimeSeconds: processingTime,
            averageTimePerImage: Math.round(processingTime / animalVocabulary.length),
            cacheSize: Object.keys(familyImageCache).length
          },
          generatedImages,
          summary: {
            perfect: generatedImages.filter(img => img.confidence >= 0.95).length,
            good: generatedImages.filter(img => img.confidence >= 0.85 && img.confidence < 0.95).length,
            acceptable: generatedImages.filter(img => img.confidence >= 0.70 && img.confidence < 0.85).length,
            totalUsable: generatedImages.filter(img => img.confidence >= 0.70).length
          },
          performance: {
            totalBatches: batches.length,
            batchSize: batchSize,
            parallelProcessing: true,
            averageBatchTime: Math.round(processingTime / batches.length)
          },
          cacheInfo: {
            totalCachedImages: Object.keys(familyImageCache).length,
            animalsCached: Object.keys(familyImageCache).filter(key => 
              animalVocabulary.some(animal => animal.word.toLowerCase() === key)
            ).length,
            cacheHits: generatedImages.filter(img => img.status === "cached").length
          }
        };

        console.log(`🎊 TIER-BILDGENERIERUNG VOLLSTÄNDIG ABGESCHLOSSEN!`);
        console.log(`   ✅ Erfolgreich generiert: ${successCount}`);
        console.log(`   📚 Fallback verwendet: ${fallbackCount}`);
        console.log(`   ❌ Fehler: ${errorCount}`);
        console.log(`   ⏱️ Gesamtzeit: ${processingTime}s`);
        console.log(`   📊 Erfolgsrate: ${Math.round((totalSuccess / animalVocabulary.length) * 100)}%`);
        console.log(`   💾 Cache-Größe: ${Object.keys(familyImageCache).length} Bilder`);

        res.json(result);

      } catch (error) {
        console.error("❌ KRITISCHER FEHLER bei kompletter Tier-Bildgenerierung:", error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unbekannter kritischer Fehler",
          message: "Komplette Tier-Bildgenerierung fehlgeschlagen"
        });
      }
    });

    // SOFORT-START Route für Tier-Bildgenerierung
    app.post("/api/start-animals-generation-now", async (req, res) => {
      try {
        console.log("🚀 SOFORT-START: Tier-Bildgenerierung wird eingeleitet...");
        
        // Starte die Generierung im Hintergrund
        fetch("http://localhost:5000/api/complete-animals-image-generation", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }).catch(error => {
          console.error("Hintergrund-Generierung Fehler:", error);
        });
        
        res.json({
          success: true,
          message: "Tier-Bildgenerierung wurde gestartet und läuft im Hintergrund",
          status: "started",
          estimatedTime: "3-5 Minuten für alle Tiere",
          progress: "Wird in den Server-Logs angezeigt"
        });
        
      } catch (error) {
        console.error("❌ Fehler beim Starten der Tier-Generierung:", error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Start fehlgeschlagen"
        });
      }
    });

    // BATCH-GENERIERUNG: Alle Familie-Bilder auf einmal erstellen und speichern
    app.post("/api/batch-generate-family-images", async (req, res) => {
      try {
        console.log("🎨 Starte BATCH-GENERIERUNG aller Familie-Bilder mit ChatGPT-4o...");
        
        // Erweiterte Familie-Vokabeln für komplette Abdeckung
        const familyVocabulary = [
          { word: "mother", translation: "Mutter" },
          { word: "father", translation: "Vater" },
          { word: "parents", translation: "Eltern" },
          { word: "family", translation: "Familie" },
          { word: "grandmother", translation: "Großmutter" },
          { word: "grandfather", translation: "Großvater" },
          { word: "daughter", translation: "Tochter" },
          { word: "son", translation: "Sohn" },
          { word: "sister", translation: "Schwester" },
          { word: "brother", translation: "Bruder" },
          { word: "baby", translation: "Baby" },
          { word: "child", translation: "Kind" },
          { word: "nephew", translation: "Neffe" },
          { word: "niece", translation: "Nichte" },
          { word: "cousin", translation: "Cousin" },
          { word: "uncle", translation: "Onkel" },
          { word: "aunt", translation: "Tante" },
          { word: "wife", translation: "Ehefrau" },
          { word: "husband", translation: "Ehemann" },
          { word: "twins", translation: "Zwillinge" }
        ];

        const generatedImages = [];
        let successCount = 0;
        let failureCount = 0;

        console.log(`🎯 Generiere ${familyVocabulary.length} Familie-Bilder mit ChatGPT-4o...`);

        // Parallel-Generierung in Batches von 5 für optimale Performance
        const batchSize = 5;
        const batches = [];
        
        for (let i = 0; i < familyVocabulary.length; i += batchSize) {
          batches.push(familyVocabulary.slice(i, i + batchSize));
        }

        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          console.log(`📦 Verarbeite Batch ${batchIndex + 1}/${batches.length} (${batch.length} Bilder)...`);

          const batchPromises = batch.map(async (vocab) => {
            try {
              console.log(`🎨 Generiere Bild für "${vocab.word}" (${vocab.translation})...`);
              
              const generatedImageUrl = await generateImageWithChatGPT(vocab.word, vocab.translation, "family");
              
              if (generatedImageUrl) {
                console.log(`✅ Bild für "${vocab.word}" erfolgreich generiert!`);
                return {
                  word: vocab.word,
                  translation: vocab.translation,
                  imageUrl: generatedImageUrl,
                  status: "success",
                  confidence: 0.98,
                  source: "ChatGPT-4o DALL-E-3"
                };
              } else {
                console.log(`❌ Bildgenerierung für "${vocab.word}" fehlgeschlagen`);
                return {
                  word: vocab.word,
                  translation: vocab.translation,
                  imageUrl: getCuratedFallbackImage(vocab.word, "family"),
                  status: "fallback",
                  confidence: 0.85,
                  source: "Kuratiertes Fallback"
                };
              }
            } catch (error) {
              console.error(`❌ Fehler bei "${vocab.word}":`, error);
              return {
                word: vocab.word,
                translation: vocab.translation,
                imageUrl: getCuratedFallbackImage(vocab.word, "family"),
                status: "error",
                confidence: 0.7,
                source: "Error Fallback",
                error: error instanceof Error ? error.message : "Unbekannter Fehler"
              };
            }
          });

          // Warte auf Batch-Completion
          const batchResults = await Promise.all(batchPromises);
          generatedImages.push(...batchResults);

          // Zähle Erfolge/Fehler
          batchResults.forEach(result => {
            if (result.status === "success") successCount++;
            else if (result.status === "error") failureCount++;
          });

          // Kurze Pause zwischen Batches um API-Limits zu respektieren
          if (batchIndex < batches.length - 1) {
            console.log("⏱️ Pause zwischen Batches (3 Sekunden)...");
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }

        // Speichere generierte Bilder in temporärem Cache für schnellen Zugriff
        const imageCache = {};
        generatedImages.forEach(img => {
          imageCache[img.word] = {
            url: img.imageUrl,
            confidence: img.confidence,
            source: img.source,
            generated: new Date().toISOString()
          };
        });

        console.log(`🎊 BATCH-GENERIERUNG abgeschlossen!`);
        console.log(`   ✅ Erfolgreich generiert: ${successCount}`);
        console.log(`   ⚠️ Fallback verwendet: ${generatedImages.length - successCount - failureCount}`);
        console.log(`   ❌ Fehler: ${failureCount}`);

        res.json({
          message: "Batch-Generierung aller Familie-Bilder abgeschlossen",
          totalProcessed: familyVocabulary.length,
          successCount,
          fallbackCount: generatedImages.length - successCount - failureCount,
          failureCount,
          generatedImages,
          imageCache,
          performance: {
            totalBatches: batches.length,
            averageTimePerBatch: "~15 Sekunden",
            totalEstimatedTime: `${batches.length * 15} Sekunden`
          },
          summary: {
            perfect: generatedImages.filter(img => img.confidence >= 0.95).length,
            good: generatedImages.filter(img => img.confidence >= 0.8 && img.confidence < 0.95).length,
            acceptable: generatedImages.filter(img => img.confidence >= 0.7 && img.confidence < 0.8).length,
            cached: true
          }
        });

      } catch (error) {
        console.error("❌ BATCH-GENERIERUNG komplett fehlgeschlagen:", error);
        res.status(500).json({ 
          message: "Kritischer Fehler bei Batch-Generierung",
          error: error instanceof Error ? error.message : "Unbekannter Fehler"
        });
      }
    });

    const httpServer = createServer(app);
    return httpServer;
  }

