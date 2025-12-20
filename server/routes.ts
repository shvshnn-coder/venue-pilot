import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReportSchema, insertBlockSchema, sendCodeSchema, verifyCodeSchema } from "@shared/schema";

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
        console.log(`[AUTH] SMS verification code for ${identifier}: ${code} (SMS delivery not configured - set up Twilio integration)`);
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
      const verificationCode = await storage.getVerificationCode(identifier, code, type);

      if (!verificationCode) {
        return res.status(400).json({ error: "Invalid or expired verification code" });
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

  return httpServer;
}
