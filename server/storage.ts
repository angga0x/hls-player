import { users, type User, type InsertUser, recentStreams, type RecentStream, type InsertRecentStream } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Recent streams methods
  getRecentStreams(limit?: number): Promise<RecentStream[]>;
  createRecentStream(stream: InsertRecentStream): Promise<RecentStream>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private streams: Map<number, RecentStream>;
  currentUserId: number;
  currentStreamId: number;

  constructor() {
    this.users = new Map();
    this.streams = new Map();
    this.currentUserId = 1;
    this.currentStreamId = 1;
    
    // Initialize with sample data for recent streams
    this.createRecentStream({
      userId: null,
      url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
      title: "Sports Championship Stream",
      quality: "1080p",
      isLive: true
    });
    
    this.createRecentStream({
      userId: null,
      url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
      title: "Music Festival Live",
      quality: "720p",
      isLive: false
    });
    
    this.createRecentStream({
      userId: null,
      url: "https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8",
      title: "Tech Conference 2023",
      quality: "480p",
      isLive: false
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getRecentStreams(limit: number = 10): Promise<RecentStream[]> {
    // Get all streams, sort by viewed_at descending, and limit
    return Array.from(this.streams.values())
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
      .slice(0, limit);
  }
  
  async createRecentStream(insertStream: InsertRecentStream): Promise<RecentStream> {
    const id = this.currentStreamId++;
    const stream: RecentStream = { 
      ...insertStream, 
      id,
      viewedAt: new Date()
    };
    this.streams.set(id, stream);
    return stream;
  }
}

export const storage = new MemStorage();
