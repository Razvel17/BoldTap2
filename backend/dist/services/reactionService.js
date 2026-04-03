"use strict";
// Reaction Service
// Handles message reactions and emoji
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReaction = addReaction;
exports.removeReaction = removeReaction;
exports.getReactions = getReactions;
exports.getUserReactions = getUserReactions;
exports.getReactionSummary = getReactionSummary;
const database_1 = require("../config/database");
const MessageReaction_1 = require("../entities/MessageReaction");
const reactionRepo = () => database_1.AppDataSource.getRepository(MessageReaction_1.MessageReaction);
async function addReaction(messageId, userId, emoji) {
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
async function removeReaction(messageId, userId, emoji) {
    await reactionRepo().delete({
        messageId,
        userId,
        emoji,
    });
}
async function getReactions(messageId, currentUserId) {
    const reactions = await reactionRepo()
        .createQueryBuilder("r")
        .select("r.emoji", "emoji")
        .addSelect("COUNT(DISTINCT r.userId)", "count")
        .where("r.messageId = :messageId", { messageId })
        .groupBy("r.emoji")
        .getRawMany();
    const reactionCounts = [];
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
async function getUserReactions(messageId, userId) {
    const reactions = await reactionRepo()
        .find({
        where: { messageId, userId },
    })
        .then((rs) => rs.map((r) => r.emoji));
    return reactions;
}
async function getReactionSummary(messageIds) {
    const reactions = await reactionRepo()
        .createQueryBuilder("r")
        .select("r.messageId", "messageId")
        .addSelect("r.emoji", "emoji")
        .addSelect("COUNT(r.id)", "count")
        .whereInIds(messageIds)
        .groupBy("r.messageId, r.emoji")
        .getRawMany();
    const summary = {};
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
//# sourceMappingURL=reactionService.js.map