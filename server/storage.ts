import {
  type User,
  type InsertUser,
  type InsertReport,
  type UserReport,
  type InsertBlock,
  type UserBlock,
  type VerificationCode,
  type InsertVerificationCode,
  type Swipe,
  type InsertSwipe,
  type Connection,
  type InsertConnection,
  type VenueLocation,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { Resend } from "resend";

// ✅ Lazy-init Resend so env vars can be loaded before first use (prevents import-time crash)
let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Don’t crash the whole server at import time; just disable email sending.
    console.warn("[EMAIL] RESEND_API_KEY not set. Email sending is disabled.");
    return null;
  }
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

// ✅ Lazy Twilio config (read env at call time, not import time)
function getTwilioConfig() {
  return {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_PHONE_NUMBER,
  };
}

async function sendTwilioSMS(to: string, body: string): Promise<boolean> {
  const { sid, token, from } = getTwilioConfig();

  if (!sid || !token || !from) {
    console.warn("[SMS] Twilio credentials not configured. SMS sending is disabled.");
    return false;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: from,
        Body: body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[SMS] Twilio API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[SMS] Failed to send via Twilio:", error);
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
  getVerificationCode(
    identifier: string,
    code: string,
    type: string
  ): Promise<VerificationCode | undefined>;
  deleteVerificationCodes(identifier: string): Promise<void>;

  sendVerificationEmail(email: string, code: string): Promise<boolean>;
  sendVerificationSMS(phone: string, code: string): Promise<boolean>;

  createReport(report: InsertReport): Promise<UserReport>;
  getReportsByReporter(reporterId: string): Promise<UserReport[]>;

  createBlock(block: InsertBlock): Promise<UserBlock>;
  removeBlock(blockerId: string, blockedUserId: string): Promise<boolean>;
  getBlocksByBlocker(blockerId: string): Promise<UserBlock[]>;
  isBlocked(blockerId: string, blockedUserId: string): Promise<boolean>;

  createSwipe(swipe: InsertSwipe): Promise<Swipe>;
  getSwipesByUser(userId: string): Promise<Swipe[]>;
  getSwipe(userId: string, targetId: string, targetType: string): Promise<Swipe | undefined>;

  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnectionsByUser(userId: string): Promise<Connection[]>;
  removeConnection(userId: string, connectedUserId: string): Promise<boolean>;

  getVenueLocations(): Promise<VenueLocation[]>;
  getVenueLocation(id: string): Promise<VenueLocation | undefined>;
  // Chat messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(userId1: string, userId2: string): Promise<ChatMessage[]>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  // User settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createOrUpdateUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private reports: Map<string, UserReport>;
  private blocks: Map<string, UserBlock>;
  private verificationCodes: Map<string, VerificationCode>;
  private swipes: Map<string, Swipe>;
  private connections: Map<string, Connection>;
  private venueLocations: Map<string, VenueLocation>;
  private chatMessages: Map<string, ChatMessage>;
  private userSettings: Map<string, UserSettings>;

  constructor() {
    this.users = new Map();
    this.reports = new Map();
    this.blocks = new Map();
    this.verificationCodes = new Map();
    this.swipes = new Map();
    this.connections = new Map();
    this.venueLocations = new Map();
    this.chatMessages = new Map();
    this.userSettings = new Map();
    this.initializeVenueLocations();
  }

  private initializeVenueLocations() {
    const locations: VenueLocation[] = [
      { id: "loc-1", name: "Main Stage", floor: "L1", zone: "A", x: "50", y: "20", eventCount: "3" },
      { id: "loc-2", name: "Tech Hall", floor: "L2", zone: "B", x: "25", y: "45", eventCount: "5" },
      { id: "loc-3", name: "Workshop Room", floor: "L2", zone: "C", x: "75", y: "45", eventCount: "2" },
      { id: "loc-4", name: "Networking Lounge", floor: "L3", zone: "D", x: "50", y: "70", eventCount: "4" },
      { id: "loc-5", name: "Exhibition Hall", floor: "L1", zone: "E", x: "15", y: "85", eventCount: "8" },
      { id: "loc-6", name: "VIP Lounge", floor: "L5", zone: "F", x: "85", y: "85", eventCount: "1" },
    ];
    locations.forEach((loc) => this.venueLocations.set(loc.id, loc));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.phone === phone);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: insertUser.email ?? null,
      phone: insertUser.phone ?? null,
      name: insertUser.name ?? null,
      avatar: insertUser.avatar ?? null,
      createdAt: new Date(),
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

  async getVerificationCode(
    identifier: string,
    code: string,
    type: string
  ): Promise<VerificationCode | undefined> {
    return Array.from(this.verificationCodes.values()).find(
      (vc) =>
        vc.identifier === identifier &&
        vc.code === code &&
        vc.type === type &&
        vc.expiresAt > new Date()
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
    const resend = getResend();
    if (!resend) return false;

    try {
      const result = await resend.emails.send({
        from: "Grid Way <onboarding@resend.dev>",
        to: email,
        subject: `Your Grid Way verification code: ${code}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a1a2e; text-align: center;">Grid Way</h1>
            <p style="color: #666; text-align: center;">Your verification code is:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e;">${code}</span>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center;">This code expires in 10 minutes.</p>
          </div>
        `,
      });
      console.log(`[AUTH] Verification email sent to ${email}`, result);
      return true;
    } catch (error) {
      console.error(`[AUTH] Failed to send verification email to ${email}:`, error);
      return false;
    }
  }

  async sendVerificationSMS(phone: string, code: string): Promise<boolean> {
    const message = `Your Grid Way verification code is: ${code}. It expires in 10 minutes.`;
    const sent = await sendTwilioSMS(phone, message);
    if (sent) {
      console.log(`[AUTH] Verification SMS sent to ${phone}`);
    } else {
      console.error(`[AUTH] Failed to send verification SMS to ${phone}`);
    }
    return sent;
  }

async createReport(insertReport: InsertReport): Promise<UserReport> {
    const id = randomUUID();
    const report: UserReport = {
      ...insertReport,
      id,
      createdAt: new Date(),
      additionalDetails: insertReport.additionalDetails ?? null,
    };
    this.reports.set(id, report);
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: "Grid Way Reports <hello@wayfinder.cool>",
      to: "hello@wayfinder.cool",
      subject: `[Grid Way Report] ${report.reason}`,
      html: `
        <h2>New User Report</h2>
        <p><strong>Report ID:</strong> ${report.id}</p>
        <p><strong>Reporter ID:</strong> ${report.reporterId}</p>
        <p><strong>Reported User ID:</strong> ${report.reportedUserId}</p>
        <p><strong>Reason:</strong> ${report.reason}</p>
        <p><strong>Additional Details:</strong> ${report.additionalDetails || "None provided"}</p>
        <p><strong>Submitted:</strong> ${report.createdAt.toISOString()}</p>
      `,
    });
    console.log(`[REPORT] Email sent to hello@wayfinder.cool for report ${report.id}`);
  } catch (error) {
    console.error(`[REPORT] Failed to send email for report ${report.id}:`, error);
  }

    }

    return report;
  }

  async getReportsByReporter(reporterId: string): Promise<UserReport[]> {
    return Array.from(this.reports.values()).filter((report) => report.reporterId === reporterId);
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
    return Array.from(this.blocks.values()).filter((block) => block.blockerId === blockerId);
  }

  async isBlocked(blockerId: string, blockedUserId: string): Promise<boolean> {
    return Array.from(this.blocks.values()).some(
      (block) => block.blockerId === blockerId && block.blockedUserId === blockedUserId
    );
  }

  async createSwipe(insertSwipe: InsertSwipe): Promise<Swipe> {
    const id = randomUUID();
    const swipe: Swipe = { ...insertSwipe, id, createdAt: new Date() };
    this.swipes.set(id, swipe);
    return swipe;
  }

  async getSwipesByUser(userId: string): Promise<Swipe[]> {
    return Array.from(this.swipes.values()).filter((swipe) => swipe.userId === userId);
  }

  async getSwipe(userId: string, targetId: string, targetType: string): Promise<Swipe | undefined> {
    return Array.from(this.swipes.values()).find(
      (swipe) => swipe.userId === userId && swipe.targetId === targetId && swipe.targetType === targetType
    );
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const id = randomUUID();
    const connection: Connection = { ...insertConnection, id, createdAt: new Date() };
    this.connections.set(id, connection);
    return connection;
  }

  async getConnectionsByUser(userId: string): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.userId === userId || conn.connectedUserId === userId
    );
  }

  async removeConnection(userId: string, connectedUserId: string): Promise<boolean> {
    const connEntry = Array.from(this.connections.entries()).find(
      ([, conn]) =>
        (conn.userId === userId && conn.connectedUserId === connectedUserId) ||
        (conn.userId === connectedUserId && conn.connectedUserId === userId)
    );
    if (connEntry) {
      this.connections.delete(connEntry[0]);
      return true;
    }
    return false;
  }

  async getVenueLocations(): Promise<VenueLocation[]> {
    return Array.from(this.venueLocations.values());
  }

  async getVenueLocation(id: string): Promise<VenueLocation | undefined> {
    return this.venueLocations.get(id);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      read: insertMessage.read ?? "false",
      createdAt: new Date() 
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(userId1: string, userId2: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => 
        (msg.senderId === userId1 && msg.receiverId === userId2) ||
        (msg.senderId === userId2 && msg.receiverId === userId1)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    const entries = Array.from(this.chatMessages.entries());
    for (const [id, msg] of entries) {
      if (msg.senderId === senderId && msg.receiverId === receiverId && msg.read === "false") {
        this.chatMessages.set(id, { ...msg, read: "true" });
      }
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Array.from(this.chatMessages.values()).filter(
      msg => msg.receiverId === userId && msg.read === "false"
    ).length;
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(s => s.userId === userId);
  }

  async createOrUpdateUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const existing = await this.getUserSettings(insertSettings.userId);
    if (existing) {
      const updated: UserSettings = { 
        ...existing, 
        ...insertSettings, 
        updatedAt: new Date() 
      };
      this.userSettings.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const settings: UserSettings = { 
      id,
      userId: insertSettings.userId,
      language: insertSettings.language ?? "en",
      invisibleMode: insertSettings.invisibleMode ?? "false",
      isPremium: insertSettings.isPremium ?? "false",
      updatedAt: new Date() 
    };
    this.userSettings.set(id, settings);
    return settings;
  }
}

export const storage = new MemStorage();
