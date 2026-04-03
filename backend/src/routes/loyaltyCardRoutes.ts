// Loyalty Card Routes
// API endpoints for loyalty card operations

import { Router } from "express";
import * as loyaltyController from "../controllers/loyaltyCardController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Public endpoints
router.get("/business/:slug", loyaltyController.getLoyaltyBusinessBySlug as any);
router.get("/card/:cardId", loyaltyController.getLoyaltyCard as any);

// Protected endpoints (require authentication)
router.post("/business", authenticate as any, loyaltyController.createLoyaltyBusiness as any);
router.get("/user/businesses", authenticate as any, loyaltyController.getUserLoyaltyBusinesses as any);
router.get("/user/cards", authenticate as any, loyaltyController.getUserLoyaltyCards as any);
router.post("/card", authenticate as any, loyaltyController.createLoyaltyCard as any);
router.post("/card/:cardId/points", authenticate as any, loyaltyController.addPointsToCard as any);
router.put("/business/:businessId", authenticate as any, loyaltyController.updateLoyaltyBusiness as any);
router.delete("/card/:cardId", authenticate as any, loyaltyController.deleteLoyaltyCard as any);

// Admin endpoints
router.get("/business/:businessId/cards", authenticate as any, loyaltyController.getBusinessLoyaltyCards as any);

export default router;
