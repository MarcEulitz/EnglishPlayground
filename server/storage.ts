import { 
  users, 
  type User, 
  type InsertUser, 
  learningStats,
  type LearningStat, 
  type InsertLearningStat,
  achievements,
  type Achievement, 
  type InsertAchievement,
  parentSettings,
  type ParentSettings,
  type InsertParentSettings
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Learning stats methods
  getLearningStats(userId: number): Promise<LearningStat[]>;
  createLearningStat(stat: InsertLearningStat): Promise<LearningStat>;
  
  // Achievement methods
  getAchievements(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // Parent settings methods
  getParentSettings(): Promise<ParentSettings | undefined>;
  createParentSettings(settings: InsertParentSettings): Promise<ParentSettings>;
  updateParentSettings(id: number, settings: Partial<InsertParentSettings>): Promise<ParentSettings | undefined>;
  validatePin(pin: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Learning stats methods
  async getLearningStats(userId: number): Promise<LearningStat[]> {
    return await db
      .select()
      .from(learningStats)
      .where(eq(learningStats.userId, userId));
  }

  async createLearningStat(insertStat: InsertLearningStat): Promise<LearningStat> {
    const [stat] = await db
      .insert(learningStats)
      .values(insertStat)
      .returning();
    return stat;
  }

  // Achievement methods
  async getAchievements(userId: number): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }

  // Parent settings methods
  async getParentSettings(): Promise<ParentSettings | undefined> {
    const [settings] = await db.select().from(parentSettings).limit(1);
    return settings;
  }

  async createParentSettings(insertSettings: InsertParentSettings): Promise<ParentSettings> {
    const [settings] = await db
      .insert(parentSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  async updateParentSettings(id: number, partialSettings: Partial<InsertParentSettings>): Promise<ParentSettings | undefined> {
    const [updatedSettings] = await db
      .update(parentSettings)
      .set(partialSettings)
      .where(eq(parentSettings.id, id))
      .returning();
    return updatedSettings;
  }

  async validatePin(pin: string): Promise<boolean> {
    const settings = await this.getParentSettings();
    return settings?.pin === pin;
  }
}

// Initialize default parent settings if they don't exist
async function initializeParentSettings() {
  const existingSettings = await db.select().from(parentSettings).limit(1);
  
  if (existingSettings.length === 0) {
    await db.insert(parentSettings).values({
      pin: "1234",
      dailyGoal: 20,
      notifications: true,
      soundEffects: true
    });
  }
}

// Initialize parent settings
initializeParentSettings().catch(console.error);

export const storage = new DatabaseStorage();
