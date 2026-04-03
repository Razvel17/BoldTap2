import { User } from "./User";
export type PurchaseStatus = "pending" | "succeeded" | "failed" | "cancelled";
export type ProductType = "nfc_card" | "ring" | "other";
export type PaymentProvider = "mpesa" | "yas" | "airtel_money";
export declare class CustomerPurchase {
    id: string;
    customerId: string;
    provider?: PaymentProvider;
    providerTransactionId?: string;
    providerReference?: string;
    phoneNumber?: string;
    productType: ProductType;
    amount: number;
    currency: string;
    status: PurchaseStatus;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
    customer: User;
}
//# sourceMappingURL=CustomerPurchase.d.ts.map