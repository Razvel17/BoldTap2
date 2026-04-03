// OAuth Account Entity
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("oauth_accounts")
export class OAuthAccount {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column()
  provider: string; // 'google', 'github'

  @Column()
  providerAccountId: string; // ID from the OAuth provider

  @Column({ nullable: true })
  providerEmail?: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.oauthAccounts)
  @JoinColumn({ name: "userId" })
  user: User;
}
