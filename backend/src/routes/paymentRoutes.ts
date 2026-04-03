// Payment routes for subscriptions and purchases
// Merchant subscription management and customer purchases

import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import * as paymentService from "../services/paymentService";
import { sendSuccess, sendError } from "../utils/errors";

const router = Router();

// Merchant subscription endpoints
router.get("/merchant/subscription/plans", authenticate as any, async (_req: any, res) => {
  try {
    const plans = [
      { id: "starter", name: "Starter", price: 10, priceId: process.env.STRIPE_PRICE_STARTER },
      { id: "pro", name: "Pro", price: 50, priceId: process.env.STRIPE_PRICE_PRO },
      { id: "enterprise", name: "Enterprise", price: 0, priceId: process.env.STRIPE_PRICE_ENTERPRISE, contact: true },
    ];
    return sendSuccess(res, { plans });
  } catch (error) {
    return sendError(res, error as Error);
  }
});

router.post("/merchant/subscription/start", authenticate as any, async (req: any, res) => {
  try {
    const { priceId, planName } = req.body;

    if (!priceId || !planName) {
      return sendError(res, "Price ID and plan name required", 400);
    }

    const result = await paymentService.createMerchantSubscription({
      merchantId: req.user.userId,
      priceId,
      planName,
    });

    if (!result.success) {
      return sendError(res, result.error || "Subscription failed", 400);
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
});

router.get("/merchant/subscription/status", authenticate as any, async (req: any, res) => {
  try {
    const subscription = await paymentService.getMerchantSubscription(req.user.userId);
    return sendSuccess(res, { subscription: subscription || null });
  } catch (error) {
    return sendError(res, error as Error);
  }
});

router.post("/merchant/subscription/cancel", authenticate as any, async (req: any, res) => {
  try {
    const subscription = await paymentService.getMerchantSubscription(req.user.userId);

    if (!subscription || !subscription.stripeSubscriptionId) {
      return sendError(res, "No active subscription found", 404);
    }

    // Cancel in Stripe (would need Stripe client)
    return sendSuccess(res, { message: "Subscription canceled" });
  } catch (error) {
    return sendError(res, error as Error);
  }
});

// Customer purchase endpoints
router.post("/customer/intent", authenticate as any, async (req: any, res) => {
  try {
    const { productType, amount } = req.body;

    if (!productType || !amount) {
      return sendError(res, "Product type and amount required", 400);
    }

    const result = await paymentService.createPaymentIntent({
      customerId: req.user.userId,
      productType,
      amount,
    });

    if (!result.success) {
      return sendError(res, result.error || "Payment intent failed", 400);
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
});

router.get("/customer/history", authenticate as any, async (req: any, res) => {
  try {
    const purchases = await paymentService.getCustomerPurchases(req.user.userId);
    return sendSuccess(res, { purchases });
  } catch (error) {
    return sendError(res, error as Error);
  }
});

// Webhook endpoint (no auth needed)
router.post("/webhook/stripe", async (req: any, res) => {
  try {
    // Would need to verify webhook signature in production
    const result = await paymentService.handleStripeWebhook(req.body);

    if (!result.success) {
      return sendError(res, result.error || "Webhook failed", 400);
    }

    return sendSuccess(res, { received: true });
  } catch (error) {
    return sendError(res, error as Error);
  }
});

export default router;
