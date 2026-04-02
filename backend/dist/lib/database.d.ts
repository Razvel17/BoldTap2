import type { User, NfcBusinessProfile, LoyaltyCard, LoyaltyBusiness } from "../types/index";
export interface IUserRepository {
    create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, data: Partial<User>): Promise<User | null>;
    delete(id: string): Promise<boolean>;
    list(limit?: number, offset?: number): Promise<User[]>;
    count(): Promise<number>;
}
export interface INfcBusinessRepository {
    create(profile: Omit<NfcBusinessProfile, "id" | "createdAt" | "updatedAt">): Promise<NfcBusinessProfile>;
    findById(id: string): Promise<NfcBusinessProfile | null>;
    findBySlug(slug: string): Promise<NfcBusinessProfile | null>;
    findByUserId(userId: string): Promise<NfcBusinessProfile | null>;
    update(id: string, data: Partial<NfcBusinessProfile>): Promise<NfcBusinessProfile | null>;
    delete(id: string): Promise<boolean>;
    slugExists(slug: string): Promise<boolean>;
}
export interface ILoyaltyBusinessRepository {
    create(business: Omit<LoyaltyBusiness, "id" | "createdAt" | "updatedAt">): Promise<LoyaltyBusiness>;
    findById(id: string): Promise<LoyaltyBusiness | null>;
    findBySlug(slug: string): Promise<LoyaltyBusiness | null>;
    findByUserId(userId: string): Promise<LoyaltyBusiness[]>;
    update(id: string, data: Partial<LoyaltyBusiness>): Promise<LoyaltyBusiness | null>;
    delete(id: string): Promise<boolean>;
    slugExists(slug: string): Promise<boolean>;
}
export interface ILoyaltyCardRepository {
    create(card: Omit<LoyaltyCard, "id" | "createdAt" | "updatedAt">): Promise<LoyaltyCard>;
    findById(id: string): Promise<LoyaltyCard | null>;
    findByBusinessAndUser(businessId: string, userId: string): Promise<LoyaltyCard | null>;
    findByBusinessId(businessId: string): Promise<LoyaltyCard[]>;
    findByUserId(userId: string): Promise<LoyaltyCard[]>;
    update(id: string, data: Partial<LoyaltyCard>): Promise<LoyaltyCard | null>;
    addPoints(id: string, points: number): Promise<LoyaltyCard | null>;
    delete(id: string): Promise<boolean>;
}
export interface IDatabase {
    users: IUserRepository;
    nfcBusinessProfiles: INfcBusinessRepository;
    loyaltyBusinesses: ILoyaltyBusinessRepository;
    loyaltyCards: ILoyaltyCardRepository;
}
export declare class InMemoryDatabase implements IDatabase {
    users: IUserRepository;
    nfcBusinessProfiles: INfcBusinessRepository;
    loyaltyBusinesses: ILoyaltyBusinessRepository;
    loyaltyCards: ILoyaltyCardRepository;
    constructor();
}
export declare function getDatabase(): IDatabase;
export declare function setDatabase(db: IDatabase): void;
//# sourceMappingURL=database.d.ts.map