// WebSocket Service
// Handles real-time chat events using Socket.io

import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { FRONTEND_URL } from "../config/env";
import * as chatService from "./chatService";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  conversationIds?: Set<string>;
}

export class WebSocketService {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
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

  private setupMiddleware() {
    this.io.use((socket: AuthenticatedSocket, next) => {
      // Token verification would go here
      const userId = socket.handshake.query.userId as string;

      if (userId) {
        socket.userId = userId;
        socket.conversationIds = new Set();
        next();
      } else {
        next(new Error("Authentication failed"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      console.log(`User ${userId} connected: ${socket.id}`);

      // Track user sockets
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      // Join/Leave conversation rooms
      socket.on("join-conversation", (conversationId: string) => {
        socket.join(`conv:${conversationId}`);
        socket.conversationIds?.add(conversationId);
        console.log(`${userId} joined conversation ${conversationId}`);
      });

      socket.on("leave-conversation", (conversationId: string) => {
        socket.leave(`conv:${conversationId}`);
        socket.conversationIds?.delete(conversationId);
        console.log(`${userId} left conversation ${conversationId}`);
      });

      // Real-time messaging
      socket.on(
        "message:send",
        async (data: {
          conversationId: string;
          content: string;
          type?: string;
        }) => {
          try {
            const message = await chatService.sendMessage({
              conversationId: data.conversationId,
              senderId: socket.userId!,
              content: data.content,
              type: (data.type || "text") as any,
              metadata: undefined,
            });

            // Broadcast to all users in conversation
            this.io
              .to(`conv:${data.conversationId}`)
              .emit("message:new", message);
          } catch (error) {
            socket.emit("error", {
              message: "Failed to send message",
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        },
      );

      socket.on(
        "message:edit",
        async (data: {
          conversationId: string;
          messageId: string;
          content: string;
        }) => {
          try {
            const message = await chatService.editMessage(
              data.messageId,
              data.conversationId,
              socket.userId!,
              data.content,
            );

            this.io
              .to(`conv:${data.conversationId}`)
              .emit("message:updated", message);
          } catch (error) {
            socket.emit("error", {
              message: "Failed to edit message",
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        },
      );

      socket.on(
        "message:delete",
        async (data: {
          conversationId: string;
          messageId: string;
        }) => {
          try {
            await chatService.deleteMessage(
              data.messageId,
              data.conversationId,
              socket.userId!,
            );

            this.io
              .to(`conv:${data.conversationId}`)
              .emit("message:deleted", {
                messageId: data.messageId,
                conversationId: data.conversationId,
              });
          } catch (error) {
            socket.emit("error", {
              message: "Failed to delete message",
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        },
      );

      // Typing indicator
      socket.on("typing:start", (conversationId: string) => {
        socket.broadcast.to(`conv:${conversationId}`).emit("typing:started", {
          userId: socket.userId,
          conversationId,
        });
      });

      socket.on("typing:stop", (conversationId: string) => {
        socket.broadcast.to(`conv:${conversationId}`).emit("typing:stopped", {
          userId: socket.userId,
          conversationId,
        });
      });

      // User presence
      socket.on("presence:online", (conversationId: string) => {
        socket.broadcast.to(`conv:${conversationId}`).emit("presence:user-online", {
          userId: socket.userId,
          conversationId,
        });
      });

      socket.on("presence:offline", (conversationId: string) => {
        socket.broadcast.to(`conv:${conversationId}`).emit("presence:user-offline", {
          userId: socket.userId,
          conversationId,
        });
      });

      // Disconnection
      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected: ${socket.id}`);

        const userSockets = this.userSockets.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.userSockets.delete(userId);
            // Broadcast user offline to all their conversations
            this.io.emit("user:disconnected", { userId });
          }
        }
      });

      // Send connection confirmation
      socket.emit("connected", {
        socketId: socket.id,
        userId: socket.userId,
      });
    });
  }

  // Helper methods to emit events from server
  public notifyNewMessage(conversationId: string, message: any) {
    this.io.to(`conv:${conversationId}`).emit("message:new", message);
  }

  public notifyMessageUpdated(conversationId: string, message: any) {
    this.io.to(`conv:${conversationId}`).emit("message:updated", message);
  }

  public notifyMessageDeleted(conversationId: string, messageId: string) {
    this.io
      .to(`conv:${conversationId}`)
      .emit("message:deleted", { messageId, conversationId });
  }

  public notifyParticipantJoined(conversationId: string, userId: string) {
    this.io
      .to(`conv:${conversationId}`)
      .emit("participant:joined", { userId, conversationId });
  }

  public notifyParticipantLeft(conversationId: string, userId: string) {
    this.io
      .to(`conv:${conversationId}`)
      .emit("participant:left", { userId, conversationId });
  }

  public getIO() {
    return this.io;
  }

  public getUserSockets(userId: string): string[] {
    return Array.from(this.userSockets.get(userId) || []);
  }
}
