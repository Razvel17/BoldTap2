import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
export declare function createNfcProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getNfcProfileBySlug(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getUserNfcProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateNfcProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteNfcProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function checkSlugAvailability(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=nfcBusinessController.d.ts.map