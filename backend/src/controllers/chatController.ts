// Chat Controller
// Handles all chat-related endpoints for conversations and messages

import { Response } from "express";
import * as chatService from "../services/chatService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { sendSuccess, sendError } from "../utils/errors";

export async function createConversation(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const { title, participantIds, description } = req.body;

    if (!title || !participantIds || !Array.isArray(participantIds)) {
      return sendError(
        res,
        "Title and participant IDs array required",
        400,
      );
    }

    const result = await chatService.createConversation({
      title,
      participantIds: [req.user!.userId, ...participantIds],
      description,
      createdBy: req.user!.userId,
    });

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function listConversations(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const conversations = await chatService.listConversations(
      req.user!.userId,
    );
    return sendSuccess(res, { conversations });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function getMessages(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const { conversationId } = req.params as { conversationId: string };
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await chatService.getMessages(
      conversationId,
      limit,
      offset,
    );
    return sendSuccess(res, { messages });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function sendMessage(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const { conversationId } = req.params as { conversationId: string };
    const { content, type, metadata } = req.body;

    if (!content) {
      return sendError(res, "Message content required", 400);
    }

    const message = await chatService.sendMessage({
      conversationId,
      senderId: req.user!.userId,
      content,
      type: type || "text",
      metadata,
    });

    return sendSuccess(res, message);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function editMessage(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const { conversationId, messageId } = req.params as {
      conversationId: string;
      messageId: string;
    };
    const { content } = req.body;

    if (!content) {
      return sendError(res, "Updated content required", 400);
    }

    const message = await chatService.editMessage(
      messageId,
      conversationId,
      req.user!.userId,
      content,
    );

    return sendSuccess(res, message);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function deleteMessage(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const { conversationId, messageId } = req.params as {
      conversationId: string;
      messageId: string;
    };

    await chatService.deleteMessage(
      messageId,
      conversationId,
      req.user!.userId,
    );

    return sendSuccess(res, { message: "Message deleted" });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function addParticipant(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const { conversationId } = req.params as { conversationId: string };
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, "User ID required", 400);
    }

    const conversation = await chatService.addParticipant(
      conversationId,
      userId,
      req.user!.userId,
    );

    return sendSuccess(res, conversation);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function leaveConversation(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const { conversationId } = req.params as { conversationId: string };

    await chatService.leaveConversation(conversationId, req.user!.userId);

    return sendSuccess(res, { message: "Left conversation" });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function searchMessages(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const { conversationId } = req.params as { conversationId: string };
    const { query, page } = req.query;

    if (!query) {
      return sendError(res, "Search query required", 400);
    }

    const messageSearchService = await import("../services/messageSearchService");
    const result = await messageSearchService.searchMessages(
      conversationId,
      query as string,
      parseInt(page as string) || 1,
    );

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function addReaction(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const { messageId } = req.params as {
      messageId: string;
    };
    const { emoji } = req.body;

    if (!emoji) {
      return sendError(res, "Emoji required", 400);
    }

    const reactionService = await import("../services/reactionService");
    const reaction = await reactionService.addReaction(
      messageId,
      req.user!.userId,
      emoji,
    );

    return sendSuccess(res, reaction);
  } catch (error) {
    if (error instanceof Error && error.message === "Reaction removed") {
      return sendSuccess(res, { removed: true });
    }
    return sendError(res, error as Error);
  }
}

export async function getReactions(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const { messageId } = req.params as { messageId: string };

    const reactionService = await import("../services/reactionService");
    const reactions = await reactionService.getReactions(
      messageId,
      req.user?.userId,
    );

    return sendSuccess(res, { reactions });
  } catch (error) {
    return sendError(res, error as Error);
  }
}
