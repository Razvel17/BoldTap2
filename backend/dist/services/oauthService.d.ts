import { OAuthAccount } from "../entities/OAuthAccount";
interface OAuthProfile {
    id: string;
    email: string;
    name: string;
    picture?: string;
}
interface OAuthResponse {
    success: boolean;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    isNewUser?: boolean;
}
/**
 * Handle OAuth login/signup
 * Creates new user if doesn't exist, links account if exists
 */
export declare function handleOAuthLogin(provider: "google" | "github", profile: OAuthProfile): Promise<OAuthResponse>;
/**
 * Get OAuth account by provider and ID
 */
export declare function getOAuthAccount(provider: string, providerAccountId: string): Promise<OAuthAccount | null>;
/**
 * Link OAuth account to existing user
 */
export declare function linkOAuthAccount(userId: string, provider: string, providerAccountId: string, providerEmail?: string): Promise<boolean>;
export {};
//# sourceMappingURL=oauthService.d.ts.map