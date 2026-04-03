"use strict";
// Chat Controller
// Handles all chat-related endpoints for conversations and messages
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversation = createConversation;
exports.listConversations = listConversations;
exports.getMessages = getMessages;
exports.sendMessage = sendMessage;
exports.editMessage = editMessage;
exports.deleteMessage = deleteMessage;
exports.addParticipant = addParticipant;
exports.leaveConversation = leaveConversation;
exports.searchMessages = searchMessages;
exports.addReaction = addReaction;
exports.getReactions = getReactions;
const chatService = __importStar(require("../services/chatService"));
const errors_1 = require("../utils/errors");
async function createConversation(req, res) {
    try {
        const { title, participantIds, description } = req.body;
        if (!title || !participantIds || !Array.isArray(participantIds)) {
            return (0, errors_1.sendError)(res, "Title and participant IDs array required", 400);
        }
        const result = await chatService.createConversation({
            title,
            participantIds: [req.user.userId, ...participantIds],
            description,
            createdBy: req.user.userId,
        });
        return (0, errors_1.sendSuccess)(res, result);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function listConversations(req, res) {
    try {
        const conversations = await chatService.listConversations(req.user.userId);
        return (0, errors_1.sendSuccess)(res, { conversations });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function getMessages(req, res) {
    try {
        const { conversationId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const offset = parseInt(req.query.offset) || 0;
        const messages = await chatService.getMessages(conversationId, limit, offset);
        return (0, errors_1.sendSuccess)(res, { messages });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function sendMessage(req, res) {
    try {
        const { conversationId } = req.params;
        const { content, type, metadata } = req.body;
        if (!content) {
            return (0, errors_1.sendError)(res, "Message content required", 400);
        }
        const message = await chatService.sendMessage({
            conversationId,
            senderId: req.user.userId,
            content,
            type: type || "text",
            metadata,
        });
        return (0, errors_1.sendSuccess)(res, message);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function editMessage(req, res) {
    try {
        const { conversationId, messageId } = req.params;
        const { content } = req.body;
        if (!content) {
            return (0, errors_1.sendError)(res, "Updated content required", 400);
        }
        const message = await chatService.editMessage(messageId, conversationId, req.user.userId, content);
        return (0, errors_1.sendSuccess)(res, message);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function deleteMessage(req, res) {
    try {
        const { conversationId, messageId } = req.params;
        await chatService.deleteMessage(messageId, conversationId, req.user.userId);
        return (0, errors_1.sendSuccess)(res, { message: "Message deleted" });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function addParticipant(req, res) {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;
        if (!userId) {
            return (0, errors_1.sendError)(res, "User ID required", 400);
        }
        const conversation = await chatService.addParticipant(conversationId, userId, req.user.userId);
        return (0, errors_1.sendSuccess)(res, conversation);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function leaveConversation(req, res) {
    try {
        const { conversationId } = req.params;
        await chatService.leaveConversation(conversationId, req.user.userId);
        return (0, errors_1.sendSuccess)(res, { message: "Left conversation" });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function searchMessages(req, res) {
    try {
        const { conversationId } = req.params;
        const { query, page } = req.query;
        if (!query) {
            return (0, errors_1.sendError)(res, "Search query required", 400);
        }
        const messageSearchService = await Promise.resolve().then(() => __importStar(require("../services/messageSearchService")));
        const result = await messageSearchService.searchMessages(conversationId, query, parseInt(page) || 1);
        return (0, errors_1.sendSuccess)(res, result);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function addReaction(req, res) {
    try {
        const { conversationId, messageId } = req.params;
        const { emoji } = req.body;
        if (!emoji) {
            return (0, errors_1.sendError)(res, "Emoji required", 400);
        }
        const reactionService = await Promise.resolve().then(() => __importStar(require("../services/reactionService")));
        const reaction = await reactionService.addReaction(messageId, req.user.userId, emoji);
        return (0, errors_1.sendSuccess)(res, reaction);
    }
    catch (error) {
        if (error instanceof Error && error.message === "Reaction removed") {
            return (0, errors_1.sendSuccess)(res, { removed: true });
        }
        return (0, errors_1.sendError)(res, error);
    }
}
async function getReactions(req, res) {
    try {
        const { messageId } = req.params;
        const reactionService = await Promise.resolve().then(() => __importStar(require("../services/reactionService")));
        const reactions = await reactionService.getReactions(messageId, req.user?.userId);
        return (0, errors_1.sendSuccess)(res, { reactions });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
//# sourceMappingURL=chatController.js.map