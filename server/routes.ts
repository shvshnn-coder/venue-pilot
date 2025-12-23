import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReportSchema, insertBlockSchema, sendCodeSchema, verifyCodeSchema, insertSwipeSchema, insertConnectionSchema, insertChatMessageSchema, insertUserSettingsSchema } from "@shared/schema";
import { z } from "zod";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  entry.count++;
  return true;
}

function normalizeIdentifier(identifier: string, type: 'email' | 'phone'): string {
  if (type === 'email') {
    return identifier.trim().toLowerCase();
  }
  return identifier.replace(/[\s\-\(\)]/g, '').trim();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/auth/send-code", async (req, res) => {
    try {
      const parsed = sendCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }

      const type = parsed.data.type;
      const identifier = normalizeIdentifier(parsed.data.identifier, type);
      
      if (!checkRateLimit(identifier)) {
        console.log(`[AUTH] Rate limit exceeded for ${identifier}`);
        return res.status(429).json({ error: "Too many requests. Please wait a minute before trying again." });
      }

      const code = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await storage.deleteVerificationCodes(identifier);
      await storage.createVerificationCode({ identifier, code, type, expiresAt });

      if (type === 'email') {
        const sent = await storage.sendVerificationEmail(identifier, code);
        if (!sent) {
          return res.status(500).json({ error: "Failed to send verification email" });
        }
      } else {
        const sent = await storage.sendVerificationSMS(identifier, code);
        if (!sent) {
          console.log(`[AUTH] SMS verification code for ${identifier}: ${code} (fallback - Twilio may not be configured)`);
        }
      }

      res.json({ success: true, message: `Verification code sent to ${type}` });
    } catch (error) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ error: "Failed to send verification code" });
    }
  });

  app.post("/api/auth/verify-code", async (req, res) => {
    try {
      const parsed = verifyCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }

      const type = parsed.data.type;
      const identifier = normalizeIdentifier(parsed.data.identifier, type);
      const code = parsed.data.code;
      
      // TESTING MODE: Accept any 6-digit code for testing purposes
      const isTestMode = true;
      if (!isTestMode) {
        const verificationCode = await storage.getVerificationCode(identifier, code, type);
        if (!verificationCode) {
          return res.status(400).json({ error: "Invalid or expired verification code" });
        }
      }

      await storage.deleteVerificationCodes(identifier);

      let user = type === 'email' 
        ? await storage.getUserByEmail(identifier)
        : await storage.getUserByPhone(identifier);

      if (!user) {
        const userData = type === 'email' 
          ? { email: identifier, phone: null, name: null, avatar: null }
          : { email: null, phone: identifier, name: null, avatar: null };
        user = await storage.createUser(userData);
      }

      res.json({ success: true, user });
    } catch (error) {
      console.error("Error verifying code:", error);
      res.status(500).json({ error: "Failed to verify code" });
    }
  });

  app.patch("/api/auth/user/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, avatar } = req.body;
      const user = await storage.updateUser(id, { name, avatar });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const parsed = insertReportSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid report data", details: parsed.error.errors });
      }
      const report = await storage.createReport(parsed.data);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  app.get("/api/reports/:reporterId", async (req, res) => {
    try {
      const reports = await storage.getReportsByReporter(req.params.reporterId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.post("/api/blocks", async (req, res) => {
    try {
      const parsed = insertBlockSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid block data", details: parsed.error.errors });
      }
      const existingBlock = await storage.isBlocked(parsed.data.blockerId, parsed.data.blockedUserId);
      if (existingBlock) {
        return res.status(409).json({ error: "User already blocked" });
      }
      const block = await storage.createBlock(parsed.data);
      res.status(201).json(block);
    } catch (error) {
      console.error("Error creating block:", error);
      res.status(500).json({ error: "Failed to block user" });
    }
  });

  app.delete("/api/blocks/:blockerId/:blockedUserId", async (req, res) => {
    try {
      const { blockerId, blockedUserId } = req.params;
      const removed = await storage.removeBlock(blockerId, blockedUserId);
      if (removed) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Block not found" });
      }
    } catch (error) {
      console.error("Error removing block:", error);
      res.status(500).json({ error: "Failed to unblock user" });
    }
  });

  app.get("/api/blocks/:blockerId", async (req, res) => {
    try {
      const blocks = await storage.getBlocksByBlocker(req.params.blockerId);
      res.json(blocks);
    } catch (error) {
      console.error("Error fetching blocks:", error);
      res.status(500).json({ error: "Failed to fetch blocks" });
    }
  });

  app.get("/api/blocks/:blockerId/:blockedUserId", async (req, res) => {
    try {
      const { blockerId, blockedUserId } = req.params;
      const isBlocked = await storage.isBlocked(blockerId, blockedUserId);
      res.json({ isBlocked });
    } catch (error) {
      console.error("Error checking block status:", error);
      res.status(500).json({ error: "Failed to check block status" });
    }
  });

  app.post("/api/swipes", async (req, res) => {
    try {
      const parsed = insertSwipeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid swipe data", details: parsed.error.errors });
      }
      const existing = await storage.getSwipe(parsed.data.userId, parsed.data.targetId, parsed.data.targetType);
      if (existing) {
        return res.status(409).json({ error: "Already swiped on this item" });
      }
      const swipe = await storage.createSwipe(parsed.data);
      
      if (parsed.data.targetType === 'attendee' && parsed.data.direction === 'right') {
        await storage.createConnection({
          userId: parsed.data.userId,
          connectedUserId: parsed.data.targetId,
        });
      }
      res.status(201).json(swipe);
    } catch (error) {
      console.error("Error creating swipe:", error);
      res.status(500).json({ error: "Failed to create swipe" });
    }
  });

  app.get("/api/swipes/:userId", async (req, res) => {
    try {
      const swipes = await storage.getSwipesByUser(req.params.userId);
      res.json(swipes);
    } catch (error) {
      console.error("Error fetching swipes:", error);
      res.status(500).json({ error: "Failed to fetch swipes" });
    }
  });

  app.get("/api/connections/:userId", async (req, res) => {
    try {
      const connections = await storage.getConnectionsByUser(req.params.userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ error: "Failed to fetch connections" });
    }
  });

  app.delete("/api/connections/:userId/:connectedUserId", async (req, res) => {
    try {
      const { userId, connectedUserId } = req.params;
      const removed = await storage.removeConnection(userId, connectedUserId);
      if (removed) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Connection not found" });
      }
    } catch (error) {
      console.error("Error removing connection:", error);
      res.status(500).json({ error: "Failed to remove connection" });
    }
  });

  app.get("/api/venue/locations", async (req, res) => {
    try {
      const locations = await storage.getVenueLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching venue locations:", error);
      res.status(500).json({ error: "Failed to fetch venue locations" });
    }
  });

  app.get("/api/venue/locations/:id", async (req, res) => {
    try {
      const location = await storage.getVenueLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Error fetching venue location:", error);
      res.status(500).json({ error: "Failed to fetch venue location" });
    }
  });

  // Chat endpoints
  app.post("/api/chat/messages", async (req, res) => {
    try {
      const parsed = insertChatMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid message data", details: parsed.error.errors });
      }
      const message = await storage.createChatMessage(parsed.data);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/chat/messages/:userId1/:userId2", async (req, res) => {
    try {
      const { userId1, userId2 } = req.params;
      const messages = await storage.getChatMessages(userId1, userId2);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/read/:senderId/:receiverId", async (req, res) => {
    try {
      const { senderId, receiverId } = req.params;
      await storage.markMessagesAsRead(senderId, receiverId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  app.get("/api/chat/unread/:userId", async (req, res) => {
    try {
      const count = await storage.getUnreadCount(req.params.userId);
      res.json({ unreadCount: count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  // User settings endpoints
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.params.userId);
      if (!settings) {
        // Return default settings if none exist
        return res.json({ 
          userId: req.params.userId, 
          language: "en", 
          invisibleMode: "false",
          isPremium: "false"
        });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const parsed = insertUserSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid settings data", details: parsed.error.errors });
      }
      const settings = await storage.createOrUpdateUserSettings(parsed.data);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  return httpServer;
}
