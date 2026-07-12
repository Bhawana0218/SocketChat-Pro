import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { SocketService } from "./services/socket.service";
import { setSocketService } from "./controllers/health.controller";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();

  const httpServer = createServer(app);
  const socketService = new SocketService(httpServer);

  setSocketService(socketService);

  httpServer.listen(PORT, () => {
    logger.info(`SocketChat Pro Backend running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  });

  process.on("unhandledRejection", (err: Error) => {
    logger.error("UNHANDLED REJECTION:", err.message);
    httpServer.close(() => process.exit(1));
  });

  process.on("uncaughtException", (err: Error) => {
    logger.error("UNCAUGHT EXCEPTION:", err.message);
    httpServer.close(() => process.exit(1));
  });
};

startServer();
