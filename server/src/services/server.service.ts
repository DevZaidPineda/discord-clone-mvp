import { prisma } from "../config/prisma";
import crypto from "crypto";

function generateInviteCode() {
  return crypto.randomBytes(4).toString("hex");
}

export const serverService = {
  async create(name: string, userId: string) {
    return prisma.server.create({
      data: {
        name,
        inviteCode: generateInviteCode(),
        ownerId: userId,
        channels: { create: [{ name: "general" }] },
        members: { create: [{ userId, role: "ADMIN" }] },
      },
      include: {
        channels: true,
        members: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
      },
    });
  },

  async getByUser(userId: string) {
    return prisma.server.findMany({
      where: { members: { some: { userId } } },
      include: {
        channels: { orderBy: { createdAt: "asc" } },
        members: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  async getById(serverId: string, userId: string) {
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      include: {
        channels: { orderBy: { createdAt: "asc" } },
        members: {
          include: { user: { select: { id: true, username: true, avatarUrl: true } } },
          orderBy: { joinedAt: "asc" },
        },
      },
    });
    if (!server) throw new Error("Server not found");
    const isMember = server.members.some((m) => m.userId === userId);
    if (!isMember) throw new Error("Not a member of this server");
    return server;
  },

  async joinByInvite(inviteCode: string, userId: string) {
    const server = await prisma.server.findUnique({ where: { inviteCode } });
    if (!server) throw new Error("Invalid invite code");

    const existing = await prisma.serverMember.findUnique({
      where: { userId_serverId: { userId, serverId: server.id } },
    });
    if (existing) throw new Error("Already a member");

    await prisma.serverMember.create({
      data: { userId, serverId: server.id, role: "MEMBER" },
    });

    return prisma.server.findUnique({
      where: { id: server.id },
      include: {
        channels: { orderBy: { createdAt: "asc" } },
        members: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
      },
    });
  },
};
