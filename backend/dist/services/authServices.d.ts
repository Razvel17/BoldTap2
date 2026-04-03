import type { UserProfile } from "../types/index";
interface RegisterInput {
    name: string;
    email: string;
    phone?: string;
    password: string;
}
interface LoginInput {
    email: string;
    password: string;
}
interface AuthResponse {
    success: boolean;
    user?: UserProfile;
    token?: string;
    error?: string;
}
interface TokenData {
    userId: string;
    email: string;
}
export declare function register(input: RegisterInput): Promise<AuthResponse>;
export declare function login(input: LoginInput): Promise<AuthResponse>;
export declare function getUserById(userId: string): Promise<UserProfile | null>;
export declare function updateProfile(userId: string, data: {
    name?: string;
    phone?: string;
}): Promise<{
    success: boolean;
    user?: UserProfile;
    error?: string;
}>;
export declare function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function verifyToken(token: string): Promise<TokenData | null>;
export declare function generateTokenForExport(data: TokenData): Promise<string>;
export declare function emailExists(email: string): Promise<boolean>;
export {};
//# sourceMappingURL=authServices.d.ts.map