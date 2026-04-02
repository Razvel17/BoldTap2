import type { Request, Response, NextFunction } from "express";
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        userId: string;
    };
}
export declare function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
export declare function authorize(..._roles: string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map