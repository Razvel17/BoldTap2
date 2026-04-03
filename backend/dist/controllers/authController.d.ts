import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
export declare function register(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function login(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function logout(_req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getCurrentUserInfo(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function changePassword(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function checkEmailAvailability(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function verifyEmail(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function forgotPassword(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function resetPassword(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function refresh(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function googleCallback(req: any, res: Response): Promise<void | Response<any, Record<string, any>>>;
export declare function githubCallback(req: any, res: Response): Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map