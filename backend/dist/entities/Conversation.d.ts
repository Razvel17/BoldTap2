import { User } from "./User";
import { ChatMessage } from "./ChatMessage";
export declare class Conversation {
    id: string;
    title: string;
    description: string;
    participants: User[];
    messages: ChatMessage[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
//# sourceMappingURL=Conversation.d.ts.map