// Merchant Subscription Entity (for seller recurring billing)
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "unpaid";
export type SubscriptionPlan = "free" | "starter" | "pro" | "enterprise";

@Entity("merchant_subscriptions")
export class MerchantSubscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  merchantId: string; // Foreign key to User

  @Column({ nullable: true, unique: true })
  stripeSubscriptionId?: string; // Stripe subscription ID

  @Column({ nullable: true })
  stripePriceId?: string; // Stripe price/plan ID

  @Column({ type: "enum", enum: ["free", "starter", "pro", "enterprise"], default: "free" })
  planName: SubscriptionPlan;

  @Column({ type: "enum", enum: ["trialing", "active", "past_due", "canceled", "unpaid"], default: "trialing" })
  status: SubscriptionStatus;

  @Column({ type: "timestamp", nullable: true })
  currentPeriodStart?: Date;

  @Column({ type: "timestamp", nullable: true })
  currentPeriodEnd?: Date;

  @Column({ type: "timestamp", nullable: true })
  canceledAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.merchantSubscriptions)
  @JoinColumn({ name: "merchantId" })
  merchant: User;
}
