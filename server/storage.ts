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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private learningStats: Map<number, LearningStat>;
  private achievements: Map<number, Achievement>;
  private parentSettings: Map<number, ParentSettings>;
  private userIdCounter: number;
  private statsIdCounter: number;
  private achievementsIdCounter: number;
  private parentSettingsIdCounter: number;

  constructor() {
    this.users = new Map();
    this.learningStats = new Map();
    this.achievements = new Map();
    this.parentSettings = new Map();
    this.userIdCounter = 1;
    this.statsIdCounter = 1;
    this.achievementsIdCounter = 1;
    this.parentSettingsIdCounter = 1;
    
    // Initialize default parent settings
    const defaultSettings: ParentSettings = {
      id: this.parentSettingsIdCounter++,
      pin: "1234",
      dailyGoal: 20,
      notifications: true,
      soundEffects: true
    };
    this.parentSettings.set(defaultSettings.id, defaultSettings);
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Learning stats methods
  async getLearningStats(userId: number): Promise<LearningStat[]> {
    return Array.from(this.learningStats.values()).filter(
      (stat) => stat.userId === userId
    );
  }

  async createLearningStat(insertStat: InsertLearningStat): Promise<LearningStat> {
    const id = this.statsIdCounter++;
    const stat: LearningStat = { 
      ...insertStat, 
      id, 
      date: new Date() 
    };
    this.learningStats.set(id, stat);
    return stat;
  }

  // Achievement methods
  async getAchievements(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(
      (achievement) => achievement.userId === userId
    );
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementsIdCounter++;
    const achievement: Achievement = { 
      ...insertAchievement, 
      id, 
      dateEarned: new Date() 
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  // Parent settings methods
  async getParentSettings(): Promise<ParentSettings | undefined> {
    // We'll only have one parent settings entry for now, so just return the first one
    if (this.parentSettings.size > 0) {
      return Array.from(this.parentSettings.values())[0];
    }
    return undefined;
  }

  async createParentSettings(insertSettings: InsertParentSettings): Promise<ParentSettings> {
    const id = this.parentSettingsIdCounter++;
    // Ensure all required fields are present
    const settings: ParentSettings = { 
      id,
      pin: insertSettings.pin || '1234',
      dailyGoal: insertSettings.dailyGoal || 20,
      notifications: insertSettings.notifications !== undefined ? insertSettings.notifications : true,
      soundEffects: insertSettings.soundEffects !== undefined ? insertSettings.soundEffects : true
    };
    this.parentSettings.set(id, settings);
    return settings;
  }

  async updateParentSettings(id: number, partialSettings: Partial<InsertParentSettings>): Promise<ParentSettings | undefined> {
    const existingSettings = this.parentSettings.get(id);
    if (!existingSettings) return undefined;
    
    const updatedSettings = { ...existingSettings, ...partialSettings };
    this.parentSettings.set(id, updatedSettings);
    return updatedSettings;
  }

  async validatePin(pin: string): Promise<boolean> {
    const settings = await this.getParentSettings();
    return settings?.pin === pin;
  }
}

export const storage = new MemStorage();
