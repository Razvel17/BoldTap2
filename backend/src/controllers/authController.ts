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
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

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

    return sendSuccess(res, { user });
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
