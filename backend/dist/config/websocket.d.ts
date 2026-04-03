import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
export declare function setupWebSocket(httpServer: HttpServer): SocketIOServer;
export declare function emitToConversation(io: SocketIOServer, conversationId: string, event: string, data: any): void;
export declare function emitToUser(io: SocketIOServer, userId: string, event: string, data: any): void;
//# sourceMappingURL=websocket.d.ts.map