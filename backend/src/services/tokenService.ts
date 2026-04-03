// Token Service - Manage refresh tokens and verification tokens
import crypto from "crypto";
import { IsNull } from "typeorm";
import { AppDataSource } from "../config/database";
import { RefreshToken } from "../entities/RefreshToken";
import { VerificationToken } from "../entities/VerificationToken";

const refreshTokenRepo = () => AppDataSource.getRepository(RefreshToken);
const verificationTokenRepo = () => AppDataSource.getRepository(VerificationToken);

// Generate a random token
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

// Hash a token
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Create and store a refresh token
export async function createRefreshToken(
  userId: string,
  expiryDays = 7,
): Promise<string> {
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
export async function verifyRefreshToken(token: string, userId: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const refreshToken = await refreshTokenRepo().findOne({
    where: {
      userId,
      tokenHash,
      revokedAt: IsNull(),
    },
  });

  if (!refreshToken) return false;

  // Check if expired
  if (new Date() > refreshToken.expiresAt) {
    return false;
  }

  return true;
}

// Revoke a refresh token (logout)
export async function revokeRefreshToken(token: string, userId: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const result = await refreshTokenRepo().update(
    { userId, tokenHash },
    { revokedAt: new Date() },
  );
  return (result.affected || 0) > 0;
}

// Create a verification token (for email verification or password reset)
export async function createVerificationToken(
  userId: string,
  type: "email_verification" | "password_reset",
  expiryHours = 24,
): Promise<string> {
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
export async function verifyAndUseToken(
  token: string,
  expectedType: "email_verification" | "password_reset",
): Promise<{ userId: string } | null> {
  const verificationToken = await verificationTokenRepo().findOne({
    where: {
      token,
      type: expectedType,
      usedAt: IsNull(),
    },
  });

  if (!verificationToken) return null;

  // Check if expired
  if (new Date() > verificationToken.expiresAt) {
    return null;
  }

  // Mark as used
  await verificationTokenRepo().update(
    { id: verificationToken.id },
    { usedAt: new Date() },
  );

  return { userId: verificationToken.userId };
}

// Cleanup expired tokens (optional, can run periodically)
export async function cleanupExpiredTokens(): Promise<void> {
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
