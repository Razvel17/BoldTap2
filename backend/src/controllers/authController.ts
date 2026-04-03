// Authentication controller
// Handles HTTP requests for authentication endpoints

import type { Response } from "express";
import {
  sendSuccess,
  sendError,
  sendCreated,
  validateRequiredFields,
} from "../utils/errors";
import * as authService from "../services/authServices";
import * as tokenService from "../services/tokenService";
import * as oauthService from "../services/oauthService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  FRONTEND_RESET_PASSWORD_URL,
  FRONTEND_URL,
} from "../config/env";

// Register new user
export async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    const validationError = validateRequiredFields({ name, email, password }, [
      "name",
      "email",
      "password",
    ]);
    if (validationError) {
      return sendError(res, validationError);
    }

    const result = await authService.register({
      name,
      email,
      phone,
      password,
    });

    if (!result.success) {
      return sendError(res, result.error || "Registration failed", 400);
    }

    return sendCreated(res, {
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

// Login user
export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const validationError = validateRequiredFields({ email, password }, [
      "email",
      "password",
    ]);
    if (validationError) {
      return sendError(res, validationError);
    }

    const result = await authService.login({ email, password });

    if (!result.success) {
      return sendError(res, result.error || "Login failed", 401);
    }

    return sendSuccess(res, {
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

// Logout user
export async function logout(_req: AuthenticatedRequest, res: Response) {
  try {
    // In JWT-based auth, logout is handled client-side by deleting the token
    // Server just confirms the logout
    return sendSuccess(res, null, "Logged out successfully");
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Get current user
export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Limit response to required fields only
    return sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Update user profile
export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const { name, phone } = req.body;

    const result = await authService.updateProfile(req.user.userId, {
      name,
      phone,
    });

    if (!result.success) {
      return sendError(res, result.error || "Update failed", 400);
    }

    return sendSuccess(res, { user: result.user }, "Profile updated");
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Get current authenticated user info
export async function getCurrentUserInfo(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, { user });
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Change password
export async function changePassword(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const { oldPassword, newPassword } = req.body;

    // Validate required fields
    const validationError = validateRequiredFields(
      { oldPassword, newPassword },
      ["oldPassword", "newPassword"],
    );
    if (validationError) {
      return sendError(res, validationError);
    }

    const result = await authService.changePassword(
      req.user.userId,
      oldPassword,
      newPassword,
    );

    if (!result.success) {
      return sendError(res, result.error || "Password change failed", 400);
    }

    return sendSuccess(res, null, "Password changed successfully");
  } catch (error) {
    return sendError(res, error as Error);
  }
}

// Check if email is available
export async function checkEmailAvailability(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return sendError(res, "Email is required", 400);
    }

    const exists = await authService.emailExists(email);

    return sendSuccess(res, { available: !exists });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

// Verify email with token
export async function verifyEmail(req: any, res: Response) {
  try {
    const { token } = req.params;

    if (!token) {
      return sendError(res, "Verification token required", 400);
    }

    const result = await tokenService.verifyAndUseToken(
      token as string,
      "email_verification",
    );
    if (!result) {
      return sendError(res, "Invalid or expired verification token", 400);
    }

    return sendSuccess(res, {
      message: "Email verified successfully",
    });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

// Request password reset
export async function forgotPassword(req: any, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, "Email is required", 400);
    }

    const exists = await authService.emailExists(email);

    if (exists) {
      const user = await authService.getUserByEmail(email);

      if (user) {
        const resetToken = await tokenService.createVerificationToken(
          user.id,
          "password_reset",
          1,
        );

        // Uncomment when email service is ready
        // const resetLink = `${FRONTEND_RESET_PASSWORD_URL}?token=${resetToken}`;
        void `${FRONTEND_RESET_PASSWORD_URL}?token=${resetToken}`;
      }

      // await emailService.sendPasswordResetEmail(email, resetLink);
    }

    // Always return success for security
    return sendSuccess(res, {
      message: "If this email exists, a password reset link has been sent.",
    });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

// Reset password with token
export async function resetPassword(req: any, res: Response) {
  try {
    const token = req.params.token || req.body.token;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return sendError(res, "Token and new password are required", 400);
    }

    const result = await tokenService.verifyAndUseToken(
      token,
      "password_reset",
    );
    if (!result) {
      return sendError(res, "Invalid or expired reset token", 400);
    }

    const passwordReset = await authService.resetPasswordDirect(
      result.userId,
      newPassword,
    );

    if (!passwordReset.success) {
      return sendError(res, passwordReset.error || "Password reset failed", 400);
    }

    return sendSuccess(res, {
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

// Refresh access token
export async function refresh(req: any, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, "Refresh token required", 401);
    }

    const refreshTokenRecord =
      await tokenService.getRefreshTokenRecord(refreshToken);
    if (!refreshTokenRecord) {
      return sendError(res, "Invalid or expired refresh token", 401);
    }

    const user = await authService.getUserById(refreshTokenRecord.userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const newAccessToken = await authService.generateTokenForExport({
      userId: user.id,
      email: user.email,
    });

    return sendSuccess(res, {
      accessToken: newAccessToken,
    });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

// OAuth Google callback
export async function googleCallback(req: any, res: Response) {
  try {
    const result = await oauthService.handleOAuthLogin("google", {
      id: req.user.id,
      email: req.user.email,
      name: req.user.displayName || req.user.email,
    });

    if (!result.success) {
      return sendError(res, result.error || "Google OAuth failed", 401);
    }

    const frontendUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    return res.redirect(frontendUrl);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

// OAuth GitHub callback
export async function githubCallback(req: any, res: Response) {
  try {
    const result = await oauthService.handleOAuthLogin("github", {
      id: req.user.id,
      email: req.user.emails?.[0]?.value || req.user.email || "",
      name: req.user.displayName || req.user.username || "GitHub User",
    });

    if (!result.success) {
      return sendError(res, result.error || "GitHub OAuth failed", 401);
    }

    const frontendUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    return res.redirect(frontendUrl);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function oauthFailure(req: any, res: Response) {
  const provider = typeof req.query.provider === "string"
    ? req.query.provider
    : "oauth";
  const frontendUrl = `${FRONTEND_URL}/auth/callback?error=${provider}_authentication_failed`;
  return res.redirect(frontendUrl);
}
