import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  avatarId: integer("avatar_id").notNull(),
  age: integer("age").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  avatarId: true,
  age: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const learningStats = pgTable("learning_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topic: text("topic").notNull(),
  score: integer("score").notNull(),
  duration: integer("duration").notNull(), // in seconds
  date: timestamp("date").defaultNow().notNull(),
});

export const insertLearningStatSchema = createInsertSchema(learningStats).pick({
  userId: true,
  topic: true,
  score: true,
  duration: true,
});

export type InsertLearningStat = z.infer<typeof insertLearningStatSchema>;
export type LearningStat = typeof learningStats.$inferSelect;

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // trophy, sticker
  name: text("name").notNull(),
  description: text("description").notNull(),
  dateEarned: timestamp("date_earned").defaultNow().notNull(),
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  type: true,
  name: true,
  description: true,
});

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export const parentSettings = pgTable("parent_settings", {
  id: serial("id").primaryKey(),
  pin: text("pin").notNull().default("1234"),
  dailyGoal: integer("daily_goal").notNull().default(20), // in minutes
  notifications: boolean("notifications").notNull().default(true),
  soundEffects: boolean("sound_effects").notNull().default(true),
});

export const insertParentSettingsSchema = createInsertSchema(parentSettings).pick({
  pin: true,
  dailyGoal: true,
  notifications: true,
  soundEffects: true,
});

export type InsertParentSettings = z.infer<typeof insertParentSettingsSchema>;
export type ParentSettings = typeof parentSettings.$inferSelect;
