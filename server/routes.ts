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
      // Partial validation of request body
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

  // Intelligente Bildsuche API
  app.post("/api/find-best-image", async (req, res) => {
    try {
      const imageSearchSchema = z.object({
        category: z.string(),
        word: z.string(),
        translation: z.string()
      });
      
      const { category, word, translation } = imageSearchSchema.parse(req.body);
      const result = await findBestImage(category, word, translation);
      
      res.json(result);
      
    } catch (error) {
      console.error("Error in intelligent image search:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ 
        message: "Failed to find best image",
        error: error.message 
      });
    }
  });

  // Bildvalidierung API
  app.post('/api/validate-image', async (req, res) => {
    try {
      const { imageUrl, englishWord, germanTranslation, category } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          error: 'OpenAI API Key nicht gefunden. Bitte API Key einrichten.' 
        });
      }
      
      const { validateImage } = await import('./imageValidator');
      const result = await validateImage(imageUrl, englishWord, germanTranslation, category);
      
      res.json(result);
    } catch (error) {
      console.error('Bildvalidierung Fehler:', error);
      res.status(500).json({ error: 'Bildvalidierung fehlgeschlagen' });
    }
  });

  // Batch-Validierung einer ganzen Kategorie
  app.post('/api/validate-category', async (req, res) => {
    try {
      const { vocabularyItems, category } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          error: 'OpenAI API Key nicht gefunden. Bitte API Key einrichten.' 
        });
      }
      
      const { validateAllImagesInCategory } = await import('./imageValidator');
      const results = await validateAllImagesInCategory(vocabularyItems, category);
      
      res.json(results);
    } catch (error) {
      console.error('Kategorie-Validierung Fehler:', error);
      res.status(500).json({ error: 'Kategorie-Validierung fehlgeschlagen' });
    }
  });

  // Besseres Bild finden
  app.post('/api/find-better-image', async (req, res) => {
    try {
      const { englishWord, germanTranslation, category } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          error: 'OpenAI API Key nicht gefunden. Bitte API Key einrichten.' 
        });
      }
      
      const { findValidatedImage } = await import('./imageValidator');
      const result = await findValidatedImage(englishWord, germanTranslation, category);
      
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Kein besseres Bild gefunden' });
      }
    } catch (error) {
      console.error('Bildsuche Fehler:', error);
      res.status(500).json({ error: 'Bildsuche fehlgeschlagen' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
