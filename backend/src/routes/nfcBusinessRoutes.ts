// NFC Business Profile Routes
// API endpoints for NFC business profile operations

import { Router } from "express";
import * as nfcController from "../controllers/nfcBusinessController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Public endpoints
router.get("/profile/:slug", nfcController.getNfcProfileBySlug);
router.get("/check-slug", nfcController.checkSlugAvailability);

// Protected endpoints (require authentication)
router.post("/profile", authenticate, nfcController.createNfcProfile);
router.get("/profile", authenticate, nfcController.getUserNfcProfile);
router.put("/profile/:profileId", authenticate, nfcController.updateNfcProfile);
router.delete(
  "/profile/:profileId",
  authenticate,
  nfcController.deleteNfcProfile,
);

export default router;
