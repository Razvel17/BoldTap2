// WebSocket Context
// Real-time chat client using Socket.io

import { io, Socket } from "socket.io-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface MessageEventData {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  createdAt: string;
}

interface TypingData {
  userId: string;
  conversationId: string;
}

interface UserPresenceData {
  userId: string;
  conversationId?: string;
  timestamp?: string;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private userId: string | null = null;
  private messageListeners: Map<
    string,
    (message: MessageEventData) => void
  > = new Map();
  private typingListeners: Map<string, (data: TypingData) => void> = new Map();
  private joinedConversations: Set<string> = new Set();

  constructor() {}

  public connect(token: string, userId: string): void {
    if (this.socket?.connected) return;

    this.token = token;
    this.userId = userId;

    this.socket = io(API_BASE_URL, {
      auth: {
        token,
        userId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("✓ WebSocket connected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    this.socket.on("disconnect", () => {
      console.log("✗ WebSocket disconnected");
    });

    // Message events
    this.socket.on("message_received", (message: MessageEventData) => {
      const listener = this.messageListeners.get(message.conversationId);
      if (listener) {
        listener(message);
      }
    });

    this.socket.on("message_updated", (data: any) => {
      console.log("Message updated:", data);
    });

    this.socket.on("message_removed", (data: any) => {
      console.log("Message removed:", data);
    });

    // Typing events
    this.socket.on("user_typing", (data: TypingData) => {
      const listener = this.typingListeners.get(`${data.conversationId}:typing`);
      if (listener) {
        listener(data);
      }
    });

    this.socket.on("user_stopped_typing", (data: TypingData) => {
      const listener = this.typingListeners.get(`${data.conversationId}:stopped`);
      if (listener) {
        listener(data);
      }
    });

    // Presence events
    this.socket.on("user_joined", (data: UserPresenceData) => {
      console.log("User joined:", data);
    });

    this.socket.on("user_left", (data: UserPresenceData) => {
      console.log("User left:", data);
    });

    // Reaction events
    this.socket.on("reaction_updated", (data: any) => {
      console.log("Reaction added:", data);
    });
  }

  public joinConversation(conversationId: string): void {
    if (!this.socket) return;

    this.socket.emit("join_conversation", conversationId);
    this.joinedConversations.add(conversationId);
  }

  public leaveConversation(conversationId: string): void {
    if (!this.socket) return;

    this.socket.emit("leave_conversation", conversationId);
    this.joinedConversations.delete(conversationId);
  }

  public sendMessage(conversationId: string, message: MessageEventData): void {
    if (!this.socket) return;

    this.socket.emit("new_message", {
      conversationId,
      message,
    });
  }

  public typing(conversationId: string): void {
    if (!this.socket) return;

    this.socket.emit("typing", conversationId);
  }

  public stopTyping(conversationId: string): void {
    if (!this.socket) return;

    this.socket.emit("stop_typing", conversationId);
  }

  public editMessage(conversationId: string, messageId: string, content: string): void {
    if (!this.socket) return;

    this.socket.emit("message_edited", {
      conversationId,
      messageId,
      content,
    });
  }

  public deleteMessage(conversationId: string, messageId: string): void {
    if (!this.socket) return;

    this.socket.emit("message_deleted", {
      conversationId,
      messageId,
    });
  }

  public addReaction(conversationId: string, messageId: string, emoji: string): void {
    if (!this.socket) return;

    this.socket.emit("reaction_added", {
      conversationId,
      messageId,
      emoji,
    });
  }

  public onMessage(conversationId: string, callback: (message: MessageEventData) => void): () => void {
    this.messageListeners.set(conversationId, callback);

    return () => {
      this.messageListeners.delete(conversationId);
    };
  }

  public onTyping(conversationId: string, callback: (data: TypingData) => void): () => void {
    this.typingListeners.set(`${conversationId}:typing`, callback);

    return () => {
      this.typingListeners.delete(`${conversationId}:typing`);
    };
  }

  public onStopTyping(conversationId: string, callback: (data: TypingData) => void): () => void {
    this.typingListeners.set(`${conversationId}:stopped`, callback);

    return () => {
      this.typingListeners.delete(`${conversationId}:stopped`);
    };
  }

  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageListeners.clear();
    this.typingListeners.clear();
    this.joinedConversations.clear();
  }
}

// Singleton instance
export const wsService = new WebSocketService();
