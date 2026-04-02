// Loyalty Card Routes
// API endpoints for loyalty card operations

import { Router } from "express";
import * as loyaltyController from "../controllers/loyaltyCardController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Public endpoints
router.get("/business/:slug", loyaltyController.getLoyaltyBusinessBySlug);
router.get("/card/:cardId", loyaltyController.getLoyaltyCard);

// Protected endpoints (require authentication)
router.post("/business", authenticate, loyaltyController.createLoyaltyBusiness);
router.get("/user/businesses", authenticate, loyaltyController.getUserLoyaltyBusinesses);
router.get("/user/cards", authenticate, loyaltyController.getUserLoyaltyCards);
router.post("/card", authenticate, loyaltyController.createLoyaltyCard);
router.post("/card/:cardId/points", authenticate, loyaltyController.addPointsToCard);
router.put("/business/:businessId", authenticate, loyaltyController.updateLoyaltyBusiness);
router.delete("/card/:cardId", authenticate, loyaltyController.deleteLoyaltyCard);

// Admin endpoints
router.get("/business/:businessId/cards", authenticate, loyaltyController.getBusinessLoyaltyCards);

export default router;
