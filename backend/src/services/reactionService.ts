// Reaction Service
// Handles message reactions and emoji

import { AppDataSource } from "../config/database";
import { MessageReaction } from "../entities/MessageReaction";

const reactionRepo = () => AppDataSource.getRepository(MessageReaction);

interface ReactionCount {
  emoji: string;
  count: number;
  users: string[];
  userReacted: boolean;
}

export async function addReaction(
  messageId: string,
  userId: string,
  emoji: string,
): Promise<MessageReaction> {
  // Remove if already exists (toggle)
  const existing = await reactionRepo().findOne({
    where: { messageId, userId, emoji },
  });

  if (existing) {
    await reactionRepo().remove(existing);
    throw new Error("Reaction removed");
  }

  const reaction = reactionRepo().create({
    messageId,
    userId,
    emoji,
  });

  return await reactionRepo().save(reaction);
}

export async function removeReaction(
  messageId: string,
  userId: string,
  emoji: string,
): Promise<void> {
  await reactionRepo().delete({
    messageId,
    userId,
    emoji,
  });
}

export async function getReactions(
  messageId: string,
  currentUserId?: string,
): Promise<ReactionCount[]> {
  const reactions = await reactionRepo()
    .createQueryBuilder("r")
    .select("r.emoji", "emoji")
    .addSelect("COUNT(DISTINCT r.userId)", "count")
    .where("r.messageId = :messageId", { messageId })
    .groupBy("r.emoji")
    .getRawMany();

  const reactionCounts: ReactionCount[] = [];

  for (const reaction of reactions) {
    const users = await reactionRepo()
      .find({
        where: { messageId, emoji: reaction.emoji },
        relations: ["user"],
      })
      .then((rs) => rs.map((r) => r.userId));

    reactionCounts.push({
      emoji: reaction.emoji,
      count: parseInt(reaction.count),
      users,
      userReacted: currentUserId ? users.includes(currentUserId) : false,
    });
  }

  return reactionCounts.sort((a, b) => b.count - a.count);
}

export async function getUserReactions(
  messageId: string,
  userId: string,
): Promise<string[]> {
  const reactions = await reactionRepo()
    .find({
      where: { messageId, userId },
    })
    .then((rs) => rs.map((r) => r.emoji));

  return reactions;
}

export async function getReactionSummary(messageIds: string[]): Promise<
  Record<
    string,
    {
      emoji: string;
      count: number;
    }[]
  >
> {
  const reactions = await reactionRepo()
    .createQueryBuilder("r")
    .select("r.messageId", "messageId")
    .addSelect("r.emoji", "emoji")
    .addSelect("COUNT(r.id)", "count")
    .whereInIds(messageIds)
    .groupBy("r.messageId, r.emoji")
    .getRawMany();

  const summary: Record<string, { emoji: string; count: number }[]> = {};

  for (const reaction of reactions) {
    if (!summary[reaction.messageId]) {
      summary[reaction.messageId] = [];
    }
    summary[reaction.messageId].push({
      emoji: reaction.emoji,
      count: parseInt(reaction.count),
    });
  }

  return summary;
}
