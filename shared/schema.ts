import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const recentStreams = pgTable("recent_streams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  url: text("url").notNull(),
  title: text("title").notNull(),
  quality: text("quality").notNull(),
  isLive: boolean("is_live").default(true),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export const insertRecentStreamSchema = createInsertSchema(recentStreams).omit({
  id: true,
  viewedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRecentStream = z.infer<typeof insertRecentStreamSchema>;
export type RecentStream = typeof recentStreams.$inferSelect;
