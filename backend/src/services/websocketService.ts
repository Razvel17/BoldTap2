// WebSocket Service
// Real-time chat using Socket.io

import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { FRONTEND_URL } from "../config/env";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  conversationIds?: Set<string>;
}

export class WebSocketService {
  private io: SocketIOServer;

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error("No token provided"));
        }

        // Basic JWT verification (token format check)
        if (typeof token !== "string" || !token.startsWith("ey")) {
          return next(new Error("Invalid token format"));
        }

        socket.userId = socket.handshake.auth.userId;
        socket.conversationIds = new Set();

        if (!socket.userId) {
          return next(new Error("No user ID in token"));
        }

        next();
      } catch (error) {
        next(new Error("Authentication failed"));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      console.log(`✓ User connected: ${socket.userId}`);

      // Join conversation room
      socket.on("join_conversation", (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        socket.conversationIds!.add(conversationId);
        this.io.to(`conversation:${conversationId}`).emit("user_joined", {
          userId: socket.userId,
          timestamp: new Date().toISOString(),
        });
      });

      // Leave conversation
      socket.on("leave_conversation", (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        socket.conversationIds!.delete(conversationId);
        this.io.to(`conversation:${conversationId}`).emit("user_left", {
          userId: socket.userId,
          conversationId,
        });
      });

      // Typing indicator
      socket.on("typing", (conversationId: string) => {
        socket.broadcast.to(`conversation:${conversationId}`).emit("user_typing", {
          userId: socket.userId,
          conversationId,
        });
      });

      // Stop typing
      socket.on("stop_typing", (conversationId: string) => {
        socket.broadcast.to(`conversation:${conversationId}`).emit("user_stopped_typing", {
          userId: socket.userId,
          conversationId,
        });
      });

      // New message broadcast
      socket.on("new_message", (data: any) => {
        const { conversationId, message } = data;
        this.io.to(`conversation:${conversationId}`).emit("message_received", {
          ...message,
          timestamp: new Date().toISOString(),
        });
      });

      // Message edited
      socket.on("message_edited", (data: any) => {
        const { conversationId, messageId, content } = data;
        this.io.to(`conversation:${conversationId}`).emit("message_updated", {
          messageId,
          content,
          edited: true,
          editedAt: new Date().toISOString(),
        });
      });

      // Message deleted
      socket.on("message_deleted", (data: any) => {
        const { conversationId, messageId } = data;
        this.io.to(`conversation:${conversationId}`).emit("message_removed", {
          messageId,
        });
      });

      // Reaction added
      socket.on("reaction_added", (data: any) => {
        const { conversationId, messageId, emoji } = data;
        this.io.to(`conversation:${conversationId}`).emit("reaction_updated", {
          messageId,
          emoji,
          userId: socket.userId,
          timestamp: new Date().toISOString(),
        });
      });

      // Disconnect
      socket.on("disconnect", () => {
        socket.conversationIds?.forEach((conversationId) => {
          this.io.to(`conversation:${conversationId}`).emit("user_left", {
            userId: socket.userId,
          });
        });
        console.log(`✗ User disconnected: ${socket.userId}`);
      });

      // Error handling
      socket.on("error", (error) => {
        console.error(`Socket error for user ${socket.userId}:`, error);
      });
    });
  }

  public emitToConversation(conversationId: string, event: string, data: any): void {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  public emitToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
