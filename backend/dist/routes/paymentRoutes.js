"use strict";
// Payment routes for mobile money collections and purchase history
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
router.get("/providers", authMiddleware_1.authenticate, async (_req, res) => {
    try {
        return (0, errors_1.sendSuccess)(res, { providers: paymentService.getSupportedProviders() });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
});
router.post("/collect", authMiddleware_1.authenticate, async (req, res) => {
    try {
        const { provider, phoneNumber, amount, reference, currency, customerName, description, productType, } = req.body;
        if (!provider || !phoneNumber || !amount || !reference) {
            return (0, errors_1.sendError)(res, "Provider, phone number, amount, and reference are required", 400);
        }
        const result = await paymentService.initiateCollection({
            customerUserId: req.user.userId,
            provider,
            phoneNumber,
            amount,
            reference,
            currency,
            customerName,
            description,
            productType,
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Collection request failed", 400);
        }
        return (0, errors_1.sendSuccess)(res, result);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
});
router.get("/:paymentId/status", authMiddleware_1.authenticate, async (req, res) => {
    try {
        const payment = await paymentService.getPaymentStatus(req.params.paymentId, req.user.userId);
        if (!payment) {
            return (0, errors_1.sendError)(res, "Payment not found", 404);
        }
        return (0, errors_1.sendSuccess)(res, { payment });
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
// Legacy route kept for compatibility with existing frontend code.
router.post("/customer/intent", authMiddleware_1.authenticate, async (req, res) => {
    try {
        const { provider, productType, amount, phoneNumber, reference } = req.body;
        if (!provider || !phoneNumber || !reference || !amount) {
            return (0, errors_1.sendError)(res, "Provider, phone number, amount, and reference are required", 400);
        }
        const result = await paymentService.initiateCollection({
            customerUserId: req.user.userId,
            provider,
            phoneNumber,
            productType,
            amount,
            reference,
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Collection request failed", 400);
        }
        return (0, errors_1.sendSuccess)(res, result);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
});
router.get("/merchant/subscription/plans", authMiddleware_1.authenticate, async (_req, res) => {
    try {
        return (0, errors_1.sendSuccess)(res, {
            plans: [
                { id: "starter", name: "Starter", price: 10000, currency: "TZS" },
                { id: "pro", name: "Pro", price: 50000, currency: "TZS" },
                { id: "enterprise", name: "Enterprise", price: 0, currency: "TZS", contact: true },
            ],
            message: "Use mobile money collection to charge for plans.",
        });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
});
router.post("/merchant/subscription/start", authMiddleware_1.authenticate, async (_req, res) => {
    return (0, errors_1.sendError)(res, "Recurring subscriptions are not implemented for mobile money yet. Use /api/payments/collect for one-time collections.", 501);
});
router.post("/merchant/subscription/cancel", authMiddleware_1.authenticate, async (_req, res) => {
    return (0, errors_1.sendError)(res, "Recurring subscriptions are not implemented for mobile money yet.", 501);
});
router.get("/merchant/subscription/status", authMiddleware_1.authenticate, async (_req, res) => {
    return (0, errors_1.sendSuccess)(res, {
        subscription: null,
        message: "Recurring subscriptions are not implemented for mobile money yet.",
    });
});
// Provider webhook endpoint (no auth needed)
router.post("/webhook/:provider", async (req, res) => {
    try {
        const result = await paymentService.handleProviderCallback(req.params.provider, req.body);
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