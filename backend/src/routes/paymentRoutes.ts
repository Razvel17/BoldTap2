// Payment routes for mobile money collections and purchase history

import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import * as paymentService from "../services/paymentService";
import { sendSuccess, sendError } from "../utils/errors";

const router = Router();

router.get("/providers", authenticate as any, async (_req: any, res) => {
  try {
    return sendSuccess(res, { providers: paymentService.getSupportedProviders() });
  } catch (error) {
    return sendError(res, error as Error);
  }
});

router.post("/collect", authenticate as any, async (req: any, res) => {
  try {
    const {
      provider,
      phoneNumber,
      amount,
      reference,
      currency,
      customerName,
      description,
      productType,
    } = req.body;

    if (!provider || !phoneNumber || !amount || !reference) {
      return sendError(
        res,
        "Provider, phone number, amount, and reference are required",
        400,
      );
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
      return sendError(res, result.error || "Collection request failed", 400);
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
});

router.get("/:paymentId/status", authenticate as any, async (req: any, res) => {
  try {
    const payment = await paymentService.getPaymentStatus(
      req.params.paymentId,
      req.user.userId,
    );

    if (!payment) {
      return sendError(res, "Payment not found", 404);
    }

    return sendSuccess(res, { payment });
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

// Legacy route kept for compatibility with existing frontend code.
router.post("/customer/intent", authenticate as any, async (req: any, res) => {
  try {
    const { provider, productType, amount, phoneNumber, reference } = req.body;

    if (!provider || !phoneNumber || !reference || !amount) {
      return sendError(
        res,
        "Provider, phone number, amount, and reference are required",
        400,
      );
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
      return sendError(res, result.error || "Collection request failed", 400);
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
});

router.get("/merchant/subscription/plans", authenticate as any, async (_req: any, res) => {
  try {
    return sendSuccess(res, {
      plans: [
        { id: "starter", name: "Starter", price: 10000, currency: "TZS" },
        { id: "pro", name: "Pro", price: 50000, currency: "TZS" },
        { id: "enterprise", name: "Enterprise", price: 0, currency: "TZS", contact: true },
      ],
      message: "Use mobile money collection to charge for plans.",
    });
  } catch (error) {
    return sendError(res, error as Error);
  }
});

router.post("/merchant/subscription/start", authenticate as any, async (_req: any, res) => {
  return sendError(
    res,
    "Recurring subscriptions are not implemented for mobile money yet. Use /api/payments/collect for one-time collections.",
    501,
  );
});

router.post("/merchant/subscription/cancel", authenticate as any, async (_req: any, res) => {
  return sendError(
    res,
    "Recurring subscriptions are not implemented for mobile money yet.",
    501,
  );
});

router.get("/merchant/subscription/status", authenticate as any, async (_req: any, res) => {
  return sendSuccess(res, {
    subscription: null,
    message: "Recurring subscriptions are not implemented for mobile money yet.",
  });
});

// Provider webhook endpoint (no auth needed)
router.post("/webhook/:provider", async (req: any, res) => {
  try {
    const result = await paymentService.handleProviderCallback(
      req.params.provider,
      req.body,
    );

    if (!result.success) {
      return sendError(res, result.error || "Webhook failed", 400);
    }

    return sendSuccess(res, { received: true });
  } catch (error) {
    return sendError(res, error as Error);
  }
});

export default router;
