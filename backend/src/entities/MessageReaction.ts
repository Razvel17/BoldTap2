import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { ChatMessage } from "./ChatMessage";
import { User } from "./User";

@Entity("message_reactions")
@Index(["messageId", "userId", "emoji"], { unique: true })
export class MessageReaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  messageId: string;

  @ManyToOne(() => ChatMessage, { onDelete: "CASCADE" })
  @JoinColumn({ name: "messageId" })
  message: ChatMessage;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "varchar", length: 5 })
  emoji: string;

  @CreateDateColumn()
  createdAt: Date;
}
