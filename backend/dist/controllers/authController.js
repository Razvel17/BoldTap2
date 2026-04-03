"use strict";
// Authentication controller
// Handles HTTP requests for authentication endpoints
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getCurrentUser = getCurrentUser;
exports.updateProfile = updateProfile;
exports.getCurrentUserInfo = getCurrentUserInfo;
exports.changePassword = changePassword;
exports.checkEmailAvailability = checkEmailAvailability;
exports.verifyEmail = verifyEmail;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.refresh = refresh;
exports.googleCallback = googleCallback;
exports.githubCallback = githubCallback;
const errors_1 = require("../utils/errors");
const authService = __importStar(require("../services/authServices"));
const tokenService = __importStar(require("../services/tokenService"));
const oauthService = __importStar(require("../services/oauthService"));
// Register new user
async function register(req, res) {
    try {
        const { name, email, phone, password } = req.body;
        // Validate required fields
        const validationError = (0, errors_1.validateRequiredFields)({ name, email, password }, [
            "name",
            "email",
            "password",
        ]);
        if (validationError) {
            return (0, errors_1.sendError)(res, validationError);
        }
        const result = await authService.register({
            name,
            email,
            phone,
            password,
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Registration failed", 400);
        }
        return (0, errors_1.sendCreated)(res, {
            user: result.user,
            token: result.token,
        });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Login user
async function login(req, res) {
    try {
        const { email, password } = req.body;
        // Validate required fields
        const validationError = (0, errors_1.validateRequiredFields)({ email, password }, [
            "email",
            "password",
        ]);
        if (validationError) {
            return (0, errors_1.sendError)(res, validationError);
        }
        const result = await authService.login({ email, password });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Login failed", 401);
        }
        return (0, errors_1.sendSuccess)(res, {
            user: result.user,
            token: result.token,
        });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Logout user
async function logout(_req, res) {
    try {
        // In JWT-based auth, logout is handled client-side by deleting the token
        // Server just confirms the logout
        return (0, errors_1.sendSuccess)(res, null, "Logged out successfully");
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Get current user
async function getCurrentUser(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return (0, errors_1.sendError)(res, "User not authenticated", 401);
        }
        const user = await authService.getUserById(req.user.userId);
        if (!user) {
            return (0, errors_1.sendError)(res, "User not found", 404);
        }
        // Limit response to required fields only
        return (0, errors_1.sendSuccess)(res, {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Update user profile
async function updateProfile(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return (0, errors_1.sendError)(res, "User not authenticated", 401);
        }
        const { name, phone } = req.body;
        const result = await authService.updateProfile(req.user.userId, {
            name,
            phone,
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Update failed", 400);
        }
        return (0, errors_1.sendSuccess)(res, { user: result.user }, "Profile updated");
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Get current authenticated user info
async function getCurrentUserInfo(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return (0, errors_1.sendError)(res, "User not authenticated", 401);
        }
        const user = await authService.getUserById(req.user.userId);
        if (!user) {
            return (0, errors_1.sendError)(res, "User not found", 404);
        }
        return (0, errors_1.sendSuccess)(res, { user });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Change password
async function changePassword(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return (0, errors_1.sendError)(res, "User not authenticated", 401);
        }
        const { oldPassword, newPassword } = req.body;
        // Validate required fields
        const validationError = (0, errors_1.validateRequiredFields)({ oldPassword, newPassword }, ["oldPassword", "newPassword"]);
        if (validationError) {
            return (0, errors_1.sendError)(res, validationError);
        }
        const result = await authService.changePassword(req.user.userId, oldPassword, newPassword);
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Password change failed", 400);
        }
        return (0, errors_1.sendSuccess)(res, null, "Password changed successfully");
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Check if email is available
async function checkEmailAvailability(req, res) {
    try {
        const { email } = req.query;
        if (!email || typeof email !== "string") {
            return (0, errors_1.sendError)(res, "Email is required", 400);
        }
        const exists = await authService.emailExists(email);
        return (0, errors_1.sendSuccess)(res, { available: !exists });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Verify email with token
async function verifyEmail(req, res) {
    try {
        const { token } = req.params;
        if (!token) {
            return (0, errors_1.sendError)(res, "Verification token required", 400);
        }
        const result = await tokenService.verifyAndUseToken(token, "email_verification");
        if (!result) {
            return (0, errors_1.sendError)(res, "Invalid or expired verification token", 400);
        }
        return (0, errors_1.sendSuccess)(res, {
            message: "Email verified successfully",
        });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Request password reset
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return (0, errors_1.sendError)(res, "Email is required", 400);
        }
        const exists = await authService.emailExists(email);
        if (exists) {
            // Find user by email (need to add this method)
            // For now, just send success to prevent email enumeration
            await tokenService.createVerificationToken("", // This needs fixing
            "password_reset", 1);
            // Uncomment when email service is ready
            // const resetLink = `${FRONTEND_RESET_PASSWORD_URL}?token=${resetToken}`;
            // await emailService.sendPasswordResetEmail(email, resetLink);
        }
        // Always return success for security
        return (0, errors_1.sendSuccess)(res, {
            message: "If this email exists, a password reset link has been sent.",
        });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Reset password with token
async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return (0, errors_1.sendError)(res, "Token and new password are required", 400);
        }
        const result = await tokenService.verifyAndUseToken(token, "password_reset");
        if (!result) {
            return (0, errors_1.sendError)(res, "Invalid or expired reset token", 400);
        }
        // Note: This will fail since changePassword expects oldPassword
        // Need to add a separate resetPasswordDirect method to authService
        const passwordReset = await authService.changePassword(result.userId, "", newPassword);
        if (!passwordReset.success) {
            return (0, errors_1.sendError)(res, passwordReset.error || "Password reset failed", 400);
        }
        return (0, errors_1.sendSuccess)(res, {
            message: "Password has been reset successfully",
        });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Refresh access token
async function refresh(req, res) {
    try {
        const { refreshToken } = req.body;
        const userId = req.user?.userId;
        if (!refreshToken || !userId) {
            return (0, errors_1.sendError)(res, "Refresh token required", 401);
        }
        const isValid = await tokenService.verifyRefreshToken(refreshToken, userId);
        if (!isValid) {
            return (0, errors_1.sendError)(res, "Invalid or expired refresh token", 401);
        }
        const user = await authService.getUserById(userId);
        if (!user) {
            return (0, errors_1.sendError)(res, "User not found", 404);
        }
        const newAccessToken = await authService.generateTokenForExport({
            userId: user.id,
            email: user.email,
        });
        return (0, errors_1.sendSuccess)(res, {
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// OAuth Google callback
async function googleCallback(req, res) {
    try {
        const result = await oauthService.handleOAuthLogin("google", {
            id: req.user.id,
            email: req.user.email,
            name: req.user.displayName || req.user.email,
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Google OAuth failed", 401);
        }
        const frontendUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
        return res.redirect(frontendUrl);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// OAuth GitHub callback
async function githubCallback(req, res) {
    try {
        const result = await oauthService.handleOAuthLogin("github", {
            id: req.user.id,
            email: req.user.emails?.[0]?.value || req.user.email || "",
            name: req.user.displayName || req.user.username || "GitHub User",
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "GitHub OAuth failed", 401);
        }
        const frontendUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
        return res.redirect(frontendUrl);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
//# sourceMappingURL=authController.js.map