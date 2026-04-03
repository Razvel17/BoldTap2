"use strict";
// WebSocket Service
// Handles real-time chat events using Socket.io
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
const chatService = __importStar(require("./chatService"));
class WebSocketService {
    constructor(server) {
        this.userSockets = new Map(); // userId -> socketIds
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: env_1.FRONTEND_URL,
                methods: ["GET", "POST"],
                credentials: true,
            },
            transports: ["websocket", "polling"],
        });
        this.setupMiddleware();
        this.setupEventHandlers();
    }
    setupMiddleware() {
        this.io.use((socket, next) => {
            // Token verification would go here
            const userId = socket.handshake.query.userId;
            if (userId) {
                socket.userId = userId;
                socket.conversationIds = new Set();
                next();
            }
            else {
                next(new Error("Authentication failed"));
            }
        });
    }
    setupEventHandlers() {
        this.io.on("connection", (socket) => {
            const userId = socket.userId;
            console.log(`User ${userId} connected: ${socket.id}`);
            // Track user sockets
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId).add(socket.id);
            // Join/Leave conversation rooms
            socket.on("join-conversation", (conversationId) => {
                socket.join(`conv:${conversationId}`);
                socket.conversationIds?.add(conversationId);
                console.log(`${userId} joined conversation ${conversationId}`);
            });
            socket.on("leave-conversation", (conversationId) => {
                socket.leave(`conv:${conversationId}`);
                socket.conversationIds?.delete(conversationId);
                console.log(`${userId} left conversation ${conversationId}`);
            });
            // Real-time messaging
            socket.on("message:send", async (data) => {
                try {
                    const message = await chatService.sendMessage({
                        conversationId: data.conversationId,
                        senderId: socket.userId,
                        content: data.content,
                        type: (data.type || "text"),
                        metadata: undefined,
                    });
                    // Broadcast to all users in conversation
                    this.io
                        .to(`conv:${data.conversationId}`)
                        .emit("message:new", message);
                }
                catch (error) {
                    socket.emit("error", {
                        message: "Failed to send message",
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                }
            });
            socket.on("message:edit", async (data) => {
                try {
                    const message = await chatService.editMessage(data.messageId, data.conversationId, socket.userId, data.content);
                    this.io
                        .to(`conv:${data.conversationId}`)
                        .emit("message:updated", message);
                }
                catch (error) {
                    socket.emit("error", {
                        message: "Failed to edit message",
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                }
            });
            socket.on("message:delete", async (data) => {
                try {
                    await chatService.deleteMessage(data.messageId, data.conversationId, socket.userId);
                    this.io
                        .to(`conv:${data.conversationId}`)
                        .emit("message:deleted", {
                        messageId: data.messageId,
                        conversationId: data.conversationId,
                    });
                }
                catch (error) {
                    socket.emit("error", {
                        message: "Failed to delete message",
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                }
            });
            // Typing indicator
            socket.on("typing:start", (conversationId) => {
                socket.broadcast.to(`conv:${conversationId}`).emit("typing:started", {
                    userId: socket.userId,
                    conversationId,
                });
            });
            socket.on("typing:stop", (conversationId) => {
                socket.broadcast.to(`conv:${conversationId}`).emit("typing:stopped", {
                    userId: socket.userId,
                    conversationId,
                });
            });
            // User presence
            socket.on("presence:online", (conversationId) => {
                socket.broadcast.to(`conv:${conversationId}`).emit("presence:user-online", {
                    userId: socket.userId,
                    conversationId,
                });
            });
            socket.on("presence:offline", (conversationId) => {
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
    notifyNewMessage(conversationId, message) {
        this.io.to(`conv:${conversationId}`).emit("message:new", message);
    }
    notifyMessageUpdated(conversationId, message) {
        this.io.to(`conv:${conversationId}`).emit("message:updated", message);
    }
    notifyMessageDeleted(conversationId, messageId) {
        this.io
            .to(`conv:${conversationId}`)
            .emit("message:deleted", { messageId, conversationId });
    }
    notifyParticipantJoined(conversationId, userId) {
        this.io
            .to(`conv:${conversationId}`)
            .emit("participant:joined", { userId, conversationId });
    }
    notifyParticipantLeft(conversationId, userId) {
        this.io
            .to(`conv:${conversationId}`)
            .emit("participant:left", { userId, conversationId });
    }
    getIO() {
        return this.io;
    }
    getUserSockets(userId) {
        return Array.from(this.userSockets.get(userId) || []);
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=websocketService.js.map