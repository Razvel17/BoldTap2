export declare function generateToken(length?: number): string;
export declare function hashToken(token: string): string;
export declare function createRefreshToken(userId: string, expiryDays?: number): Promise<string>;
export declare function verifyRefreshToken(token: string, userId: string): Promise<boolean>;
export declare function revokeRefreshToken(token: string, userId: string): Promise<boolean>;
export declare function createVerificationToken(userId: string, type: "email_verification" | "password_reset", expiryHours?: number): Promise<string>;
export declare function verifyAndUseToken(token: string, expectedType: "email_verification" | "password_reset"): Promise<{
    userId: string;
} | null>;
export declare function cleanupExpiredTokens(): Promise<void>;
//# sourceMappingURL=tokenService.d.ts.map