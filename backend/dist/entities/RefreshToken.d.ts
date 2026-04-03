import { User } from "./User";
export declare class RefreshToken {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt?: Date;
    createdAt: Date;
    user: User;
}
//# sourceMappingURL=RefreshToken.d.ts.map