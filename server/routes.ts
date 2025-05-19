import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for streams
  app.get('/api/recent-streams', async (req, res) => {
    try {
      const recentStreams = await storage.getRecentStreams(3);
      res.json(recentStreams);
    } catch (error) {
      console.error("Error fetching recent streams:", error);
      res.status(500).json({ message: "Failed to fetch recent streams" });
    }
  });
  
  app.post('/api/recent-streams', async (req, res) => {
    try {
      // Validate request body
      const streamSchema = z.object({
        url: z.string().url().endsWith(".m3u8"),
      });
      
      const validationResult = streamSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid stream data", 
          errors: validationResult.error.issues 
        });
      }
      
      // Generate a title based on URL
      const url = new URL(req.body.url);
      const title = url.pathname.split('/').pop()?.replace('.m3u8', '') || 'Untitled Stream';
      
      // Create a new recent stream entry
      const stream = await storage.createRecentStream({
        userId: null, // In a real app, this would be the authenticated user ID
        url: req.body.url,
        title: title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, ' '),
        quality: "720p", // Default quality
        isLive: true
      });
      
      res.status(201).json(stream);
    } catch (error) {
      console.error("Error creating recent stream:", error);
      res.status(500).json({ message: "Failed to record stream" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
