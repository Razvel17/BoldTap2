export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
}
export interface NfcBusinessProfile {
    id: string;
    userId: string;
    slug: string;
    name: string;
    title: string;
    phone?: string;
    email?: string;
    website?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface LoyaltyCard {
    id: string;
    businessId: string;
    userId: string;
    points: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface LoyaltyBusiness {
    id: string;
    userId: string;
    slug: string;
    name: string;
    description?: string;
    maxPoints: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthToken {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}
//# sourceMappingURL=index.d.ts.map