// Refresh Token Entity
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("refresh_tokens")
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column()
  tokenHash: string; // Hash of the refresh token (never store plaintext)

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  revokedAt?: Date; // When token was revoked (logout)

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.refreshTokens)
  @JoinColumn({ name: "userId" })
  user: User;
}
