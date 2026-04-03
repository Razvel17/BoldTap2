"use strict";
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
const chatService = __importStar(require("../services/chatService"));
const errors_1 = require("../utils/errors");
async function createConversation(req, res) {
    try {
        const { title, participantIds, description } = req.body;
        if (!title || !participantIds || !Array.isArray(participantIds)) {
            return (0, errors_1.sendError)(res, "Title and participant IDs required", 400);
        }
        const result = await chatService.createConversation(req.user.userId, title, participantIds, description);
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to create conversation", 400);
        }
        return (0, errors_1.sendSuccess)(res, { conversation: result.conversation });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function listConversations(req, res) {
    try {
        const result = await chatService.getConversations(req.user.userId);
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to fetch conversations", 400);
        }
        return (0, errors_1.sendSuccess)(res, { conversations: result.conversations });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function getMessages(req, res) {
    try {
        const conversationId = Array.isArray(req.params.conversationId)
            ? req.params.conversationId[0]
            : req.params.conversationId;
        const { limit = 50, offset = 0 } = req.query;
        const result = await chatService.getConversationMessages(conversationId, req.user.userId, Number(limit), Number(offset));
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to fetch messages", 400);
        }
        return (0, errors_1.sendSuccess)(res, { messages: result.messages });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function sendMessage(req, res) {
    try {
        const conversationId = Array.isArray(req.params.conversationId)
            ? req.params.conversationId[0]
            : req.params.conversationId;
        const { content, type = "text", metadata } = req.body;
        if (!content) {
            return (0, errors_1.sendError)(res, "Message content required", 400);
        }
        const result = await chatService.sendMessage(conversationId, req.user.userId, content, type, metadata);
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to send message", 400);
        }
        return (0, errors_1.sendSuccess)(res, { message: result.message });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function editMessage(req, res) {
    try {
        const messageId = Array.isArray(req.params.messageId)
            ? req.params.messageId[0]
            : req.params.messageId;
        const { content } = req.body;
        if (!content) {
            return (0, errors_1.sendError)(res, "Message content required", 400);
        }
        const result = await chatService.editMessage(messageId, req.user.userId, content);
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to edit message", 400);
        }
        return (0, errors_1.sendSuccess)(res, { message: result.message });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function deleteMessage(req, res) {
    try {
        const messageId = Array.isArray(req.params.messageId)
            ? req.params.messageId[0]
            : req.params.messageId;
        const result = await chatService.deleteMessage(messageId, req.user.userId);
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to delete message", 400);
        }
        return (0, errors_1.sendSuccess)(res, { message: "Message deleted" });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function addParticipant(req, res) {
    try {
        const conversationId = Array.isArray(req.params.conversationId)
            ? req.params.conversationId[0]
            : req.params.conversationId;
        const { userId } = req.body;
        if (!userId) {
            return (0, errors_1.sendError)(res, "User ID required", 400);
        }
        const result = await chatService.addParticipant(conversationId, userId, req.user.userId);
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to add participant", 400);
        }
        return (0, errors_1.sendSuccess)(res, { conversation: result.conversation });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
async function leaveConversation(req, res) {
    try {
        const conversationId = Array.isArray(req.params.conversationId)
            ? req.params.conversationId[0]
            : req.params.conversationId;
        const result = await chatService.leaveConversation(conversationId, req.user.userId);
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to leave conversation", 400);
        }
        return (0, errors_1.sendSuccess)(res, { message: "Left conversation" });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
//# sourceMappingURL=chatController.js.map