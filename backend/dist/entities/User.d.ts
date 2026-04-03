import { OAuthAccount } from "./OAuthAccount";
import { VerificationToken } from "./VerificationToken";
import { RefreshToken } from "./RefreshToken";
import { MerchantSubscription } from "./MerchantSubscription";
import { CustomerPurchase } from "./CustomerPurchase";
export type UserType = "customer" | "merchant" | "both";
export declare class User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    password: string;
    emailVerified: boolean;
    userType: UserType;
    stripeCustomerId?: string;
    refreshTokenSecret?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    oauthAccounts: OAuthAccount[];
    verificationTokens: VerificationToken[];
    refreshTokens: RefreshToken[];
    merchantSubscriptions: MerchantSubscription[];
    customerPurchases: CustomerPurchase[];
}
//# sourceMappingURL=User.d.ts.map