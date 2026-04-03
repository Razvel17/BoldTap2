// WebSocket Context
// Real-time communication using Socket.io

import { io, Socket } from "socket.io-client";
import { getAuthToken } from "./api";

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  metadata?: Record<string, any>;
  edited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

type MessageEventHandler = (message: ChatMessage) => void;
type MessageDeleteHandler = (data: {
  messageId: string;
  conversationId: string;
}) => void;
type TypingHandler = (data: {
  userId: string;
  conversationId: string;
}) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers: Map<string, Set<MessageEventHandler>> = new Map();
  private deleteHandlers: Set<MessageDeleteHandler> = new Set();
  private typingHandlers: Map<string, Set<TypingHandler>> = new Map();
  private presenceHandlers: Map<string, Set<TypingHandler>> = new Map();

  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = getAuthToken();

      this.socket = io(
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3001",
        {
          auth: { token },
          query: { userId },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        },
      );

      this.socket.on("connected", (data) => {
        console.log("✓ WebSocket connected", data);
        this.setupEventHandlers();
        resolve();
      });

      this.socket.on("error", (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      });

      this.socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        reject(error);
      });
    });
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Message events
    this.socket.on("message:new", (message: ChatMessage) => {
      this.triggerMessageHandlers(message.conversationId, message);
    });

    this.socket.on("message:updated", (message: ChatMessage) => {
      this.triggerMessageHandlers(message.conversationId, message);
    });

    this.socket.on(
      "message:deleted",
      (data: { messageId: string; conversationId: string }) => {
        this.deleteHandlers.forEach((handler) => handler(data));
      },
    );

    // Typing indicators
    this.socket.on(
      "typing:started",
      (data: { userId: string; conversationId: string }) => {
        this.triggerTypingHandlers(data.conversationId, data);
      },
    );

    this.socket.on(
      "typing:stopped",
      (data: { userId: string; conversationId: string }) => {
        this.triggerTypingHandlers(data.conversationId, data);
      },
    );

    // Presence
    this.socket.on(
      "presence:user-online",
      (data: { userId: string; conversationId: string }) => {
        this.triggerPresenceHandlers(data.conversationId, data);
      },
    );

    this.socket.on(
      "presence:user-offline",
      (data: { userId: string; conversationId: string }) => {
        this.triggerPresenceHandlers(data.conversationId, data);
      },
    );
  }

  // Join conversation room
  joinConversation(conversationId: string) {
    this.socket?.emit("join-conversation", conversationId);
  }

  // Leave conversation room
  leaveConversation(conversationId: string) {
    this.socket?.emit("leave-conversation", conversationId);
  }

  // Send message
  sendMessage(
    conversationId: string,
    content: string,
    type: string = "text",
  ) {
    this.socket?.emit("message:send", {
      conversationId,
      content,
      type,
    });
  }

  // Edit message
  editMessage(
    conversationId: string,
    messageId: string,
    content: string,
  ) {
    this.socket?.emit("message:edit", {
      conversationId,
      messageId,
      content,
    });
  }

  // Delete message
  deleteMessage(
    conversationId: string,
    messageId: string,
  ) {
    this.socket?.emit("message:delete", {
      conversationId,
      messageId,
    });
  }

  // Typing indicator
  startTyping(conversationId: string) {
    this.socket?.emit("typing:start", conversationId);
  }

  stopTyping(conversationId: string) {
    this.socket?.emit("typing:stop", conversationId);
  }

  // Presence
  setOnline(conversationId: string) {
    this.socket?.emit("presence:online", conversationId);
  }

  setOffline(conversationId: string) {
    this.socket?.emit("presence:offline", conversationId);
  }

  // Event handlers
  onMessage(conversationId: string, handler: MessageEventHandler) {
    if (!this.messageHandlers.has(conversationId)) {
      this.messageHandlers.set(conversationId, new Set());
    }
    this.messageHandlers.get(conversationId)!.add(handler);

    return () => {
      this.messageHandlers.get(conversationId)?.delete(handler);
    };
  }

  onMessageDelete(handler: MessageDeleteHandler) {
    this.deleteHandlers.add(handler);
    return () => this.deleteHandlers.delete(handler);
  }

  onTyping(conversationId: string, handler: TypingHandler) {
    if (!this.typingHandlers.has(conversationId)) {
      this.typingHandlers.set(conversationId, new Set());
    }
    this.typingHandlers.get(conversationId)!.add(handler);

    return () => {
      this.typingHandlers.get(conversationId)?.delete(handler);
    };
  }

  onPresence(conversationId: string, handler: TypingHandler) {
    if (!this.presenceHandlers.has(conversationId)) {
      this.presenceHandlers.set(conversationId, new Set());
    }
    this.presenceHandlers.get(conversationId)!.add(handler);

    return () => {
      this.presenceHandlers.get(conversationId)?.delete(handler);
    };
  }

  private triggerMessageHandlers(conversationId: string, message: ChatMessage) {
    this.messageHandlers
      .get(conversationId)
      ?.forEach((handler) => handler(message));
  }

  private triggerTypingHandlers(
    conversationId: string,
    data: { userId: string; conversationId: string },
  ) {
    this.typingHandlers
      .get(conversationId)
      ?.forEach((handler) => handler(data));
  }

  private triggerPresenceHandlers(
    conversationId: string,
    data: { userId: string; conversationId: string },
  ) {
    this.presenceHandlers
      .get(conversationId)
      ?.forEach((handler) => handler(data));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const wsService = new WebSocketService();
