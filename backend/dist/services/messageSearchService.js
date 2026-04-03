"use strict";
// Message Search Service
// Full-text search for messages
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMessages = searchMessages;
exports.searchByUser = searchByUser;
exports.searchByDateRange = searchByDateRange;
exports.getRecentMessages = getRecentMessages;
const database_1 = require("../config/database");
const ChatMessage_1 = require("../entities/ChatMessage");
const messageRepo = () => database_1.AppDataSource.getRepository(ChatMessage_1.ChatMessage);
async function searchMessages(conversationId, query, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const queryBuilder = messageRepo()
        .createQueryBuilder("m")
        .where("m.conversationId = :conversationId", { conversationId })
        .andWhere("m.deletedAt IS NULL")
        .andWhere("(m.content ILIKE :query OR m.type ILIKE :query)", { query: `%${query}%` })
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
async function searchByUser(conversationId, userId, page = 1, pageSize = 20) {
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
async function searchByDateRange(conversationId, startDate, endDate, page = 1, pageSize = 20) {
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
async function getRecentMessages(conversationId, limit = 50) {
    return messageRepo()
        .find({
        where: {
            conversationId,
            deletedAt: null,
        },
        order: { createdAt: "DESC" },
        take: limit,
    });
}
//# sourceMappingURL=messageSearchService.js.map