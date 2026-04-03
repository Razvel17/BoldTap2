// Customer Purchase Entity (for one-time product purchases)
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

export type PurchaseStatus = "pending" | "succeeded" | "failed" | "cancelled";
export type ProductType = "nfc_card" | "ring" | "subscription" | "other";
export type PaymentProvider = "mpesa" | "yas" | "airtel_money" | "stripe";

@Entity("customer_purchases")
export class CustomerPurchase {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  customerId: string; // Foreign key to User

  @Column({ nullable: true })
  provider?: PaymentProvider;

  @Column({ nullable: true })
  providerTransactionId?: string;

  @Column({ nullable: true })
  providerReference?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ type: "enum", enum: ["nfc_card", "ring", "other"] })
  productType: ProductType;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number; // Amount in cents (stored as decimal)

  @Column({ default: "USD" })
  currency: string;

  @Column({ type: "enum", enum: ["pending", "succeeded", "failed", "cancelled"], default: "pending" })
  status: PurchaseStatus;

  @Column({ type: "jsonb", nullable: true })
  metadata?: any; // Provider request/response metadata and callback payloads

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.customerPurchases)
  @JoinColumn({ name: "customerId" })
  customer: User;
}
