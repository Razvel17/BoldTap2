"use strict";
// Authentication routes
// All auth-related endpoints
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
const express_1 = require("express");
const authController = __importStar(require("../controllers/authController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public endpoints
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/check-email", authController.checkEmailAvailability);
// Email verification
router.post("/verify-email/:token", authController.verifyEmail);
// Password reset
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
// OAuth endpoints
router.get("/google", (_req, res) => {
    // Passport will handle this
    res.json({ message: "Start Google OAuth flow" });
});
router.get("/google/callback", authController.googleCallback);
router.get("/github", (_req, res) => {
    // Passport will handle this
    res.json({ message: "Start GitHub OAuth flow" });
});
router.get("/github/callback", authController.githubCallback);
// Protected endpoints (require authentication)
router.get("/me", authMiddleware_1.authenticate, authController.getCurrentUser);
router.get("/me/info", authMiddleware_1.authenticate, authController.getCurrentUserInfo);
router.put("/profile", authMiddleware_1.authenticate, authController.updateProfile);
router.post("/change-password", authMiddleware_1.authenticate, authController.changePassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map