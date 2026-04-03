// Stripe Webhook Handler - Process Stripe events (payments, subscriptions, etc.)
import Stripe from "stripe";
import { AppDataSource } from "../config/database";
import { CustomerPurchase } from "../entities/CustomerPurchase";
import { MerchantSubscription } from "../entities/MerchantSubscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

const purchaseRepo = () => AppDataSource.getRepository(CustomerPurchase);
const subscriptionRepo = () => AppDataSource.getRepository(MerchantSubscription);

export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        return handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);

      case "payment_intent.payment_failed":
        return handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);

      case "payment_intent.canceled":
        return handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);

      case "customer.subscription.created":
        return handleSubscriptionCreated(event.data.object as Stripe.Subscription);

      case "customer.subscription.updated":
        return handleSubscriptionUpdated(event.data.object as Stripe.Subscription);

      case "customer.subscription.deleted":
        return handleSubscriptionDeleted(event.data.object as Stripe.Subscription);

      case "invoice.paid":
        return handleInvoicePaid(event.data.object as Stripe.Invoice);

      case "invoice.payment_failed":
        return handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { success: true, handled: false };
    }
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find and update the purchase record
    const purchase = await purchaseRepo().findOne({
      where: { providerTransactionId: paymentIntent.id },
    });

    if (purchase) {
      purchase.status = "succeeded";
      purchase.metadata = purchase.metadata || {};
      purchase.metadata.stripeStatus = "succeeded";
      purchase.metadata.successTimestamp = new Date();
      await purchaseRepo().save(purchase);

      console.log(`Payment succeeded: ${paymentIntent.id}`);
    }

    return { success: true, type: "payment_succeeded" };
  } catch (error) {
    console.error("Error in handlePaymentIntentSucceeded:", error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const purchase = await purchaseRepo().findOne({
      where: { providerTransactionId: paymentIntent.id },
    });

    if (purchase) {
      purchase.status = "failed";
      purchase.metadata = purchase.metadata || {};
      purchase.metadata.stripeStatus = "requires_payment_method";
      purchase.metadata.failureTimestamp = new Date();
      purchase.metadata.lastPaymentError = paymentIntent.last_payment_error?.message;
      await purchaseRepo().save(purchase);

      console.log(`Payment failed: ${paymentIntent.id}`);
    }

    return { success: true, type: "payment_failed" };
  } catch (error) {
    console.error("Error in handlePaymentIntentFailed:", error);
    throw error;
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const purchase = await purchaseRepo().findOne({
      where: { providerTransactionId: paymentIntent.id },
    });

    if (purchase) {
      purchase.status = "cancelled";
      purchase.metadata = purchase.metadata || {};
      purchase.metadata.canceledTimestamp = new Date();
      await purchaseRepo().save(purchase);

      console.log(`Payment canceled: ${paymentIntent.id}`);
    }

    return { success: true, type: "payment_canceled" };
  } catch (error) {
    console.error("Error in handlePaymentIntentCanceled:", error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const userId = (subscription.metadata?.userId || subscription.customer) as string;

    const merchantSub = subscriptionRepo().create({
      merchantId: userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price?.id,
      planName: (subscription.metadata?.planName || "starter") as any,
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    await subscriptionRepo().save(merchantSub);
    console.log(`Subscription created: ${subscription.id}`);

    return { success: true, type: "subscription_created" };
  } catch (error) {
    console.error("Error in handleSubscriptionCreated:", error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const merchantSub = await subscriptionRepo().findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (merchantSub) {
      merchantSub.status = subscription.status as any;
      merchantSub.currentPeriodStart = new Date(subscription.current_period_start * 1000);
      merchantSub.currentPeriodEnd = new Date(subscription.current_period_end * 1000);

      if (subscription.canceled_at) {
        merchantSub.canceledAt = new Date(subscription.canceled_at * 1000);
      }

      await subscriptionRepo().save(merchantSub);
      console.log(`Subscription updated: ${subscription.id}`);
    }

    return { success: true, type: "subscription_updated" };
  } catch (error) {
    console.error("Error in handleSubscriptionUpdated:", error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const merchantSub = await subscriptionRepo().findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (merchantSub) {
      merchantSub.status = "canceled";
      merchantSub.canceledAt = new Date();
      await subscriptionRepo().save(merchantSub);

      console.log(`Subscription deleted: ${subscription.id}`);
    }

    return { success: true, type: "subscription_deleted" };
  } catch (error) {
    console.error("Error in handleSubscriptionDeleted:", error);
    throw error;
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice paid: ${invoice.id}`);
    // Additional logic for paid invoices can be added here

    return { success: true, type: "invoice_paid" };
  } catch (error) {
    console.error("Error in handleInvoicePaid:", error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice payment failed: ${invoice.id}`);
    // Additional logic for failed invoices (e.g., send retry email)

    return { success: true, type: "invoice_payment_failed" };
  } catch (error) {
    console.error("Error in handleInvoicePaymentFailed:", error);
    throw error;
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhookSignature(
  body: string | Buffer,
  signature: string,
): Stripe.Event | null {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return null;
  }
}
