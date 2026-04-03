// User Entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { OAuthAccount } from "./OAuthAccount";
import { VerificationToken } from "./VerificationToken";
import { RefreshToken } from "./RefreshToken";
import { MerchantSubscription } from "./MerchantSubscription";
import { CustomerPurchase } from "./CustomerPurchase";

export type UserType = "customer" | "merchant" | "both";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  password: string; // hashed password

  @Column({ default: false })
  emailVerified: boolean;

  @Column({
    type: "enum",
    enum: ["customer", "merchant", "both"],
    default: "customer",
  })
  userType: UserType;

  @Column({ nullable: true })
  stripeCustomerId?: string; // For Stripe payments

  @Column({ nullable: true })
  refreshTokenSecret?: string; // For rotating refresh tokens

  @Column({ nullable: true })
  passwordResetToken?: string; // Single-use password reset token

  @Column({ nullable: true })
  passwordResetExpires?: Date; // Expiry for password reset token

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date; // Soft delete support

  // Relationships
  @OneToMany(() => OAuthAccount, (oauth) => oauth.user, { cascade: true })
  oauthAccounts: OAuthAccount[];

  @OneToMany(() => VerificationToken, (token) => token.user, { cascade: true })
  verificationTokens: VerificationToken[];

  @OneToMany(() => RefreshToken, (token) => token.user, { cascade: true })
  refreshTokens: RefreshToken[];

  @OneToMany(() => MerchantSubscription, (sub) => sub.merchant, { cascade: true })
  merchantSubscriptions: MerchantSubscription[];

  @OneToMany(() => CustomerPurchase, (purchase) => purchase.customer, { cascade: true })
  customerPurchases: CustomerPurchase[];
}
