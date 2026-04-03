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
