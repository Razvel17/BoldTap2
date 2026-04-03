"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMerchantSubscription = createMerchantSubscription;
exports.createPaymentIntent = createPaymentIntent;
exports.handleStripeWebhook = handleStripeWebhook;
exports.getMerchantSubscription = getMerchantSubscription;
exports.getCustomerPurchases = getCustomerPurchases;
// Payment Service - Stripe integration for subscriptions and purchases
const stripe_1 = __importDefault(require("stripe"));
const database_1 = require("../config/database");
const MerchantSubscription_1 = require("../entities/MerchantSubscription");
const CustomerPurchase_1 = require("../entities/CustomerPurchase");
const env_1 = require("../config/env");
// Initialize Stripe
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stripeInstance = null;
if (env_1.STRIPE_SECRET_KEY) {
    stripeInstance = new stripe_1.default(env_1.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
    });
}
const subRepo = () => database_1.AppDataSource.getRepository(MerchantSubscription_1.MerchantSubscription);
const purchaseRepo = () => database_1.AppDataSource.getRepository(CustomerPurchase_1.CustomerPurchase);
/**
 * Create merchant subscription
 */
async function createMerchantSubscription(options) {
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
    }
    catch (error) {
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
async function createPaymentIntent(options) {
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
    }
    catch (error) {
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
async function handleStripeWebhook(event) {
    try {
        switch (event.type) {
            case "customer.subscription.updated": {
                const subscription = event.data.object;
                await updateMerchantSubscription(subscription.id, subscription.status, subscription);
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                await cancelMerchantSubscription(subscription.id);
                break;
            }
            case "payment_intent.succeeded": {
                const intent = event.data.object;
                await confirmPurchase(intent.id, "succeeded");
                break;
            }
            case "payment_intent.payment_failed": {
                const intent = event.data.object;
                await confirmPurchase(intent.id, "failed");
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        return { success: true };
    }
    catch (error) {
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
async function updateMerchantSubscription(stripeSubId, status, subscription) {
    await subRepo().update({ stripeSubscriptionId: stripeSubId }, {
        status: status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
}
/**
 * Cancel merchant subscription
 */
async function cancelMerchantSubscription(stripeSubId) {
    await subRepo().update({ stripeSubscriptionId: stripeSubId }, {
        status: "canceled",
        canceledAt: new Date(),
    });
}
/**
 * Confirm purchase status
 */
async function confirmPurchase(stripePaymentIntentId, status) {
    await purchaseRepo().update({ stripePaymentIntentId }, {
        status: status,
    });
}
/**
 * Get merchant subscription
 */
async function getMerchantSubscription(merchantId) {
    return await subRepo().findOne({
        where: { merchantId },
        order: { createdAt: "DESC" },
    });
}
/**
 * Get customer purchases
 */
async function getCustomerPurchases(customerId) {
    return await purchaseRepo().find({
        where: { customerId },
        order: { createdAt: "DESC" },
    });
}
//# sourceMappingURL=paymentService.js.map