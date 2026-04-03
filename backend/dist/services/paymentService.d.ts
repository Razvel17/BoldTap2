import { MerchantSubscription } from "../entities/MerchantSubscription";
import { CustomerPurchase } from "../entities/CustomerPurchase";
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
export declare function createMerchantSubscription(options: CreateSubscriptionOptions): Promise<{
    success: boolean;
    subscriptionId?: string;
    error?: string;
}>;
/**
 * Create payment intent for one-time purchase
 */
export declare function createPaymentIntent(options: CreatePurchaseIntentOptions): Promise<{
    success: boolean;
    clientSecret?: string;
    purchaseId?: string;
    error?: string;
}>;
/**
 * Handle Stripe webhook events
 */
export declare function handleStripeWebhook(event: any): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Get merchant subscription
 */
export declare function getMerchantSubscription(merchantId: string): Promise<MerchantSubscription | null>;
/**
 * Get customer purchases
 */
export declare function getCustomerPurchases(customerId: string): Promise<CustomerPurchase[]>;
export {};
//# sourceMappingURL=paymentService.d.ts.map