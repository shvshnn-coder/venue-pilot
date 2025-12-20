import { type User, type InsertUser, type InsertReport, type UserReport, type InsertBlock, type UserBlock } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createReport(report: InsertReport): Promise<UserReport>;
  getReportsByReporter(reporterId: string): Promise<UserReport[]>;
  createBlock(block: InsertBlock): Promise<UserBlock>;
  removeBlock(blockerId: string, blockedUserId: string): Promise<boolean>;
  getBlocksByBlocker(blockerId: string): Promise<UserBlock[]>;
  isBlocked(blockerId: string, blockedUserId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private reports: Map<string, UserReport>;
  private blocks: Map<string, UserBlock>;

  constructor() {
    this.users = new Map();
    this.reports = new Map();
    this.blocks = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createReport(insertReport: InsertReport): Promise<UserReport> {
    const id = randomUUID();
    const report: UserReport = { 
      ...insertReport, 
      id, 
      createdAt: new Date(),
      additionalDetails: insertReport.additionalDetails ?? null
    };
    this.reports.set(id, report);
    console.log(`[REPORT] New report submitted to hello@wayfinder.cool:`, {
      id: report.id,
      reporterId: report.reporterId,
      reportedUserId: report.reportedUserId,
      reason: report.reason,
      additionalDetails: report.additionalDetails,
      createdAt: report.createdAt
    });
    return report;
  }

  async getReportsByReporter(reporterId: string): Promise<UserReport[]> {
    return Array.from(this.reports.values()).filter(
      (report) => report.reporterId === reporterId
    );
  }

  async createBlock(insertBlock: InsertBlock): Promise<UserBlock> {
    const id = randomUUID();
    const block: UserBlock = { ...insertBlock, id, createdAt: new Date() };
    this.blocks.set(id, block);
    return block;
  }

  async removeBlock(blockerId: string, blockedUserId: string): Promise<boolean> {
    const blockEntry = Array.from(this.blocks.entries()).find(
      ([, block]) => block.blockerId === blockerId && block.blockedUserId === blockedUserId
    );
    if (blockEntry) {
      this.blocks.delete(blockEntry[0]);
      return true;
    }
    return false;
  }

  async getBlocksByBlocker(blockerId: string): Promise<UserBlock[]> {
    return Array.from(this.blocks.values()).filter(
      (block) => block.blockerId === blockerId
    );
  }

  async isBlocked(blockerId: string, blockedUserId: string): Promise<boolean> {
    return Array.from(this.blocks.values()).some(
      (block) => block.blockerId === blockerId && block.blockedUserId === blockedUserId
    );
  }
}

export const storage = new MemStorage();
