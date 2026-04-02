import type { Response } from "express";
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, message: string, code?: string);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare function sendSuccess<T = any>(res: Response, data?: T, message?: string, statusCode?: number): Response;
export declare function sendError(res: Response, error: Error | AppError | string, statusCode?: number): Response;
export declare function sendCreated<T = any>(res: Response, data: T, message?: string): Response;
export declare function sendNoContent(res: Response): Response;
export declare function sendPaginated<T>(res: Response, data: T[], total: number, page: number, limit: number, statusCode?: number): Response;
export declare function validateRequiredFields(data: Record<string, any>, fields: string[]): ValidationError | null;
export declare function validateEmail(email: string): boolean;
export declare function validatePassword(password: string): {
    valid: boolean;
    error?: string;
};
//# sourceMappingURL=errors.d.ts.map