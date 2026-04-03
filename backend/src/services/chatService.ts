// Chat Service
// Handles conversation and message operations

import { AppDataSource } from "../config/database";
import { Conversation } from "../entities/Conversation";
import { ChatMessage } from "../entities/ChatMessage";
import { User } from "../entities/User";
import { In, IsNull } from "typeorm";

const conversationRepo = () => AppDataSource.getRepository(Conversation);
const messageRepo = () => AppDataSource.getRepository(ChatMessage);
const userRepo = () => AppDataSource.getRepository(User);

export async function createConversation(data: {
  title: string;
  participantIds: string[];
  description?: string;
  createdBy: string;
}): Promise<Conversation> {
  const participants = await userRepo().find({
    where: { id: In(data.participantIds) },
  });

  const conversation = conversationRepo().create({
    title: data.title,
    description: data.description,
    participants,
    createdBy: data.createdBy,
  });

  return await conversationRepo().save(conversation);
}

export async function listConversations(
  userId: string,
): Promise<Conversation[]> {
  return conversationRepo()
    .createQueryBuilder("c")
    .leftJoinAndSelect("c.participants", "p")
    .leftJoinAndSelect("c.messages", "m")
    .where("p.id = :userId", { userId })
    .orderBy("c.updatedAt", "DESC")
    .take(50)
    .getMany();
}

export async function getMessages(
  conversationId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<ChatMessage[]> {
  return messageRepo()
    .find({
      where: {
        conversationId,
        deletedAt: IsNull(),
      },
      relations: ["sender"],
      order: { createdAt: "ASC" },
      skip: offset,
      take: limit,
    });
}

export async function sendMessage(data: {
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  metadata?: Record<string, any>;
}): Promise<ChatMessage> {
  const message = messageRepo().create({
    conversationId: data.conversationId,
    senderId: data.senderId,
    content: data.content,
    type: data.type,
    metadata: data.metadata || null,
  });

  const saved = await messageRepo().save(message);

  // Update conversation updatedAt
  await conversationRepo().update(data.conversationId, {
    updatedAt: new Date(),
  });

  return saved;
}

export async function editMessage(
  messageId: string,
  conversationId: string,
  userId: string,
  content: string,
): Promise<ChatMessage> {
  const message = await messageRepo().findOne({
    where: { id: messageId, conversationId },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.senderId !== userId) {
    throw new Error("Not authorized to edit this message");
  }

  message.content = content;
  message.edited = true;
  message.editedAt = new Date();

  return await messageRepo().save(message);
}

export async function deleteMessage(
  messageId: string,
  conversationId: string,
  userId: string,
): Promise<void> {
  const message = await messageRepo().findOne({
    where: { id: messageId, conversationId },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.senderId !== userId) {
    throw new Error("Not authorized to delete this message");
  }

  await messageRepo().update(messageId, {
    deletedAt: new Date(),
  });
}

export async function addParticipant(
  conversationId: string,
  userId: string,
  addedBy: string,
): Promise<Conversation> {
  const conversation = await conversationRepo().findOne({
    where: { id: conversationId },
    relations: ["participants"],
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Check if user is in conversation
  const isParticipant = conversation.participants.some(
    (p) => p.id === addedBy,
  );
  if (!isParticipant) {
    throw new Error("Not authorized");
  }

  // Add new participant
  const user = await userRepo().findOne({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  if (!conversation.participants.find((p) => p.id === userId)) {
    conversation.participants.push(user);
    await conversationRepo().save(conversation);
  }

  return conversation;
}

export async function leaveConversation(
  conversationId: string,
  userId: string,
): Promise<void> {
  const conversation = await conversationRepo().findOne({
    where: { id: conversationId },
    relations: ["participants"],
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  conversation.participants = conversation.participants.filter(
    (p) => p.id !== userId,
  );

  await conversationRepo().save(conversation);
}
