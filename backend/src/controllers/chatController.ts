import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as chatService from "../services/chatService";
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
        "Title and participant IDs required",
        400,
      );
    }

    const result = await chatService.createConversation(
      req.user!.userId,
      title,
      participantIds,
      description,
    );

    if (!result.success) {
      return sendError(res, result.error || "Failed to create conversation", 400);
    }

    return sendSuccess(res, { conversation: result.conversation });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function listConversations(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const result = await chatService.getConversations(req.user!.userId);

    if (!result.success) {
      return sendError(res, result.error || "Failed to fetch conversations", 400);
    }

    return sendSuccess(res, { conversations: result.conversations });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function getMessages(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const conversationId = Array.isArray(req.params.conversationId)
      ? (req.params.conversationId as any)[0]
      : (req.params.conversationId as string);
    const { limit = 50, offset = 0 } = req.query;

    const result = await chatService.getConversationMessages(
      conversationId,
      req.user!.userId,
      Number(limit),
      Number(offset),
    );

    if (!result.success) {
      return sendError(res, result.error || "Failed to fetch messages", 400);
    }

    return sendSuccess(res, { messages: result.messages });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function sendMessage(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const conversationId = Array.isArray(req.params.conversationId)
      ? (req.params.conversationId as any)[0]
      : (req.params.conversationId as string);
    const { content, type = "text", metadata } = req.body;

    if (!content) {
      return sendError(res, "Message content required", 400);
    }

    const result = await chatService.sendMessage(
      conversationId,
      req.user!.userId,
      content,
      type,
      metadata,
    );

    if (!result.success) {
      return sendError(res, result.error || "Failed to send message", 400);
    }

    return sendSuccess(res, { message: result.message });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function editMessage(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const messageId = Array.isArray(req.params.messageId)
      ? (req.params.messageId as any)[0]
      : (req.params.messageId as string);
    const { content } = req.body;

    if (!content) {
      return sendError(res, "Message content required", 400);
    }

    const result = await chatService.editMessage(
      messageId,
      req.user!.userId,
      content,
    );

    if (!result.success) {
      return sendError(res, result.error || "Failed to edit message", 400);
    }

    return sendSuccess(res, { message: result.message });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function deleteMessage(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const messageId = Array.isArray(req.params.messageId)
      ? (req.params.messageId as any)[0]
      : (req.params.messageId as string);

    const result = await chatService.deleteMessage(messageId, req.user!.userId);

    if (!result.success) {
      return sendError(res, result.error || "Failed to delete message", 400);
    }

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
    const conversationId = Array.isArray(req.params.conversationId)
      ? (req.params.conversationId as any)[0]
      : (req.params.conversationId as string);
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, "User ID required", 400);
    }

    const result = await chatService.addParticipant(
      conversationId,
      userId,
      req.user!.userId,
    );

    if (!result.success) {
      return sendError(res, result.error || "Failed to add participant", 400);
    }

    return sendSuccess(res, { conversation: result.conversation });
  } catch (error) {
    return sendError(res, error as Error);
  }
}

export async function leaveConversation(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> {
  try {
    const conversationId = Array.isArray(req.params.conversationId)
      ? (req.params.conversationId as any)[0]
      : (req.params.conversationId as string);

    const result = await chatService.leaveConversation(
      conversationId,
      req.user!.userId,
    );

    if (!result.success) {
      return sendError(res, result.error || "Failed to leave conversation", 400);
    }

    return sendSuccess(res, { message: "Left conversation" });
  } catch (error) {
    return sendError(res, error as Error);
  }
}
