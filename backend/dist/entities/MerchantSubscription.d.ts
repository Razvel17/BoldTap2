import { User } from "./User";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "unpaid";
export type SubscriptionPlan = "free" | "starter" | "pro" | "enterprise";
export declare class MerchantSubscription {
    id: string;
    merchantId: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    planName: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    canceledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    merchant: User;
}
//# sourceMappingURL=MerchantSubscription.d.ts.map