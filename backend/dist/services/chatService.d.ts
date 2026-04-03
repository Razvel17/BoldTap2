import { Conversation } from "../entities/Conversation";
import { ChatMessage } from "../entities/ChatMessage";
export declare function createConversation(createdBy: string, title: string, participantIds: string[], description?: string): Promise<{
    success: boolean;
    error: string;
    conversation?: undefined;
} | {
    success: boolean;
    conversation: Conversation;
    error?: undefined;
}>;
export declare function getConversations(userId: string): Promise<{
    success: boolean;
    conversations: Conversation[];
    error?: undefined;
} | {
    success: boolean;
    error: string;
    conversations?: undefined;
}>;
export declare function getConversationMessages(conversationId: string, userId: string, limit?: number, offset?: number): Promise<{
    success: boolean;
    error: string;
    messages?: undefined;
} | {
    success: boolean;
    messages: ChatMessage[];
    error?: undefined;
}>;
export declare function sendMessage(conversationId: string, senderId: string, content: string, type?: "text" | "image" | "file" | "system", metadata?: Record<string, any>): Promise<{
    success: boolean;
    error: string;
    message?: undefined;
} | {
    success: boolean;
    message: ChatMessage;
    error?: undefined;
}>;
export declare function editMessage(messageId: string, userId: string, newContent: string): Promise<{
    success: boolean;
    error: string;
    message?: undefined;
} | {
    success: boolean;
    message: ChatMessage;
    error?: undefined;
}>;
export declare function deleteMessage(messageId: string, userId: string): Promise<{
    success: boolean;
    error: string;
} | {
    success: boolean;
    error?: undefined;
}>;
export declare function addParticipant(conversationId: string, userId: string, addedBy: string): Promise<{
    success: boolean;
    error: string;
    conversation?: undefined;
} | {
    success: boolean;
    conversation: Conversation;
    error?: undefined;
}>;
export declare function leaveConversation(conversationId: string, userId: string): Promise<{
    success: boolean;
    error: string;
} | {
    success: boolean;
    error?: undefined;
}>;
//# sourceMappingURL=chatService.d.ts.map