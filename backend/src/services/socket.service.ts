import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import mongoose from "mongoose";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
  UserPresence,
} from "../types/socket";
import { messageService } from "./message.service";
import { logger } from "../utils/logger";

export class SocketService {
  private io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
  private onlineUsers: Map<string, { username: string; connectedAt: Date }> = new Map();
  private lastSeenMap: Map<string, Date> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.initialize();
  }

  private getOnlineUsers(): UserPresence[] {
    const users: UserPresence[] = [];
    const seen = new Set<string>();

    for (const [, data] of this.onlineUsers) {
      if (!seen.has(data.username)) {
        seen.add(data.username);
        users.push({
          username: data.username,
          lastSeen: new Date().toISOString(),
          isOnline: true,
        });
      }
    }

    for (const [username, date] of this.lastSeenMap) {
      if (!seen.has(username)) {
        seen.add(username);
        users.push({
          username,
          lastSeen: date.toISOString(),
          isOnline: false,
        });
      }
    }

    return users;
  }

  private async createSystemMessage(
    username: string,
    event: string,
    message: string
  ) {
    const saved = await messageService.createMessage(
      username, message, "public", null, "system", event
    );
    const payload = {
      _id: saved._id.toString(),
      username: saved.username,
      message: saved.message,
      createdAt: saved.createdAt.toISOString(),
      delivered: true,
      read: true,
      chatType: "public" as const,
      recipient: null,
      messageType: "system" as const,
      event: saved.event,
      contentType: "text" as const,
    };
    this.io.emit("system_message", payload);
    return payload;
  }

  getHealthStatus() {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";
    return {
      status: "ok" as const,
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      connections: this.onlineUsers.size,
      uniqueUsers: new Set(Array.from(this.onlineUsers.values()).map(u => u.username)).size,
    };
  }

  private initialize(): void {
    this.io.on("connection", (socket) => {
      logger.socket(`Client connected: ${socket.id}`);

      socket.on("join", async (data) => {
        const { username } = data;
        const existingUsernames = new Set(
          Array.from(this.onlineUsers.values()).map((u) => u.username)
        );
        const isNewUser = !existingUsernames.has(username);

        this.onlineUsers.set(socket.id, { username, connectedAt: new Date() });
        this.lastSeenMap.delete(username);
        socket.data.username = username;

        await messageService.markAllAsDelivered(username);

        const users = this.getOnlineUsers();
        this.io.emit("online_users", users);

        if (isNewUser) {
          await this.createSystemMessage(username, "user_joined", `${username} joined the chat`);
          this.io.emit("user_joined", { username, onlineUsers: users });
        }

        logger.socket(`${username} joined the chat`);
      });

      socket.on("send_message", async (data) => {
        const { username, message, contentType } = data as { username: string; message: string; contentType?: string };
        try {
          const savedMessage = await messageService.createMessage(
            username, message, "public", null, "message", null,
            (contentType as "text" | "voice" | "sticker") || "text"
          );
          const messagePayload = {
            _id: savedMessage._id.toString(),
            username: savedMessage.username,
            message: savedMessage.message,
            createdAt: savedMessage.createdAt.toISOString(),
            delivered: savedMessage.delivered,
            read: savedMessage.read,
            chatType: "public" as const,
            recipient: null,
            messageType: "message" as const,
            event: null,
            contentType: savedMessage.contentType,
          };
          this.io.emit("receive_message", messagePayload);
          logger.socket(`Message from ${username}: ${(contentType || "text")} (${savedMessage.message.substring(0, 30)}...)`);
        } catch (error) {
          logger.error("Error saving message:", error);
        }
      });

      socket.on("send_private_message", async (data) => {
        const { username, recipient, message, contentType } = data as { username: string; recipient: string; message: string; contentType?: string };
        try {
          const savedMessage = await messageService.createMessage(
            username, message, "private", recipient, "message", null,
            (contentType as "text" | "voice" | "sticker") || "text"
          );
          const messagePayload = {
            _id: savedMessage._id.toString(),
            username: savedMessage.username,
            message: savedMessage.message,
            createdAt: savedMessage.createdAt.toISOString(),
            delivered: savedMessage.delivered,
            read: savedMessage.read,
            chatType: "private" as const,
            recipient: savedMessage.recipient,
            messageType: "message" as const,
            event: null,
            contentType: savedMessage.contentType,
          };

          for (const [socketId, userData] of this.onlineUsers) {
            if (userData.username === recipient || userData.username === username) {
              this.io.to(socketId).emit("receive_private_message", messagePayload);
            }
          }
          logger.socket(`Private message from ${username} to ${recipient}`);
        } catch (error) {
          logger.error("Error saving private message:", error);
        }
      });

      socket.on("join_private_chat", async (data) => {
        const { with: targetUser } = data;
        const username = socket.data.username;
        if (!username) return;
        await messageService.markPrivateAsDelivered(targetUser, username);
        const roomName = [username, targetUser].sort().join("__");
        socket.join(roomName);
      });

      socket.on("typing", (data) => {
        if (data.chatType === "private" && data.recipient) {
          for (const [socketId, userData] of this.onlineUsers) {
            if (userData.username === data.recipient) {
              this.io.to(socketId).emit("typing", data);
            }
          }
        } else {
          socket.broadcast.emit("typing", data);
        }
      });

      socket.on("stop_typing", (data) => {
        if (data.chatType === "private" && data.recipient) {
          for (const [socketId, userData] of this.onlineUsers) {
            if (userData.username === data.recipient) {
              this.io.to(socketId).emit("stop_typing", data);
            }
          }
        } else {
          socket.broadcast.emit("stop_typing", data);
        }
      });

      socket.on("mark_delivered", async (data) => {
        await messageService.markAsDelivered(data.messageId);
        this.io.emit("message_delivered", { messageId: data.messageId });
      });

      socket.on("mark_read", async (data) => {
        await messageService.markAsRead(data.messageId);
        this.io.emit("message_read", { messageId: data.messageId });
      });

      // Call signaling
      socket.on("call_invite", (data) => {
        const username = socket.data.username;
        if (!username) return;
        for (const [socketId, userData] of this.onlineUsers) {
          if (userData.username === data.to) {
            this.io.to(socketId).emit("call_invite", { from: username, callType: data.callType });
          }
        }
      });

      socket.on("call_accept", (data) => {
        const username = socket.data.username;
        if (!username) return;
        for (const [socketId, userData] of this.onlineUsers) {
          if (userData.username === data.to) {
            this.io.to(socketId).emit("call_accept", { from: username });
          }
        }
      });

      socket.on("call_reject", (data) => {
        const username = socket.data.username;
        if (!username) return;
        for (const [socketId, userData] of this.onlineUsers) {
          if (userData.username === data.to) {
            this.io.to(socketId).emit("call_reject", { from: username });
          }
        }
      });

      socket.on("call_end", (data) => {
        const username = socket.data.username;
        if (!username) return;
        for (const [socketId, userData] of this.onlineUsers) {
          if (userData.username === data.to) {
            this.io.to(socketId).emit("call_end", { from: username });
          }
        }
      });

      socket.on("call_signal", (data) => {
        const username = socket.data.username;
        if (!username) return;
        for (const [socketId, userData] of this.onlineUsers) {
          if (userData.username === data.to) {
            this.io.to(socketId).emit("call_signal", { from: username, signal: data.signal });
          }
        }
      });

      socket.on("disconnect", async (reason) => {
        const userData = this.onlineUsers.get(socket.id);
        if (userData) {
          const { username } = userData;
          this.onlineUsers.delete(socket.id);
          this.lastSeenMap.set(username, new Date());

          const users = this.getOnlineUsers();
          this.io.emit("online_users", users);

          const stillConnected = Array.from(this.onlineUsers.values()).some(
            (u) => u.username === username
          );

          if (!stillConnected) {
            await this.createSystemMessage(username, "user_left", `${username} left the chat`);
            this.io.emit("user_left", { username, onlineUsers: users });
          }

          logger.socket(`${username} left the chat (${reason})`);
        }
      });
    });
  }

  getIO(): Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData> {
    return this.io;
  }
}
