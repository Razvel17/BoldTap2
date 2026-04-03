import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
export declare class WebSocketService {
    private io;
    private userSockets;
    constructor(server: HTTPServer);
    private setupMiddleware;
    private setupEventHandlers;
    notifyNewMessage(conversationId: string, message: any): void;
    notifyMessageUpdated(conversationId: string, message: any): void;
    notifyMessageDeleted(conversationId: string, messageId: string): void;
    notifyParticipantJoined(conversationId: string, userId: string): void;
    notifyParticipantLeft(conversationId: string, userId: string): void;
    getIO(): SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
    getUserSockets(userId: string): string[];
}
//# sourceMappingURL=websocketService.d.ts.map