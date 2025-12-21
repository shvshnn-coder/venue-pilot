import { type User, type InsertUser, type InsertReport, type UserReport, type InsertBlock, type UserBlock, type VerificationCode, type InsertVerificationCode } from "@shared/schema";
import { randomUUID } from "crypto";

const BREVO_API_KEY = process.env.BREVO_API_KEY;

async function sendBrevoEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.error("[EMAIL] BREVO_API_KEY not configured");
    return false;
  }
  
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "AURA", email: "noreply@wayfinder.cool" },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("[EMAIL] Brevo API error:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send via Brevo:", error);
    return false;
  }
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  createVerificationCode(data: InsertVerificationCode): Promise<VerificationCode>;
  getVerificationCode(identifier: string, code: string, type: string): Promise<VerificationCode | undefined>;
  deleteVerificationCodes(identifier: string): Promise<void>;
  sendVerificationEmail(email: string, code: string): Promise<boolean>;
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
  private verificationCodes: Map<string, VerificationCode>;

  constructor() {
    this.users = new Map();
    this.reports = new Map();
    this.blocks = new Map();
    this.verificationCodes = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id, 
      email: insertUser.email ?? null,
      phone: insertUser.phone ?? null,
      name: insertUser.name ?? null,
      avatar: insertUser.avatar ?? null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createVerificationCode(data: InsertVerificationCode): Promise<VerificationCode> {
    const id = randomUUID();
    const code: VerificationCode = { ...data, id, createdAt: new Date() };
    this.verificationCodes.set(id, code);
    return code;
  }

  async getVerificationCode(identifier: string, code: string, type: string): Promise<VerificationCode | undefined> {
    return Array.from(this.verificationCodes.values()).find(
      (vc) => vc.identifier === identifier && vc.code === code && vc.type === type && vc.expiresAt > new Date()
    );
  }

  async deleteVerificationCodes(identifier: string): Promise<void> {
    const entries = Array.from(this.verificationCodes.entries());
    for (const [id, vc] of entries) {
      if (vc.identifier === identifier) {
        this.verificationCodes.delete(id);
      }
    }
  }

  async sendVerificationEmail(email: string, code: string): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a2e; text-align: center;">AURA</h1>
        <p style="color: #666; text-align: center;">Your verification code is:</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e;">${code}</span>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">This code expires in 10 minutes.</p>
      </div>
    `;
    
    const sent = await sendBrevoEmail(email, `Your AURA verification code: ${code}`, htmlContent);
    if (sent) {
      console.log(`[AUTH] Verification email sent to ${email}`);
    } else {
      console.error(`[AUTH] Failed to send verification email to ${email}`);
    }
    return sent;
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
    
    const htmlContent = `
      <h2>New User Report</h2>
      <p><strong>Report ID:</strong> ${report.id}</p>
      <p><strong>Reporter ID:</strong> ${report.reporterId}</p>
      <p><strong>Reported User ID:</strong> ${report.reportedUserId}</p>
      <p><strong>Reason:</strong> ${report.reason}</p>
      <p><strong>Additional Details:</strong> ${report.additionalDetails || "None provided"}</p>
      <p><strong>Submitted:</strong> ${report.createdAt.toISOString()}</p>
    `;
    
    const sent = await sendBrevoEmail("hello@wayfinder.cool", `[AURA Report] ${report.reason}`, htmlContent);
    if (sent) {
      console.log(`[REPORT] Email sent to hello@wayfinder.cool for report ${report.id}`);
    } else {
      console.error(`[REPORT] Failed to send email for report ${report.id}`);
    }
    
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
