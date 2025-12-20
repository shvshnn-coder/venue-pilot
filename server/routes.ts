import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReportSchema, insertBlockSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
