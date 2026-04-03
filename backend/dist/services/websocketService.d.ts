import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
export declare class WebSocketService {
    private io;
    constructor(httpServer: HttpServer);
    private setupMiddleware;
    private setupEventHandlers;
    emitToConversation(conversationId: string, event: string, data: any): void;
    emitToUser(userId: string, event: string, data: any): void;
    getIO(): SocketIOServer;
}
//# sourceMappingURL=websocketService.d.ts.map