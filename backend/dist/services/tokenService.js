"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.hashToken = hashToken;
exports.createRefreshToken = createRefreshToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.revokeRefreshToken = revokeRefreshToken;
exports.createVerificationToken = createVerificationToken;
exports.verifyAndUseToken = verifyAndUseToken;
exports.cleanupExpiredTokens = cleanupExpiredTokens;
// Token Service - Manage refresh tokens and verification tokens
const crypto_1 = __importDefault(require("crypto"));
const typeorm_1 = require("typeorm");
const database_1 = require("../config/database");
const RefreshToken_1 = require("../entities/RefreshToken");
const VerificationToken_1 = require("../entities/VerificationToken");
const refreshTokenRepo = () => database_1.AppDataSource.getRepository(RefreshToken_1.RefreshToken);
const verificationTokenRepo = () => database_1.AppDataSource.getRepository(VerificationToken_1.VerificationToken);
// Generate a random token
function generateToken(length = 32) {
    return crypto_1.default.randomBytes(length).toString("hex");
}
// Hash a token
function hashToken(token) {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
}
// Create and store a refresh token
async function createRefreshToken(userId, expiryDays = 7) {
    const token = generateToken(64);
    const tokenHash = hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    const refreshToken = refreshTokenRepo().create({
        userId,
        tokenHash,
        expiresAt,
    });
    await refreshTokenRepo().save(refreshToken);
    return token; // Return the unhashed token to client
}
// Verify a refresh token
async function verifyRefreshToken(token, userId) {
    const tokenHash = hashToken(token);
    const refreshToken = await refreshTokenRepo().findOne({
        where: {
            userId,
            tokenHash,
            revokedAt: (0, typeorm_1.IsNull)(),
        },
    });
    if (!refreshToken)
        return false;
    // Check if expired
    if (new Date() > refreshToken.expiresAt) {
        return false;
    }
    return true;
}
// Revoke a refresh token (logout)
async function revokeRefreshToken(token, userId) {
    const tokenHash = hashToken(token);
    const result = await refreshTokenRepo().update({ userId, tokenHash }, { revokedAt: new Date() });
    return (result.affected || 0) > 0;
}
// Create a verification token (for email verification or password reset)
async function createVerificationToken(userId, type, expiryHours = 24) {
    const token = generateToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);
    const verificationToken = verificationTokenRepo().create({
        userId,
        token,
        type,
        expiresAt,
    });
    await verificationTokenRepo().save(verificationToken);
    return token;
}
// Verify and use a token (marks as used, returns null if invalid/expired)
async function verifyAndUseToken(token, expectedType) {
    const verificationToken = await verificationTokenRepo().findOne({
        where: {
            token,
            type: expectedType,
            usedAt: (0, typeorm_1.IsNull)(),
        },
    });
    if (!verificationToken)
        return null;
    // Check if expired
    if (new Date() > verificationToken.expiresAt) {
        return null;
    }
    // Mark as used
    await verificationTokenRepo().update({ id: verificationToken.id }, { usedAt: new Date() });
    return { userId: verificationToken.userId };
}
// Cleanup expired tokens (optional, can run periodically)
async function cleanupExpiredTokens() {
    const now = new Date();
    // Delete expired verification tokens
    await verificationTokenRepo()
        .createQueryBuilder()
        .delete()
        .where("expiresAt < :now", { now })
        .execute();
    // Delete expired refresh tokens
    await refreshTokenRepo()
        .createQueryBuilder()
        .delete()
        .where("expiresAt < :now", { now })
        .execute();
}
//# sourceMappingURL=tokenService.js.map