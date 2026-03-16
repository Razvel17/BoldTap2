// express routes for authentication (registration, login, logout, get current user, update user profile, change password, forgot password, reset password)
import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.getCurrentUser);

export default router;
