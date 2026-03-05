import { Server } from "socket.io";
import { AuthenticatedSocket } from "../auth.socket";
import { messageService } from "../../services/message.service";
import { prisma } from "../../config/prisma";

export function registerChatHandlers(io: Server, socket: AuthenticatedSocket) {
  // Join a channel room
  socket.on("channel:join", async (channelId: string) => {
    // Verify the user is a member of the server that owns this channel
    try {
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: { server: { include: { members: true } } },
      });
      if (!channel) return;
      const isMember = channel.server.members.some((m) => m.userId === socket.user!.userId);
      if (!isMember) return;

      socket.join(`channel:${channelId}`);
      console.log(`📥 ${socket.user!.username} joined channel:${channelId}`);
    } catch (err) {
      console.error("Error joining channel:", err);
    }
  });

  // Leave a channel room
  socket.on("channel:leave", (channelId: string) => {
    socket.leave(`channel:${channelId}`);
    console.log(`📤 ${socket.user!.username} left channel:${channelId}`);
  });

  // Send a message
  socket.on("message:send", async (data: { channelId: string; content: string }) => {
    try {
      if (!data.content?.trim()) return;

      const message = await messageService.create(
        data.channelId,
        socket.user!.userId,
        data.content.trim()
      );

      // Broadcast to everyone in the channel room (including sender)
      io.to(`channel:${data.channelId}`).emit("message:new", message);
    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("message:typing", (data: { channelId: string }) => {
    socket.to(`channel:${data.channelId}`).emit("message:typing", {
      userId: socket.user!.userId,
      username: socket.user!.username,
    });
  });

  socket.on("message:stop-typing", (data: { channelId: string }) => {
    socket.to(`channel:${data.channelId}`).emit("message:stop-typing", {
      userId: socket.user!.userId,
    });
  });

  // Delete a message
  socket.on("message:delete", async (data: { messageId: string; channelId: string }) => {
    try {
      const message = await messageService.delete(data.messageId, socket.user!.userId);
      io.to(`channel:${data.channelId}`).emit("message:deleted", {
        messageId: data.messageId,
        channelId: data.channelId,
      });
    } catch (err) {
      socket.emit("error", { message: "Failed to delete message" });
    }
  });
}
