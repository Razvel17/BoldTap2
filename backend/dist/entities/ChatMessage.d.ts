import { User } from "./User";
import { Conversation } from "./Conversation";
export declare class ChatMessage {
    id: string;
    conversationId: string;
    conversation: Conversation;
    senderId: string;
    sender: User;
    content: string;
    type: "text" | "image" | "file" | "system";
    metadata: Record<string, any> | null;
    edited: boolean;
    editedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
//# sourceMappingURL=ChatMessage.d.ts.map