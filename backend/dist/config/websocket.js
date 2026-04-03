"use strict";
// WebSocket Configuration
// Socket.io setup for real-time chat
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
exports.emitToConversation = emitToConversation;
exports.emitToUser = emitToUser;
const socket_io_1 = require("socket.io");
const env_1 = require("./env");
const tokenService_1 = require("../services/tokenService");
function setupWebSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    // Middleware to verify JWT token
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("No token provided"));
            }
            const decoded = await (0, tokenService_1.verifyToken)(token);
            if (!decoded) {
                return next(new Error("Invalid token"));
            }
            socket.userId = decoded.userId;
            socket.conversationIds = new Set();
            next();
        }
        catch (error) {
            next(new Error("Authentication failed"));
        }
    });
    // Connection event
    io.on("connection", (socket) => {
        console.log(`✓ User connected: ${socket.userId}`);
        // Join conversation room
        socket.on("join_conversation", (conversationId) => {
            socket.join(`conversation:${conversationId}`);
            socket.conversationIds.add(conversationId);
            socket.broadcast.to(`conversation:${conversationId}`).emit("user_joined", {
                userId: socket.userId,
                timestamp: new Date(),
            });
            console.log(`  → User ${socket.userId} joined ${conversationId}`);
        });
        // Leave conversation room
        socket.on("leave_conversation", (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
            socket.conversationIds.delete(conversationId);
            socket.broadcast.to(`conversation:${conversationId}`).emit("user_left", {
                userId: socket.userId,
                timestamp: new Date(),
            });
        });
        // Typing indicator
        socket.on("typing", (conversationId) => {
            socket.broadcast.to(`conversation:${conversationId}`).emit("user_typing", {
                userId: socket.userId,
                conversationId,
            });
        });
        // Stop typing
        socket.on("stop_typing", (conversationId) => {
            socket.broadcast.to(`conversation:${conversationId}`).emit("user_stopped_typing", {
                userId: socket.userId,
                conversationId,
            });
        });
        // New message (real-time)
        socket.on("new_message", (data) => {
            const { conversationId, message } = data;
            socket.broadcast.to(`conversation:${conversationId}`).emit("message_received", {
                ...message,
                timestamp: new Date(),
            });
        });
        // Message edited
        socket.on("message_edited", (data) => {
            const { conversationId, messageId, content } = data;
            socket.broadcast.to(`conversation:${conversationId}`).emit("message_updated", {
                messageId,
                content,
                edited: true,
                editedAt: new Date(),
            });
        });
        // Message deleted
        socket.on("message_deleted", (data) => {
            const { conversationId, messageId } = data;
            socket.broadcast.to(`conversation:${conversationId}`).emit("message_removed", {
                messageId,
            });
        });
        // Reaction added
        socket.on("reaction_added", (data) => {
            const { conversationId, messageId, emoji } = data;
            socket.broadcast.to(`conversation:${conversationId}`).emit("reaction_updated", {
                messageId,
                emoji,
                userId: socket.userId,
            });
        });
        // Disconnect
        socket.on("disconnect", () => {
            socket.conversationIds?.forEach((conversationId) => {
                socket.broadcast.to(`conversation:${conversationId}`).emit("user_left", {
                    userId: socket.userId,
                });
            });
            console.log(`✗ User disconnected: ${socket.userId}`);
        });
    });
    return io;
}
function emitToConversation(io, conversationId, event, data) {
    io.to(`conversation:${conversationId}`).emit(event, data);
}
function emitToUser(io, userId, event, data) {
    io.to(`user:${userId}`).emit(event, data);
}
//# sourceMappingURL=websocket.js.map