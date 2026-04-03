"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOAuthLogin = handleOAuthLogin;
exports.getOAuthAccount = getOAuthAccount;
exports.linkOAuthAccount = linkOAuthAccount;
// OAuth Service - Handle Google and GitHub OAuth flows
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const OAuthAccount_1 = require("../entities/OAuthAccount");
const authServices_1 = require("./authServices");
const tokenService_1 = require("./tokenService");
const userRepo = () => database_1.AppDataSource.getRepository(User_1.User);
const oauthRepo = () => database_1.AppDataSource.getRepository(OAuthAccount_1.OAuthAccount);
/**
 * Handle OAuth login/signup
 * Creates new user if doesn't exist, links account if exists
 */
async function handleOAuthLogin(provider, profile) {
    try {
        // Check if OAuth account exists
        let oauthAccount = await oauthRepo().findOne({
            where: {
                provider,
                providerAccountId: profile.id,
            },
            relations: ["user"],
        });
        let user = oauthAccount?.user;
        let isNewUser = false;
        if (!user) {
            // Check if email exists
            const existingUser = await userRepo().findOne({
                where: { email: profile.email },
            });
            if (existingUser) {
                // Link existing account
                user = existingUser;
            }
            else {
                // Create new user
                user = userRepo().create({
                    email: profile.email,
                    name: profile.name,
                    emailVerified: true, // OAuth emails are verified
                    userType: "customer",
                });
                await userRepo().save(user);
                isNewUser = true;
            }
        }
        // Create/update OAuth account if doesn't exist
        if (!oauthAccount) {
            oauthAccount = oauthRepo().create({
                userId: user.id,
                provider,
                providerAccountId: profile.id,
                providerEmail: profile.email,
            });
            await oauthRepo().save(oauthAccount);
        }
        // Generate tokens
        const accessToken = await (0, authServices_1.generateTokenForExport)({ userId: user.id, email: user.email });
        const refreshToken = await (0, tokenService_1.createRefreshToken)(user.id);
        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            accessToken,
            refreshToken,
            isNewUser,
        };
    }
    catch (error) {
        console.error("OAuth login error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "OAuth login failed",
        };
    }
}
/**
 * Get OAuth account by provider and ID
 */
async function getOAuthAccount(provider, providerAccountId) {
    return await oauthRepo().findOne({
        where: { provider, providerAccountId },
        relations: ["user"],
    });
}
/**
 * Link OAuth account to existing user
 */
async function linkOAuthAccount(userId, provider, providerAccountId, providerEmail) {
    try {
        const oauthAccount = oauthRepo().create({
            userId,
            provider,
            providerAccountId,
            providerEmail,
        });
        await oauthRepo().save(oauthAccount);
        return true;
    }
    catch (error) {
        console.error("Error linking OAuth account:", error);
        return false;
    }
}
//# sourceMappingURL=oauthService.js.map