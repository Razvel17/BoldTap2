// Verification Token Entity (for email verification and password reset)
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

export type TokenType = "email_verification" | "password_reset";

@Entity("verification_tokens")
export class VerificationToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column({ unique: true })
  token: string; // The token sent to user

  @Column({ type: "enum", enum: ["email_verification", "password_reset"] })
  type: TokenType;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  usedAt?: Date; // When token was used (single-use)

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.verificationTokens)
  @JoinColumn({ name: "userId" })
  user: User;
}
