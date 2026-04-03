// OAuth Service - Handle Google and GitHub OAuth flows
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { OAuthAccount } from "../entities/OAuthAccount";
import { generateTokenForExport } from "./authServices";
import { createRefreshToken } from "./tokenService";

const userRepo = () => AppDataSource.getRepository(User);
const oauthRepo = () => AppDataSource.getRepository(OAuthAccount);

interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface OAuthResponse {
  success: boolean;
  user?: { id: string; name: string; email: string };
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  isNewUser?: boolean;
}

/**
 * Handle OAuth login/signup
 * Creates new user if doesn't exist, links account if exists
 */
export async function handleOAuthLogin(
  provider: "google" | "github",
  profile: OAuthProfile,
): Promise<OAuthResponse> {
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
      } else {
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
    const accessToken = await generateTokenForExport({ userId: user.id, email: user.email });
    const refreshToken = await createRefreshToken(user.id);

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
  } catch (error) {
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
export async function getOAuthAccount(provider: string, providerAccountId: string) {
  return await oauthRepo().findOne({
    where: { provider, providerAccountId },
    relations: ["user"],
  });
}

/**
 * Link OAuth account to existing user
 */
export async function linkOAuthAccount(
  userId: string,
  provider: string,
  providerAccountId: string,
  providerEmail?: string,
): Promise<boolean> {
  try {
    const oauthAccount = oauthRepo().create({
      userId,
      provider,
      providerAccountId,
      providerEmail,
    });
    await oauthRepo().save(oauthAccount);
    return true;
  } catch (error) {
    console.error("Error linking OAuth account:", error);
    return false;
  }
}
