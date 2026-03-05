import { prisma } from "../config/prisma";

const MESSAGES_PER_PAGE = 50;

export const messageService = {
  async getByChannel(channelId: string, cursor?: string) {
    const messages = await prisma.message.findMany({
      where: { channelId, deleted: false },
      take: MESSAGES_PER_PAGE,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    return {
      messages: messages.reverse(),
      nextCursor: messages.length === MESSAGES_PER_PAGE ? messages[0]?.id : null,
    };
  },

  async create(channelId: string, authorId: string, content: string) {
    return prisma.message.create({
      data: { content, channelId, authorId },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });
  },

  async delete(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new Error("Message not found");
    if (message.authorId !== userId) throw new Error("Not authorized");
    return prisma.message.update({
      where: { id: messageId },
      data: { deleted: true, content: "[Message deleted]" },
    });
  },
};
