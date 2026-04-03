// Chat Routes
// Routes for conversations and messaging

import { Router } from "express";
import * as chatController from "../controllers/chatController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Conversation endpoints
router.post(
  "/conversations",
  authenticate as any,
  chatController.createConversation as any,
);
router.get(
  "/conversations",
  authenticate as any,
  chatController.listConversations as any,
);

// Message endpoints
router.get(
  "/conversations/:conversationId/messages",
  authenticate as any,
  chatController.getMessages as any,
);
router.post(
  "/conversations/:conversationId/messages",
  authenticate as any,
  chatController.sendMessage as any,
);
router.put(
  "/conversations/:conversationId/messages/:messageId",
  authenticate as any,
  chatController.editMessage as any,
);
router.delete(
  "/conversations/:conversationId/messages/:messageId",
  authenticate as any,
  chatController.deleteMessage as any,
);

// Participant management
router.post(
  "/conversations/:conversationId/participants",
  authenticate as any,
  chatController.addParticipant as any,
);
router.delete(
  "/conversations/:conversationId/leave",
  authenticate as any,
  chatController.leaveConversation as any,
);

export default router;

// Message search
router.get(
  "/conversations/:conversationId/search",
  authenticate as any,
  chatController.searchMessages as any,
);

// Reactions
router.post(
  "/conversations/:conversationId/messages/:messageId/reactions",
  authenticate as any,
  chatController.addReaction as any,
);
router.get(
  "/messages/:messageId/reactions",
  authenticate as any,
  chatController.getReactions as any,
);
