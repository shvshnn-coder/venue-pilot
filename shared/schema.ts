import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const REPORT_REASONS = [
  "Harassment or bullying",
  "Inappropriate content",
  "Spam or scam",
  "Fake profile",
  "Offensive behavior",
  "Privacy violation",
  "Other",
] as const;

export const userReports = pgTable("user_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull(),
  reportedUserId: varchar("reported_user_id").notNull(),
  reason: text("reason").notNull(),
  additionalDetails: text("additional_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(userReports).omit({
  id: true,
  createdAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type UserReport = typeof userReports.$inferSelect;

export const userBlocks = pgTable("user_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockerId: varchar("blocker_id").notNull(),
  blockedUserId: varchar("blocked_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlockSchema = createInsertSchema(userBlocks).omit({
  id: true,
  createdAt: true,
});

export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type UserBlock = typeof userBlocks.$inferSelect;
