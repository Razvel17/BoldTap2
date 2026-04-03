import { ChatMessage } from "../entities/ChatMessage";
export interface SearchResult {
    messages: ChatMessage[];
    total: number;
    page: number;
    pageSize: number;
}
export declare function searchMessages(conversationId: string, query: string, page?: number, pageSize?: number): Promise<SearchResult>;
export declare function searchByUser(conversationId: string, userId: string, page?: number, pageSize?: number): Promise<SearchResult>;
export declare function searchByDateRange(conversationId: string, startDate: Date, endDate: Date, page?: number, pageSize?: number): Promise<SearchResult>;
export declare function getRecentMessages(conversationId: string, limit?: number): Promise<ChatMessage[]>;
//# sourceMappingURL=messageSearchService.d.ts.map