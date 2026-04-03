import { CustomerPurchase } from "../entities/CustomerPurchase";
import { type MobileMoneyProviderName } from "./mobileMoneyProviders";
interface InitiateCollectionOptions {
    customerUserId: string;
    provider: MobileMoneyProviderName;
    phoneNumber: string;
    amount: number;
    currency?: string;
    reference: string;
    customerName?: string;
    description?: string;
    productType?: "nfc_card" | "ring" | "other";
}
export declare function getSupportedProviders(): ({
    id: "mpesa";
    name: string;
    configured: boolean;
} | {
    id: "yas";
    name: string;
    configured: boolean;
} | {
    id: "airtel_money";
    name: string;
    configured: boolean;
})[];
export declare function initiateCollection(options: InitiateCollectionOptions): Promise<{
    success: boolean;
    paymentId?: string;
    providerTransactionId?: string;
    status?: "pending" | "succeeded" | "failed" | "cancelled";
    error?: string;
}>;
export declare function getPaymentStatus(paymentId: string, customerId?: string): Promise<CustomerPurchase | null>;
export declare function getCustomerPurchases(customerId: string): Promise<CustomerPurchase[]>;
export declare function handleProviderCallback(provider: MobileMoneyProviderName, payload: Record<string, unknown>): Promise<{
    success: boolean;
    error?: string;
}>;
export {};
//# sourceMappingURL=paymentService.d.ts.map