export type MobileMoneyProviderName = "mpesa" | "yas" | "airtel_money";
interface InitiateCollectionInput {
    phoneNumber: string;
    amount: number;
    reference: string;
    currency: string;
    customerName?: string;
    description?: string;
}
interface ProviderResult {
    providerTransactionId: string;
    status: "pending" | "succeeded" | "failed" | "cancelled";
    raw: unknown;
}
export interface MobileMoneyProvider {
    initiateCollection(input: InitiateCollectionInput): Promise<ProviderResult>;
    getTransactionStatus(providerTransactionId: string): Promise<ProviderResult>;
}
export declare function createProviderClient(provider: MobileMoneyProviderName): MobileMoneyProvider;
export declare function getConfiguredProviderNames(): MobileMoneyProviderName[];
export {};
//# sourceMappingURL=mobileMoneyProviders.d.ts.map