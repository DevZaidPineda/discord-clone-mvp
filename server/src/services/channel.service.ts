import { prisma } from "../config/prisma";

export const channelService = {
  async create(serverId: string, name: string, userId: string, type: "TEXT" | "VOICE" = "TEXT") {
    // Verify user is admin/mod of server
    const member = await prisma.serverMember.findUnique({
      where: { userId_serverId: { userId, serverId } },
    });
    if (!member) throw new Error("Not a member of this server");
    if (member.role === "MEMBER") throw new Error("Only admins/mods can create channels");

    return prisma.channel.create({
      data: { name: name.toLowerCase().replace(/\s+/g, "-"), serverId, type },
    });
  },

  async getByServer(serverId: string) {
    return prisma.channel.findMany({
      where: { serverId },
      orderBy: { createdAt: "asc" },
    });
  },

  async getById(channelId: string) {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { server: { select: { id: true, name: true } } },
    });
    if (!channel) throw new Error("Channel not found");
    return channel;
  },

  async delete(channelId: string, userId: string) {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { server: true },
    });
    if (!channel) throw new Error("Channel not found");
    if (channel.name === "general") throw new Error("Cannot delete the general channel");

    const member = await prisma.serverMember.findUnique({
      where: { userId_serverId: { userId, serverId: channel.serverId } },
    });
    if (!member || member.role === "MEMBER") throw new Error("Not authorized");

    return prisma.channel.delete({ where: { id: channelId } });
  },
};
