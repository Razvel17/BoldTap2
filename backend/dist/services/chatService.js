"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversation = createConversation;
exports.getConversations = getConversations;
exports.getConversationMessages = getConversationMessages;
exports.sendMessage = sendMessage;
exports.editMessage = editMessage;
exports.deleteMessage = deleteMessage;
exports.addParticipant = addParticipant;
exports.leaveConversation = leaveConversation;
const database_1 = require("../config/database");
const Conversation_1 = require("../entities/Conversation");
const ChatMessage_1 = require("../entities/ChatMessage");
const User_1 = require("../entities/User");
const conversationRepo = () => database_1.AppDataSource.getRepository(Conversation_1.Conversation);
const messageRepo = () => database_1.AppDataSource.getRepository(ChatMessage_1.ChatMessage);
const userRepo = () => database_1.AppDataSource.getRepository(User_1.User);
async function createConversation(createdBy, title, participantIds, description) {
    try {
        const participants = await userRepo().findByIds(participantIds);
        const creator = await userRepo().findOneBy({ id: createdBy });
        if (!creator) {
            return { success: false, error: "Creator not found" };
        }
        const conversation = new Conversation_1.Conversation();
        conversation.title = title;
        conversation.description = description || "";
        conversation.createdBy = createdBy;
        conversation.participants = [creator, ...participants];
        conversation.deletedAt = null;
        const saved = await conversationRepo().save(conversation);
        return { success: true, conversation: saved };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function getConversations(userId) {
    try {
        const conversations = await conversationRepo()
            .createQueryBuilder("conv")
            .leftJoinAndSelect("conv.participants", "participants")
            .leftJoinAndSelect("conv.messages", "messages")
            .where("participants.id = :userId", { userId })
            .andWhere("conv.deletedAt IS NULL")
            .orderBy("conv.updatedAt", "DESC")
            .take(50)
            .getMany();
        return { success: true, conversations };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function getConversationMessages(conversationId, userId, limit = 50, offset = 0) {
    try {
        // Verify user is participant
        const conversation = await conversationRepo()
            .createQueryBuilder("conv")
            .leftJoinAndSelect("conv.participants", "participants")
            .where("conv.id = :id", { id: conversationId })
            .getOne();
        if (!conversation) {
            return { success: false, error: "Conversation not found" };
        }
        const isParticipant = conversation.participants.some((p) => p.id === userId);
        if (!isParticipant) {
            return { success: false, error: "Access denied" };
        }
        const messages = await messageRepo()
            .createQueryBuilder("msg")
            .leftJoinAndSelect("msg.sender", "sender")
            .where("msg.conversationId = :convId", { convId: conversationId })
            .andWhere("msg.deletedAt IS NULL")
            .orderBy("msg.createdAt", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();
        return { success: true, messages: messages.reverse() };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function sendMessage(conversationId, senderId, content, type = "text", metadata) {
    try {
        // Verify user is participant
        const conversation = await conversationRepo()
            .createQueryBuilder("conv")
            .leftJoinAndSelect("conv.participants", "participants")
            .where("conv.id = :id", { id: conversationId })
            .getOne();
        if (!conversation) {
            return { success: false, error: "Conversation not found" };
        }
        const isParticipant = conversation.participants.some((p) => p.id === senderId);
        if (!isParticipant) {
            return { success: false, error: "Not a participant" };
        }
        const message = messageRepo().create({
            conversationId,
            senderId,
            content,
            type,
            metadata: metadata || null,
        });
        const saved = await messageRepo().save(message);
        // Update conversation updatedAt
        conversation.updatedAt = new Date();
        await conversationRepo().save(conversation);
        return { success: true, message: saved };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function editMessage(messageId, userId, newContent) {
    try {
        const message = await messageRepo().findOneBy({ id: messageId });
        if (!message) {
            return { success: false, error: "Message not found" };
        }
        if (message.senderId !== userId) {
            return { success: false, error: "Cannot edit other user's messages" };
        }
        message.content = newContent;
        message.edited = true;
        message.editedAt = new Date();
        const updated = await messageRepo().save(message);
        return { success: true, message: updated };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function deleteMessage(messageId, userId) {
    try {
        const message = await messageRepo().findOneBy({ id: messageId });
        if (!message) {
            return { success: false, error: "Message not found" };
        }
        if (message.senderId !== userId) {
            return { success: false, error: "Cannot delete other user's messages" };
        }
        // Soft delete
        message.deletedAt = new Date();
        await messageRepo().save(message);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function addParticipant(conversationId, userId, addedBy) {
    try {
        const conversation = await conversationRepo().findOneBy({
            id: conversationId,
        });
        if (!conversation) {
            return { success: false, error: "Conversation not found" };
        }
        const user = await userRepo().findOneBy({ id: userId });
        if (!user) {
            return { success: false, error: "User not found" };
        }
        // Verify addedBy is participant
        const participants = await conversationRepo()
            .createQueryBuilder("conv")
            .leftJoinAndSelect("conv.participants", "participants")
            .where("conv.id = :id", { id: conversationId })
            .getOne();
        const isParticipant = participants?.participants.some((p) => p.id === addedBy);
        if (!isParticipant) {
            return { success: false, error: "Access denied" };
        }
        conversation.participants = [...(participants?.participants || []), user];
        const updated = await conversationRepo().save(conversation);
        return { success: true, conversation: updated };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function leaveConversation(conversationId, userId) {
    try {
        const conversation = await conversationRepo()
            .createQueryBuilder("conv")
            .leftJoinAndSelect("conv.participants", "participants")
            .where("conv.id = :id", { id: conversationId })
            .getOne();
        if (!conversation) {
            return { success: false, error: "Conversation not found" };
        }
        conversation.participants = conversation.participants.filter((p) => p.id !== userId);
        if (conversation.participants.length === 0) {
            // Delete conversation if no participants left
            conversation.deletedAt = new Date();
        }
        await conversationRepo().save(conversation);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
//# sourceMappingURL=chatService.js.map