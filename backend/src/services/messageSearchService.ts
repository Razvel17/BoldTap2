// Message Search Service
// Full-text search for messages

import { AppDataSource } from "../config/database";
import { ChatMessage } from "../entities/ChatMessage";
import { IsNull } from "typeorm";

const messageRepo = () => AppDataSource.getRepository(ChatMessage);

export interface SearchResult {
  messages: ChatMessage[];
  total: number;
  page: number;
  pageSize: number;
}

export async function searchMessages(
  conversationId: string,
  query: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<SearchResult> {
  const skip = (page - 1) * pageSize;

  const queryBuilder = messageRepo()
    .createQueryBuilder("m")
    .where("m.conversationId = :conversationId", { conversationId })
    .andWhere("m.deletedAt IS NULL")
    .andWhere(
      "(m.content ILIKE :query OR m.type ILIKE :query)",
      { query: `%${query}%` },
    )
    .orderBy("m.createdAt", "DESC")
    .skip(skip)
    .take(pageSize);

  const [messages, total] = await queryBuilder.getManyAndCount();

  return {
    messages,
    total,
    page,
    pageSize,
  };
}

export async function searchByUser(
  conversationId: string,
  userId: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<SearchResult> {
  const skip = (page - 1) * pageSize;

  const queryBuilder = messageRepo()
    .createQueryBuilder("m")
    .where("m.conversationId = :conversationId", { conversationId })
    .andWhere("m.senderId = :userId", { userId })
    .andWhere("m.deletedAt IS NULL")
    .orderBy("m.createdAt", "DESC")
    .skip(skip)
    .take(pageSize);

  const [messages, total] = await queryBuilder.getManyAndCount();

  return {
    messages,
    total,
    page,
    pageSize,
  };
}

export async function searchByDateRange(
  conversationId: string,
  startDate: Date,
  endDate: Date,
  page: number = 1,
  pageSize: number = 20,
): Promise<SearchResult> {
  const skip = (page - 1) * pageSize;

  const queryBuilder = messageRepo()
    .createQueryBuilder("m")
    .where("m.conversationId = :conversationId", { conversationId })
    .andWhere("m.createdAt >= :startDate", { startDate })
    .andWhere("m.createdAt <= :endDate", { endDate })
    .andWhere("m.deletedAt IS NULL")
    .orderBy("m.createdAt", "DESC")
    .skip(skip)
    .take(pageSize);

  const [messages, total] = await queryBuilder.getManyAndCount();

  return {
    messages,
    total,
    page,
    pageSize,
  };
}

export async function getRecentMessages(
  conversationId: string,
  limit: number = 50,
): Promise<ChatMessage[]> {
  return messageRepo()
    .find({
      where: {
        conversationId,
        deletedAt: IsNull(),
      },
      order: { createdAt: "DESC" },
      take: limit,
    });
}
