// Payment Controller - Handle card payments and payment intents
import * as stripeCardService from "../services/stripeCardPaymentService";
import { sendSuccess, sendError } from "../utils/errors";

/**
 * GET /api/payment/card/intent
 * Create a new payment intent for card payment
 */
export async function createPaymentIntent(req: any, res: any) {
  try {
    const { amount, currency, description } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      return sendError(res, "Amount must be greater than 0", 400);
    }

    const result = await stripeCardService.createPaymentIntent({
      userId,
      amount, // Expected in cents
      currency,
      description,
    });

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

/**
 * POST /api/payment/card/process
 * Process a card payment
 */
export async function processCardPayment(req: any, res: any) {
  try {
    const { amount, currency, description, productType, reference, paymentMethodId } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      return sendError(res, "Amount must be greater than 0", 400);
    }

    const result = await stripeCardService.processCardPayment({
      userId,
      amount,
      currency,
      description,
      productType,
      reference,
      paymentMethodId,
    });

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

/**
 * POST /api/payment/card/confirm
 * Confirm card payment with payment intent and method ID
 */
export async function confirmCardPayment(req: any, res: any) {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId || !paymentMethodId) {
      return sendError(res, "paymentIntentId and paymentMethodId are required", 400);
    }

    const result = await stripeCardService.confirmCardPayment(paymentIntentId, paymentMethodId);

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

/**
 * POST /api/payment/card/save
 * Save a card for future use
 */
export async function savePaymentMethod(req: any, res: any) {
  try {
    const { paymentMethodId } = req.body;
    const userId = req.user.userId;

    if (!paymentMethodId) {
      return sendError(res, "paymentMethodId is required", 400);
    }

    const result = await stripeCardService.savePaymentMethod(userId, paymentMethodId);

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

/**
 * GET /api/payment/card/methods
 * Get saved payment methods for user
 */
export async function getSavedPaymentMethods(req: any, res: any) {
  try {
    const userId = req.user.userId;

    const methods = await stripeCardService.getSavedPaymentMethods(userId);

    return sendSuccess(res, { methods });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

/**
 * DELETE /api/payment/card/methods/:paymentMethodId
 * Delete a saved payment method
 */
export async function deletePaymentMethod(req: any, res: any) {
  try {
    const { paymentMethodId } = req.params;

    if (!paymentMethodId) {
      return sendError(res, "paymentMethodId is required", 400);
    }

    const result = await stripeCardService.deletePaymentMethod(paymentMethodId);

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

/**
 * POST /api/payment/card/subscribe
 * Create subscription with card payment
 */
export async function createCardSubscription(req: any, res: any) {
  try {
    const { planName, paymentMethodId } = req.body;
    const userId = req.user.userId;

    if (!planName || !paymentMethodId) {
      return sendError(res, "planName and paymentMethodId are required", 400);
    }

    const result = await stripeCardService.createCardSubscription(
      userId,
      planName,
      paymentMethodId,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

/**
 * GET /api/payment/:paymentIntentId/status
 * Get payment status
 */
export async function getPaymentStatus(req: any, res: any) {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return sendError(res, "paymentIntentId is required", 400);
    }

    const result = await stripeCardService.getPaymentStatus(paymentIntentId);

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

/**
 * POST /api/payment/card/retry
 * Retry a failed payment
 */
export async function retryFailedPayment(req: any, res: any) {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId || !paymentMethodId) {
      return sendError(res, "paymentIntentId and paymentMethodId are required", 400);
    }

    const result = await stripeCardService.retryFailedPayment(paymentIntentId, paymentMethodId);

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
}
