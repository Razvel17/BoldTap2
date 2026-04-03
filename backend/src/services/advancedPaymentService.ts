// Advanced Payment Features Service
// Handles subscription plans, invoicing, analytics, and payment history

import { AppDataSource } from "../config/database";
import { MerchantSubscription } from "../entities/MerchantSubscription";
import { CustomerPurchase } from "../entities/CustomerPurchase";

const subRepo = () => AppDataSource.getRepository(MerchantSubscription);
const purchaseRepo = () => AppDataSource.getRepository(CustomerPurchase);

// Available subscription plans with features
export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: ["1 Business", "Basic NFC Cards", "Up to 100 Customers"],
    maxBusinesses: 1,
    limits: { nfcCards: 10, customers: 100 },
  },
  starter: {
    name: "Starter",
    price: 10,
    priceId: process.env.STRIPE_PRICE_STARTER,
    features: ["3 Businesses", "Advanced Analytics", "Up to 1000 Customers", "Priority Support"],
    maxBusinesses: 3,
    limits: { nfcCards: 100, customers: 1000 },
  },
  pro: {
    name: "Pro",
    price: 50,
    priceId: process.env.STRIPE_PRICE_PRO,
    features: ["10 Businesses", "Advanced Analytics", "Unlimited Customers", "API Access", "Priority Support", "Custom Branding"],
    maxBusinesses: 10,
    limits: { nfcCards: 1000, customers: -1 },
  },
  enterprise: {
    name: "Enterprise",
    price: -1, // Custom pricing
    features: ["Unlimited Businesses", "White-label Solution", "Dedicated Support", "Custom Integration", "SLA Guarantee"],
    maxBusinesses: -1,
    limits: { nfcCards: -1, customers: -1 },
    contact: true,
  },
} as const;

/**
 * Get user subscription details
 */
export async function getSubscriptionDetails(merchantId: string) {
  const subscription = await subRepo().findOne({
    where: { merchantId },
    order: { createdAt: "DESC" },
  });

  if (!subscription) {
    return {
      plan: "free",
      status: "active",
      features: SUBSCRIPTION_PLANS.free.features,
      limits: SUBSCRIPTION_PLANS.free.limits,
    };
  }

  const planInfo = SUBSCRIPTION_PLANS[subscription.planName as keyof typeof SUBSCRIPTION_PLANS];
  return {
    ...subscription,
    features: planInfo.features,
    limits: planInfo.limits,
    daysUntilNextBilling: subscription.currentPeriodEnd ? Math.ceil(
      (subscription.currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    ) : 0,
  };
}

/**
 * Check if user can perform action based on subscription limits
 */
export async function checkSubscriptionLimit(
  merchantId: string,
  action: "createBusiness" | "createNfcCard" | "addCustomer",
): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await subRepo().findOne({
    where: { merchantId },
    order: { createdAt: "DESC" },
  });

  if (!subscription) {
    // Free tier limits
    return { allowed: true };
  }

  const planInfo = SUBSCRIPTION_PLANS[subscription.planName as keyof typeof SUBSCRIPTION_PLANS];
  const limits = planInfo.limits;
  const maxBusinesses = "maxBusinesses" in planInfo ? (planInfo.maxBusinesses as number) : -1;

  switch (action) {
    case "createBusiness":
      if (maxBusinesses !== -1) {
        // Count existing businesses
        // Would need to query loyalty businesses
        return { allowed: true }; // Simplified for now
      }
      return { allowed: true };

    case "createNfcCard":
      if (limits.nfcCards === -1) return { allowed: true }; // Unlimited
      return { allowed: true }; // Simplified

    case "addCustomer":
      if (limits.customers === -1) return { allowed: true }; // Unlimited
      return { allowed: true }; // Simplified
  }

  return { allowed: true };
}

/**
 * Get payment analytics for merchant
 */
export async function getPaymentAnalytics(merchantId: string, period: "month" | "year" = "month") {
  const subscription = await subRepo().findOne({ where: { merchantId } });

  if (!subscription) {
    return {
      totalRevenue: 0,
      transactions: 0,
      averageTransaction: 0,
      period,
    };
  }

  const now = new Date();
  const startDate = new Date();
  if (period === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  // This would normally query actual transaction data
  return {
    totalRevenue: 0,
    transactions: 0,
    averageTransaction: 0,
    period,
    startDate,
    endDate: now,
  };
}

/**
 * Get purchase analytics for customer
 */
export async function getCustomerPurchaseAnalytics(customerId: string) {
  const purchases = await purchaseRepo().find({
    where: { customerId, status: "succeeded" },
  });

  const totalSpent = purchases.reduce((sum, p) => sum + Number(p.amount), 0);
  const avgPurchase = purchases.length > 0 ? totalSpent / purchases.length : 0;

  return {
    totalPurchases: purchases.length,
    totalSpent: totalSpent.toFixed(2),
    averagePurchase: avgPurchase.toFixed(2),
    lastPurchase: purchases.length > 0 ? purchases[0].createdAt : null,
    favoriteProduct: purchases.length > 0
      ? purchases.reduce((a, b) => (a.productType === b.productType ? a : b)).productType
      : null,
  };
}

/**
 * Generate invoice for subscription
 */
export async function generateInvoice(subscriptionId: string) {
  const subscription = await subRepo().findOne({
    where: { stripeSubscriptionId: subscriptionId },
    relations: ["merchant"],
  });

  if (!subscription) {
    return null;
  }

  const planInfo = SUBSCRIPTION_PLANS[subscription.planName as keyof typeof SUBSCRIPTION_PLANS];

  return {
    invoiceNumber: `INV-${subscription.id.split("-")[0].toUpperCase()}`,
    date: new Date(),
    dueDate: subscription.currentPeriodEnd,
    merchant: subscription.merchant,
    description: `${planInfo.name} - Monthly Subscription`,
    amount: planInfo.price,
    status: subscription.status,
    periodStart: subscription.currentPeriodStart,
    periodEnd: subscription.currentPeriodEnd,
  };
}

/**
 * Get billing history
 */
export async function getBillingHistory(merchantId: string, limit = 12) {
  const subscriptions = await subRepo().find({
    where: { merchantId },
    order: { updatedAt: "DESC" },
    take: limit,
  });

  return subscriptions.map((sub) => {
    const planInfo = SUBSCRIPTION_PLANS[sub.planName as keyof typeof SUBSCRIPTION_PLANS];
    return {
      id: sub.id,
      plan: sub.planName,
      amount: planInfo.price,
      status: sub.status,
      periodStart: sub.currentPeriodStart,
      periodEnd: sub.currentPeriodEnd,
      invoice: `INV-${sub.id.split("-")[0].toUpperCase()}`,
    };
  });
}

/**
 * Check if subscription is active and valid
 */
export async function isSubscriptionActive(merchantId: string): Promise<boolean> {
  const subscription = await subRepo().findOne({
    where: { merchantId },
    order: { createdAt: "DESC" },
  });

  if (!subscription) return false;

  const activeStatuses = ["active", "trialing"];
  const isExpired = subscription.currentPeriodEnd ? new Date() > subscription.currentPeriodEnd : true;

  return activeStatuses.includes(subscription.status) && !isExpired;
}
