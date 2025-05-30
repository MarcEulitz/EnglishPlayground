
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
  import { findBestImage } from "./imageSearch";
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

    const httpServer = createServer(app);
    return httpServer;
  }

