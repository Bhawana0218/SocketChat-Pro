import { Request, Response, NextFunction } from "express";
import { messageService } from "../services/message.service";
import { logger } from "../utils/logger";

export class MessageController {
  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const before = req.query.before as string | undefined;
      const messages = await messageService.getMessages(limit, before);
      res.json({ success: true, data: messages });
    } catch (error) {
      logger.error("Error fetching messages:", error);
      next(error);
    }
  }

  async getPrivateMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user1, user2 } = req.query;
      const limit = parseInt(req.query.limit as string) || 50;
      const before = req.query.before as string | undefined;
      if (!user1 || !user2) {
        res.status(400).json({ success: false, error: "user1 and user2 query parameters are required" });
        return;
      }
      const messages = await messageService.getPrivateMessages(user1 as string, user2 as string, limit, before);
      res.json({ success: true, data: messages });
    } catch (error) {
      logger.error("Error fetching private messages:", error);
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, message } = req.body;
      if (!username || !message) {
        res.status(400).json({ success: false, error: "Username and message are required" });
        return;
      }
      if (username.length > 30) {
        res.status(400).json({ success: false, error: "Username cannot exceed 30 characters" });
        return;
      }
      if (message.length > 50000) {
        res.status(400).json({ success: false, error: "Message too large" });
        return;
      }
      const savedMessage = await messageService.createMessage(username, message);
      res.status(201).json({ success: true, data: savedMessage });
    } catch (error) {
      logger.error("Error sending message:", error);
      next(error);
    }
  }
}

export const messageController = new MessageController();
