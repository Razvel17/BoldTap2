import type { LoyaltyCard, LoyaltyBusiness } from "../types/index";
interface CreateLoyaltyBusinessInput {
    slug: string;
    name: string;
    description?: string;
    maxPoints?: number;
}
interface CreateLoyaltyCardInput {
    businessId: string;
    userId: string;
}
export declare function createLoyaltyBusiness(userId: string, input: CreateLoyaltyBusinessInput): Promise<{
    success: boolean;
    data?: LoyaltyBusiness;
    error?: string;
}>;
export declare function getLoyaltyBusinessBySlug(slug: string): Promise<LoyaltyBusiness | null>;
export declare function getUserLoyaltyBusinesses(userId: string): Promise<LoyaltyBusiness[]>;
export declare function createLoyaltyCard(input: CreateLoyaltyCardInput): Promise<{
    success: boolean;
    data?: LoyaltyCard;
    error?: string;
}>;
export declare function getLoyaltyCard(cardId: string): Promise<LoyaltyCard | null>;
export declare function getUserLoyaltyCards(userId: string): Promise<LoyaltyCard[]>;
export declare function addPointsToCard(cardId: string, points: number): Promise<{
    success: boolean;
    data?: LoyaltyCard;
    error?: string;
}>;
export declare function getBusinessLoyaltyCards(businessId: string): Promise<LoyaltyCard[]>;
export declare function deleteLoyaltyCard(cardId: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function updateLoyaltyBusiness(businessId: string, data: Partial<CreateLoyaltyBusinessInput>): Promise<{
    success: boolean;
    data?: LoyaltyBusiness;
    error?: string;
}>;
export {};
//# sourceMappingURL=loyaltyCardService.d.ts.map