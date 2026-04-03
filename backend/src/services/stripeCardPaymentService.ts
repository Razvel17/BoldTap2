// Stripe Card Payment Service - Handle credit/debit card payments (Visa, Mastercard, etc.)
import Stripe from "stripe";
import { AppDataSource } from "../config/database";
import { CustomerPurchase } from "../entities/CustomerPurchase";
import { MerchantSubscription } from "../entities/MerchantSubscription";
import { User } from "../entities/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

const purchaseRepo = () => AppDataSource.getRepository(CustomerPurchase);
const subscriptionRepo = () => AppDataSource.getRepository(MerchantSubscription);
const userRepo = () => AppDataSource.getRepository(User);

export interface CardPaymentOptions {
  userId: string;
  amount: number; // Amount in cents
  currency?: string;
  description?: string;
  paymentMethodId?: string; // Stripe Payment Method ID (for saved cards)
  token?: string; // Temporary token from Stripe Elements
  productType?: "nfc_card" | "ring" | "subscription" | "other";
  reference?: string;
  receiptEmail?: string;
}

export interface CreatePaymentIntentOptions {
  userId: string;
  amount: number;
  currency?: string;
  description?: string;
}

/**
 * Get or create Stripe Customer ID for user
 */
export async function getOrCreateStripeCustomer(userId: string) {
  try {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user already has a Stripe customer ID
    const metadata = user.metadata || {};
    if (metadata.stripeCustomerId) {
      return metadata.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
      metadata: {
        userId,
      },
    });

    // Store Stripe customer ID
    if (!user.metadata) user.metadata = {};
    user.metadata.stripeCustomerId = customer.id;
    await userRepo().save(user);

    return customer.id;
  } catch (error) {
    throw new Error(`Failed to get/create Stripe customer: ${(error as Error).message}`);
  }
}

/**
 * Create a Payment Intent for card payment
 */
export async function createPaymentIntent(options: CreatePaymentIntentOptions) {
  try {
    const stripeCustomerId = await getOrCreateStripeCustomer(options.userId);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: options.amount,
      currency: options.currency || "usd",
      customer: stripeCustomerId,
      description: options.description,
      metadata: {
        userId: options.userId,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  } catch (error) {
    throw new Error(`Failed to create payment intent: ${(error as Error).message}`);
  }
}

/**
 * Process one-time card payment
 */
export async function processCardPayment(options: CardPaymentOptions) {
  try {
    if (!options.userId || !options.amount || options.amount <= 0) {
      return {
        success: false,
        error: "Missing or invalid required fields (userId, amount)",
      };
    }

    const stripeCustomerId = await getOrCreateStripeCustomer(options.userId);
    const reference = options.reference || `purchase_${Date.now()}`;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: options.amount,
      currency: options.currency?.toLowerCase() || "usd",
      customer: stripeCustomerId,
      description: options.description || `Payment for ${options.productType || "product"}`,
      metadata: {
        userId: options.userId,
        reference,
        productType: options.productType,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Save purchase record
    const purchase = purchaseRepo().create({
      customerId: options.userId,
      provider: "stripe" as any, // Add to PaymentProvider type if needed
      phoneNumber: null,
      providerTransactionId: paymentIntent.id,
      providerReference: reference,
      productType: options.productType || "other",
      amount: options.amount / 100, // Convert from cents
      currency: options.currency?.toUpperCase() || "USD",
      status: "pending",
      metadata: {
        description: options.description,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      },
    });

    await purchaseRepo().save(purchase);

    return {
      success: true,
      paymentId: purchase.id,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: "requires_payment_method",
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Confirm payment using saved card or new card
 */
export async function confirmCardPayment(paymentIntentId: string, paymentMethodId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    const purchase = await purchaseRepo().findOne({
      where: { providerTransactionId: paymentIntentId },
    });

    if (purchase) {
      purchase.status = paymentIntent.status === "succeeded" ? "succeeded" : "pending";
      purchase.metadata = purchase.metadata || {};
      purchase.metadata.stripeStatus = paymentIntent.status;
      await purchaseRepo().save(purchase);
    }

    return {
      success: paymentIntent.status === "succeeded",
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    throw new Error(`Failed to confirm payment: ${(error as Error).message}`);
  }
}

/**
 * Save a card as payment method for future use
 */
export async function savePaymentMethod(userId: string, paymentMethodId: string) {
  try {
    const stripeCustomerId = await getOrCreateStripeCustomer(userId);

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return {
      success: true,
      paymentMethodId,
      message: "Card saved successfully",
    };
  } catch (error) {
    throw new Error(`Failed to save payment method: ${(error as Error).message}`);
  }
}

/**
 * List saved payment methods for user
 */
export async function getSavedPaymentMethods(userId: string) {
  try {
    const stripeCustomerId = await getOrCreateStripeCustomer(userId);

    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card",
    });

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand || "unknown",
      last4: pm.card?.last4,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      isDefault: pm.id === pm.billing_details?.address, // Simplified check
    }));
  } catch (error) {
    throw new Error(`Failed to retrieve payment methods: ${(error as Error).message}`);
  }
}

/**
 * Delete a saved payment method
 */
export async function deletePaymentMethod(paymentMethodId: string) {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete payment method: ${(error as Error).message}`);
  }
}

/**
 * Create subscription with card payment
 */
export async function createCardSubscription(
  userId: string,
  planName: "starter" | "pro" | "enterprise",
  paymentMethodId: string,
) {
  try {
    const stripeCustomerId = await getOrCreateStripeCustomer(userId);

    // Get price ID from environment
    const priceIdMap = {
      starter: process.env.STRIPE_PRICE_STARTER,
      pro: process.env.STRIPE_PRICE_PRO,
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
    };

    const priceId = priceIdMap[planName];
    if (!priceId) {
      throw new Error(`Price ID not configured for plan: ${planName}`);
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      automatic_tax: {
        enabled: true,
      },
    });

    // Save subscription record 
    await subscriptionRepo().save({
      merchantId: userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      planName,
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const purchase = await purchaseRepo().findOne({
      where: { providerTransactionId: paymentIntentId },
    });

    return {
      paymentIntentId,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      purchaseId: purchase?.id,
      purchaseStatus: purchase?.status,
    };
  } catch (error) {
    throw new Error(`Failed to get payment status: ${(error as Error).message}`);
  }
}

/**
 * Handle failed payment (retry logic)
 */
export async function retryFailedPayment(paymentIntentId: string, paymentMethodId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "requires_payment_method") {
      return {
        success: false,
        error: "Payment is not in requires_payment_method status",
      };
    }

    return confirmCardPayment(paymentIntentId, paymentMethodId);
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}
