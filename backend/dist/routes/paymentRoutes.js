"use strict";
// Payment routes for subscriptions and purchases
// Merchant subscription management and customer purchases
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
const authMiddleware_1 = require("../middleware/authMiddleware");
const paymentService = __importStar(require("../services/paymentService"));
const errors_1 = require("../utils/errors");
const router = (0, express_1.Router)();
// Merchant subscription endpoints
router.get("/merchant/subscription/plans", authMiddleware_1.authenticate, async (_req, res) => {
    try {
        const plans = [
            { id: "starter", name: "Starter", price: 10, priceId: process.env.STRIPE_PRICE_STARTER },
            { id: "pro", name: "Pro", price: 50, priceId: process.env.STRIPE_PRICE_PRO },
            { id: "enterprise", name: "Enterprise", price: 0, priceId: process.env.STRIPE_PRICE_ENTERPRISE, contact: true },
        ];
        return (0, errors_1.sendSuccess)(res, { plans });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
});
router.post("/merchant/subscription/start", authMiddleware_1.authenticate, async (req, res) => {
    try {
        const { priceId, planName } = req.body;
        if (!priceId || !planName) {
            return (0, errors_1.sendError)(res, "Price ID and plan name required", 400);
        }
        const result = await paymentService.createMerchantSubscription({
            merchantId: req.user.userId,
            priceId,
            planName,
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Subscription failed", 400);
        }
        return (0, errors_1.sendSuccess)(res, result);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
});
router.get("/merchant/subscription/status", authMiddleware_1.authenticate, async (req, res) => {
    try {
        const subscription = await paymentService.getMerchantSubscription(req.user.userId);
        return (0, errors_1.sendSuccess)(res, { subscription: subscription || null });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
});
router.post("/merchant/subscription/cancel", authMiddleware_1.authenticate, async (req, res) => {
    try {
        const subscription = await paymentService.getMerchantSubscription(req.user.userId);
        if (!subscription || !subscription.stripeSubscriptionId) {
            return (0, errors_1.sendError)(res, "No active subscription found", 404);
        }
        // Cancel in Stripe (would need Stripe client)
        return (0, errors_1.sendSuccess)(res, { message: "Subscription canceled" });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
});
// Customer purchase endpoints
router.post("/customer/intent", authMiddleware_1.authenticate, async (req, res) => {
    try {
        const { productType, amount } = req.body;
        if (!productType || !amount) {
            return (0, errors_1.sendError)(res, "Product type and amount required", 400);
        }
        const result = await paymentService.createPaymentIntent({
            customerId: req.user.userId,
            productType,
            amount,
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Payment intent failed", 400);
        }
        return (0, errors_1.sendSuccess)(res, result);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
});
router.get("/customer/history", authMiddleware_1.authenticate, async (req, res) => {
    try {
        const purchases = await paymentService.getCustomerPurchases(req.user.userId);
        return (0, errors_1.sendSuccess)(res, { purchases });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
});
// Webhook endpoint (no auth needed)
router.post("/webhook/stripe", async (req, res) => {
    try {
        // Would need to verify webhook signature in production
        const result = await paymentService.handleStripeWebhook(req.body);
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Webhook failed", 400);
        }
        return (0, errors_1.sendSuccess)(res, { received: true });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
});
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map