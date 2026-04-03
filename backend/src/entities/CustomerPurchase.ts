// Customer Purchase Entity (for one-time product purchases)
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

export type PurchaseStatus = "pending" | "succeeded" | "failed" | "cancelled";
export type ProductType = "nfc_card" | "ring" | "other";

@Entity("customer_purchases")
export class CustomerPurchase {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  customerId: string; // Foreign key to User

  @Column({ nullable: true })
  stripePaymentIntentId?: string; // Stripe payment intent ID

  @Column({ type: "enum", enum: ["nfc_card", "ring", "other"] })
  productType: ProductType;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number; // Amount in cents (stored as decimal)

  @Column({ default: "USD" })
  currency: string;

  @Column({ type: "enum", enum: ["pending", "succeeded", "failed", "cancelled"], default: "pending" })
  status: PurchaseStatus;

  @Column({ type: "jsonb", nullable: true })
  metadata?: any; // Order details, quantity, etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.customerPurchases)
  @JoinColumn({ name: "customerId" })
  customer: User;
}
