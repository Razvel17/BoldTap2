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
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const chatController = __importStar(require("../controllers/chatController"));
const router = (0, express_1.Router)();
// All chat endpoints require authentication
router.post("/conversations", authMiddleware_1.authenticate, chatController.createConversation);
router.get("/conversations", authMiddleware_1.authenticate, chatController.listConversations);
router.get("/conversations/:conversationId/messages", authMiddleware_1.authenticate, chatController.getMessages);
router.post("/conversations/:conversationId/messages", authMiddleware_1.authenticate, chatController.sendMessage);
router.put("/conversations/:conversationId/messages/:messageId", authMiddleware_1.authenticate, chatController.editMessage);
router.delete("/conversations/:conversationId/messages/:messageId", authMiddleware_1.authenticate, chatController.deleteMessage);
router.post("/conversations/:conversationId/participants", authMiddleware_1.authenticate, chatController.addParticipant);
router.delete("/conversations/:conversationId/leave", authMiddleware_1.authenticate, chatController.leaveConversation);
exports.default = router;
//# sourceMappingURL=chatRoutes.js.map