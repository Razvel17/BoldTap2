// NFC Business Profile Routes
// API endpoints for NFC business profile operations

import { Router } from "express";
import * as nfcController from "../controllers/nfcBusinessController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Public endpoints
router.get("/profile/:slug", nfcController.getNfcProfileBySlug as any);
router.get("/check-slug", nfcController.checkSlugAvailability as any);

// Protected endpoints (require authentication)
router.post("/profile", authenticate as any, nfcController.createNfcProfile as any);
router.get("/profile", authenticate as any, nfcController.getUserNfcProfile as any);
router.put("/profile/:profileId", authenticate as any, nfcController.updateNfcProfile as any);
router.delete(
  "/profile/:profileId",
  authenticate as any,
  nfcController.deleteNfcProfile as any,
);

export default router;
