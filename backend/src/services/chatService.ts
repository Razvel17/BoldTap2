import { AppDataSource } from "../config/database";
import { Conversation } from "../entities/Conversation";
import { ChatMessage } from "../entities/ChatMessage";
import { User } from "../entities/User";

const conversationRepo = () => AppDataSource.getRepository(Conversation);
const messageRepo = () => AppDataSource.getRepository(ChatMessage);
const userRepo = () => AppDataSource.getRepository(User);

export async function createConversation(
  createdBy: string,
  title: string,
  participantIds: string[],
  description?: string,
) {
  try {
    const participants = await userRepo().findByIds(participantIds);
    const creator = await userRepo().findOneBy({ id: createdBy });

    if (!creator) {
      return { success: false, error: "Creator not found" };
    }

    const conversation = new Conversation();
    conversation.title = title;
    conversation.description = description || "";
    conversation.createdBy = createdBy;
    conversation.participants = [creator, ...participants];
    conversation.deletedAt = null;

    const saved = await conversationRepo().save(conversation);
    return { success: true, conversation: saved };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getConversations(userId: string) {
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
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
  limit: number = 50,
  offset: number = 0,
) {
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
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  type: "text" | "image" | "file" | "system" = "text",
  metadata?: Record<string, any>,
) {
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
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function editMessage(
  messageId: string,
  userId: string,
  newContent: string,
) {
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
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteMessage(messageId: string, userId: string) {
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
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function addParticipant(
  conversationId: string,
  userId: string,
  addedBy: string,
) {
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
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function leaveConversation(
  conversationId: string,
  userId: string,
) {
  try {
    const conversation = await conversationRepo()
      .createQueryBuilder("conv")
      .leftJoinAndSelect("conv.participants", "participants")
      .where("conv.id = :id", { id: conversationId })
      .getOne();

    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    conversation.participants = conversation.participants.filter(
      (p) => p.id !== userId,
    );

    if (conversation.participants.length === 0) {
      // Delete conversation if no participants left
      conversation.deletedAt = new Date();
    }

    await conversationRepo().save(conversation);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
