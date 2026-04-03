// Authentication routes
// All auth-related endpoints

import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Public endpoints
router.post("/register", authController.register as any);
router.post("/login", authController.login as any);
router.post("/logout", authController.logout as any);
router.post("/refresh", authController.refresh as any);
router.get("/check-email", authController.checkEmailAvailability as any);

// Email verification
router.post("/verify-email/:token", authController.verifyEmail as any);

// Password reset
router.post("/forgot-password", authController.forgotPassword as any);
router.post("/reset-password/:token", authController.resetPassword as any);

// OAuth endpoints
router.get("/google", (_req, res) => {
  // Passport will handle this
  res.json({ message: "Start Google OAuth flow" });
});
router.get("/google/callback", authController.googleCallback as any);
router.get("/github", (_req, res) => {
  // Passport will handle this
  res.json({ message: "Start GitHub OAuth flow" });
});
router.get("/github/callback", authController.githubCallback as any);

// Protected endpoints (require authentication)
router.get("/me", authenticate as any, authController.getCurrentUser as any);
router.get("/me/info", authenticate as any, authController.getCurrentUserInfo as any);
router.put("/profile", authenticate as any, authController.updateProfile as any);
router.post("/change-password", authenticate as any, authController.changePassword as any);

export default router;
