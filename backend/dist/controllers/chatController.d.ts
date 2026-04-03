import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
export declare function createConversation(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function listConversations(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function getMessages(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function sendMessage(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function editMessage(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function deleteMessage(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function addParticipant(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function leaveConversation(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
//# sourceMappingURL=chatController.d.ts.map