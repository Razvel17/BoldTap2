import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
export declare function createLoyaltyBusiness(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getUserLoyaltyBusinesses(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getLoyaltyBusinessBySlug(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createLoyaltyCard(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getLoyaltyCard(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getUserLoyaltyCards(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function addPointsToCard(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getBusinessLoyaltyCards(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteLoyaltyCard(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateLoyaltyBusiness(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=loyaltyCardController.d.ts.map