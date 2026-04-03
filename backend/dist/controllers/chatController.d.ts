import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
export declare function createConversation(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function listConversations(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function getMessages(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function sendMessage(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function editMessage(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function deleteMessage(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function addParticipant(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function leaveConversation(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function searchMessages(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function addReaction(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
export declare function getReactions(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
//# sourceMappingURL=chatController.d.ts.map