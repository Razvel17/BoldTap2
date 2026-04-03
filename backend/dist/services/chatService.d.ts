import { Conversation } from "../entities/Conversation";
import { ChatMessage } from "../entities/ChatMessage";
export declare function createConversation(data: {
    title: string;
    participantIds: string[];
    description?: string;
    createdBy: string;
}): Promise<Conversation>;
export declare function listConversations(userId: string): Promise<Conversation[]>;
export declare function getMessages(conversationId: string, limit?: number, offset?: number): Promise<ChatMessage[]>;
export declare function sendMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
    type: "text" | "image" | "file" | "system";
    metadata?: Record<string, any>;
}): Promise<ChatMessage>;
export declare function editMessage(messageId: string, conversationId: string, userId: string, content: string): Promise<ChatMessage>;
export declare function deleteMessage(messageId: string, conversationId: string, userId: string): Promise<void>;
export declare function addParticipant(conversationId: string, userId: string, addedBy: string): Promise<Conversation>;
export declare function leaveConversation(conversationId: string, userId: string): Promise<void>;
//# sourceMappingURL=chatService.d.ts.map