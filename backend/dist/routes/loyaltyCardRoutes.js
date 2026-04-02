"use strict";
// Loyalty Card Routes
// API endpoints for loyalty card operations
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
const loyaltyController = __importStar(require("../controllers/loyaltyCardController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public endpoints
router.get("/business/:slug", loyaltyController.getLoyaltyBusinessBySlug);
router.get("/card/:cardId", loyaltyController.getLoyaltyCard);
// Protected endpoints (require authentication)
router.post("/business", authMiddleware_1.authenticate, loyaltyController.createLoyaltyBusiness);
router.get("/user/businesses", authMiddleware_1.authenticate, loyaltyController.getUserLoyaltyBusinesses);
router.get("/user/cards", authMiddleware_1.authenticate, loyaltyController.getUserLoyaltyCards);
router.post("/card", authMiddleware_1.authenticate, loyaltyController.createLoyaltyCard);
router.post("/card/:cardId/points", authMiddleware_1.authenticate, loyaltyController.addPointsToCard);
router.put("/business/:businessId", authMiddleware_1.authenticate, loyaltyController.updateLoyaltyBusiness);
router.delete("/card/:cardId", authMiddleware_1.authenticate, loyaltyController.deleteLoyaltyCard);
// Admin endpoints
router.get("/business/:businessId/cards", authMiddleware_1.authenticate, loyaltyController.getBusinessLoyaltyCards);
exports.default = router;
//# sourceMappingURL=loyaltyCardRoutes.js.map