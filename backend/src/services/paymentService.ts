// Payment Service - Stripe integration for subscriptions and purchases
import Stripe from "stripe";
import { AppDataSource } from "../config/database";
import { MerchantSubscription } from "../entities/MerchantSubscription";
import { CustomerPurchase } from "../entities/CustomerPurchase";
import { STRIPE_SECRET_KEY } from "../config/env";

// Initialize Stripe
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stripeInstance: any = null;
if (STRIPE_SECRET_KEY) {
  stripeInstance = new (Stripe as any)(STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

const subRepo = () => AppDataSource.getRepository(MerchantSubscription);
const purchaseRepo = () => AppDataSource.getRepository(CustomerPurchase);

interface CreateSubscriptionOptions {
  merchantId: string;
  priceId: string;
  planName: "starter" | "pro" | "enterprise";
}

interface CreatePurchaseIntentOptions {
  customerId: string;
  productType: "nfc_card" | "ring" | "other";
  amount: number;
  currency?: string;
}

/**
 * Create merchant subscription
 */
export async function createMerchantSubscription(
  options: CreateSubscriptionOptions,
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    const subscription = await stripeInstance.subscriptions.create({
      customer: options.merchantId, // Assumes merchantId is Stripe customer ID
      items: [{ price: options.priceId }],
      metadata: { planName: options.planName },
    });

    // Save to database
    const dbSubscription = subRepo().create({
      merchantId: options.merchantId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: options.priceId,
      planName: options.planName,
      status: "trialing",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    await subRepo().save(dbSubscription);

    return {
      success: true,
      subscriptionId: subscription.id,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Subscription creation failed",
    };
  }
}

/**
 * Create payment intent for one-time purchase
 */
export async function createPaymentIntent(
  options: CreatePurchaseIntentOptions,
): Promise<{ success: boolean; clientSecret?: string; purchaseId?: string; error?: string }> {
  try {
    const intent = await stripeInstance.paymentIntents.create({
      amount: Math.round(options.amount * 100), // Convert to cents
      currency: options.currency || "usd",
      customer: options.customerId,
      metadata: { productType: options.productType },
    });

    // Save purchase record
    const purchase = purchaseRepo().create({
      customerId: options.customerId,
      stripePaymentIntentId: intent.id,
      productType: options.productType,
      amount: options.amount,
      currency: options.currency || "USD",
      status: "pending",
      metadata: { amount: options.amount },
    });

    await purchaseRepo().save(purchase);

    return {
      success: true,
      clientSecret: intent.client_secret || "",
      purchaseId: purchase.id,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment intent creation failed",
    };
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(
  event: any, // Type would be Stripe.Event but causes issues
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (event.type) {
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        await updateMerchantSubscription(subscription.id, subscription.status, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        await cancelMerchantSubscription(subscription.id);
        break;
      }

      case "payment_intent.succeeded": {
        const intent = event.data.object as any;
        await confirmPurchase(intent.id, "succeeded");
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as any;
        await confirmPurchase(intent.id, "failed");
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling webhook:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Webhook handling failed",
    };
  }
}

/**
 * Update merchant subscription status
 */
async function updateMerchantSubscription(
  stripeSubId: string,
  status: string,
  subscription: any,
): Promise<void> {
  await subRepo().update(
    { stripeSubscriptionId: stripeSubId },
    {
      status: status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  );
}

/**
 * Cancel merchant subscription
 */
async function cancelMerchantSubscription(stripeSubId: string): Promise<void> {
  await subRepo().update(
    { stripeSubscriptionId: stripeSubId },
    {
      status: "canceled",
      canceledAt: new Date(),
    },
  );
}

/**
 * Confirm purchase status
 */
async function confirmPurchase(stripePaymentIntentId: string, status: "succeeded" | "failed"): Promise<void> {
  await purchaseRepo().update(
    { stripePaymentIntentId },
    {
      status: status as any,
    },
  );
}

/**
 * Get merchant subscription
 */
export async function getMerchantSubscription(merchantId: string) {
  return await subRepo().findOne({
    where: { merchantId },
    order: { createdAt: "DESC" },
  });
}

/**
 * Get customer purchases
 */
export async function getCustomerPurchases(customerId: string) {
  return await purchaseRepo().find({
    where: { customerId },
    order: { createdAt: "DESC" },
  });
}
