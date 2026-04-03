export declare const SUBSCRIPTION_PLANS: {
    readonly free: {
        readonly name: "Free";
        readonly price: 0;
        readonly features: readonly ["1 Business", "Basic NFC Cards", "Up to 100 Customers"];
        readonly maxBusinesses: 1;
        readonly limits: {
            readonly nfcCards: 10;
            readonly customers: 100;
        };
    };
    readonly starter: {
        readonly name: "Starter";
        readonly price: 10;
        readonly priceId: string | undefined;
        readonly features: readonly ["3 Businesses", "Advanced Analytics", "Up to 1000 Customers", "Priority Support"];
        readonly maxBusinesses: 3;
        readonly limits: {
            readonly nfcCards: 100;
            readonly customers: 1000;
        };
    };
    readonly pro: {
        readonly name: "Pro";
        readonly price: 50;
        readonly priceId: string | undefined;
        readonly features: readonly ["10 Businesses", "Advanced Analytics", "Unlimited Customers", "API Access", "Priority Support", "Custom Branding"];
        readonly maxBusinesses: 10;
        readonly limits: {
            readonly nfcCards: 1000;
            readonly customers: -1;
        };
    };
    readonly enterprise: {
        readonly name: "Enterprise";
        readonly price: -1;
        readonly features: readonly ["Unlimited Businesses", "White-label Solution", "Dedicated Support", "Custom Integration", "SLA Guarantee"];
        readonly maxBusinesses: -1;
        readonly limits: {
            readonly nfcCards: -1;
            readonly customers: -1;
        };
        readonly contact: true;
    };
};
/**
 * Get user subscription details
 */
export declare function getSubscriptionDetails(merchantId: string): Promise<{
    plan: string;
    status: string;
    features: readonly ["1 Business", "Basic NFC Cards", "Up to 100 Customers"];
    limits: {
        readonly nfcCards: 10;
        readonly customers: 100;
    };
} | {
    features: readonly ["1 Business", "Basic NFC Cards", "Up to 100 Customers"] | readonly ["3 Businesses", "Advanced Analytics", "Up to 1000 Customers", "Priority Support"] | readonly ["10 Businesses", "Advanced Analytics", "Unlimited Customers", "API Access", "Priority Support", "Custom Branding"] | readonly ["Unlimited Businesses", "White-label Solution", "Dedicated Support", "Custom Integration", "SLA Guarantee"];
    limits: {
        readonly nfcCards: 10;
        readonly customers: 100;
    } | {
        readonly nfcCards: 100;
        readonly customers: 1000;
    } | {
        readonly nfcCards: 1000;
        readonly customers: -1;
    } | {
        readonly nfcCards: -1;
        readonly customers: -1;
    };
    daysUntilNextBilling: number;
    id: string;
    merchantId: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    planName: import("../entities/MerchantSubscription").SubscriptionPlan;
    status: import("../entities/MerchantSubscription").SubscriptionStatus;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    canceledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    merchant: import("../entities/User").User;
    plan?: undefined;
}>;
/**
 * Check if user can perform action based on subscription limits
 */
export declare function checkSubscriptionLimit(merchantId: string, action: "createBusiness" | "createNfcCard" | "addCustomer"): Promise<{
    allowed: boolean;
    reason?: string;
}>;
/**
 * Get payment analytics for merchant
 */
export declare function getPaymentAnalytics(merchantId: string, period?: "month" | "year"): Promise<{
    totalRevenue: number;
    transactions: number;
    averageTransaction: number;
    period: "year" | "month";
    startDate?: undefined;
    endDate?: undefined;
} | {
    totalRevenue: number;
    transactions: number;
    averageTransaction: number;
    period: "year" | "month";
    startDate: Date;
    endDate: Date;
}>;
/**
 * Get purchase analytics for customer
 */
export declare function getCustomerPurchaseAnalytics(customerId: string): Promise<{
    totalPurchases: number;
    totalSpent: string;
    averagePurchase: string;
    lastPurchase: Date | null;
    favoriteProduct: import("../entities/CustomerPurchase").ProductType | null;
}>;
/**
 * Generate invoice for subscription
 */
export declare function generateInvoice(subscriptionId: string): Promise<{
    invoiceNumber: string;
    date: Date;
    dueDate: Date | undefined;
    merchant: import("../entities/User").User;
    description: string;
    amount: 0 | 10 | -1 | 50;
    status: import("../entities/MerchantSubscription").SubscriptionStatus;
    periodStart: Date | undefined;
    periodEnd: Date | undefined;
} | null>;
/**
 * Get billing history
 */
export declare function getBillingHistory(merchantId: string, limit?: number): Promise<{
    id: string;
    plan: import("../entities/MerchantSubscription").SubscriptionPlan;
    amount: 0 | 10 | -1 | 50;
    status: import("../entities/MerchantSubscription").SubscriptionStatus;
    periodStart: Date | undefined;
    periodEnd: Date | undefined;
    invoice: string;
}[]>;
/**
 * Check if subscription is active and valid
 */
export declare function isSubscriptionActive(merchantId: string): Promise<boolean>;
//# sourceMappingURL=advancedPaymentService.d.ts.map