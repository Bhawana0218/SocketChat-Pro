import { Request, Response } from "express";
import { messageController } from "../controllers/message.controller";

let socketServiceRef: { getHealthStatus: () => unknown } | null = null;

export const setSocketService = (service: { getHealthStatus: () => unknown }) => {
  socketServiceRef = service;
};

export class HealthController {
  async healthCheck(_req: Request, res: Response): Promise<void> {
    const health = socketServiceRef?.getHealthStatus() || {
      status: "ok",
      database: "unknown",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      connections: 0,
      uniqueUsers: 0,
    };
    res.json(health);
  }
}

export const healthController = new HealthController();
