// Authentication routes
// All auth-related endpoints

import { Router } from "express";
import passport from "passport";
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
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }) as any,
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/oauth/failure?provider=google",
  }) as any,
  authController.googleCallback as any,
);
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }) as any,
);
router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/auth/oauth/failure?provider=github",
  }) as any,
  authController.githubCallback as any,
);
router.get("/oauth/failure", authController.oauthFailure as any);

// Protected endpoints (require authentication)
router.get("/me", authenticate as any, authController.getCurrentUser as any);
router.get("/me/info", authenticate as any, authController.getCurrentUserInfo as any);
router.put("/profile", authenticate as any, authController.updateProfile as any);
router.post("/change-password", authenticate as any, authController.changePassword as any);

export default router;
