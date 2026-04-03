"use strict";
// Chat Service
// Handles conversation and message operations
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversation = createConversation;
exports.listConversations = listConversations;
exports.getMessages = getMessages;
exports.sendMessage = sendMessage;
exports.editMessage = editMessage;
exports.deleteMessage = deleteMessage;
exports.addParticipant = addParticipant;
exports.leaveConversation = leaveConversation;
const database_1 = require("../config/database");
const Conversation_1 = require("../entities/Conversation");
const ChatMessage_1 = require("../entities/ChatMessage");
const User_1 = require("../entities/User");
const typeorm_1 = require("typeorm");
const conversationRepo = () => database_1.AppDataSource.getRepository(Conversation_1.Conversation);
const messageRepo = () => database_1.AppDataSource.getRepository(ChatMessage_1.ChatMessage);
const userRepo = () => database_1.AppDataSource.getRepository(User_1.User);
async function createConversation(data) {
    const participants = await userRepo().find({
        where: { id: (0, typeorm_1.In)(data.participantIds) },
    });
    const conversation = conversationRepo().create({
        title: data.title,
        description: data.description,
        participants,
        createdBy: data.createdBy,
    });
    return await conversationRepo().save(conversation);
}
async function listConversations(userId) {
    return conversationRepo()
        .createQueryBuilder("c")
        .leftJoinAndSelect("c.participants", "p")
        .leftJoinAndSelect("c.messages", "m")
        .where("p.id = :userId", { userId })
        .orderBy("c.updatedAt", "DESC")
        .take(50)
        .getMany();
}
async function getMessages(conversationId, limit = 50, offset = 0) {
    return messageRepo()
        .find({
        where: {
            conversationId,
            deletedAt: (0, typeorm_1.IsNull)(),
        },
        relations: ["sender"],
        order: { createdAt: "ASC" },
        skip: offset,
        take: limit,
    });
}
async function sendMessage(data) {
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
async function editMessage(messageId, conversationId, userId, content) {
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
async function deleteMessage(messageId, conversationId, userId) {
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
async function addParticipant(conversationId, userId, addedBy) {
    const conversation = await conversationRepo().findOne({
        where: { id: conversationId },
        relations: ["participants"],
    });
    if (!conversation) {
        throw new Error("Conversation not found");
    }
    // Check if user is in conversation
    const isParticipant = conversation.participants.some((p) => p.id === addedBy);
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
async function leaveConversation(conversationId, userId) {
    const conversation = await conversationRepo().findOne({
        where: { id: conversationId },
        relations: ["participants"],
    });
    if (!conversation) {
        throw new Error("Conversation not found");
    }
    conversation.participants = conversation.participants.filter((p) => p.id !== userId);
    await conversationRepo().save(conversation);
}
//# sourceMappingURL=chatService.js.map