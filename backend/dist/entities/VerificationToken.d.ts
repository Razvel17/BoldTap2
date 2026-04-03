import { User } from "./User";
export type TokenType = "email_verification" | "password_reset";
export declare class VerificationToken {
    id: string;
    userId: string;
    token: string;
    type: TokenType;
    expiresAt: Date;
    usedAt?: Date;
    createdAt: Date;
    user: User;
}
//# sourceMappingURL=VerificationToken.d.ts.map