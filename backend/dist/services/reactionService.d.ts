import { MessageReaction } from "../entities/MessageReaction";
interface ReactionCount {
    emoji: string;
    count: number;
    users: string[];
    userReacted: boolean;
}
export declare function addReaction(messageId: string, userId: string, emoji: string): Promise<MessageReaction>;
export declare function removeReaction(messageId: string, userId: string, emoji: string): Promise<void>;
export declare function getReactions(messageId: string, currentUserId?: string): Promise<ReactionCount[]>;
export declare function getUserReactions(messageId: string, userId: string): Promise<string[]>;
export declare function getReactionSummary(messageIds: string[]): Promise<Record<string, {
    emoji: string;
    count: number;
}[]>>;
export {};
//# sourceMappingURL=reactionService.d.ts.map