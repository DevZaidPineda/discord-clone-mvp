import { Server } from "socket.io";
import { AuthenticatedSocket } from "../auth.socket";

// Track who is in each voice channel
// Map<channelId, Map<userId, { socketId, username, muted, deafened }>>
const voiceRooms = new Map<
  string,
  Map<string, { socketId: string; username: string; muted: boolean; deafened: boolean }>
>();

function getOrCreateRoom(channelId: string) {
  if (!voiceRooms.has(channelId)) {
    voiceRooms.set(channelId, new Map());
  }
  return voiceRooms.get(channelId)!;
}

function getRoomUsers(channelId: string) {
  const room = voiceRooms.get(channelId);
  if (!room) return [];
  return Array.from(room.entries()).map(([userId, data]) => ({
    userId,
    ...data,
  }));
}

// Get which voice channel a user is currently in
function getUserCurrentVoiceChannel(userId: string): string | null {
  for (const [channelId, room] of voiceRooms) {
    if (room.has(userId)) return channelId;
  }
  return null;
}

export function registerVoiceHandlers(io: Server, socket: AuthenticatedSocket) {
  const userId = socket.user!.userId;
  const username = socket.user!.username;

  // ── Join Voice Channel ──
  socket.on("voice:join", (data: { channelId: string }) => {
    const { channelId } = data;

    // Leave any existing voice channel first
    const currentChannel = getUserCurrentVoiceChannel(userId);
    if (currentChannel) {
      leaveVoiceChannel(io, socket, currentChannel);
    }

    // Join the new voice channel
    const room = getOrCreateRoom(channelId);
    room.set(userId, { socketId: socket.id, username, muted: false, deafened: false });

    const voiceRoom = `voice:${channelId}`;
    socket.join(voiceRoom);

    // Get existing users in the room (to establish peer connections)
    const existingUsers = getRoomUsers(channelId).filter((u) => u.userId !== userId);

    // Tell the joining user about existing users
    socket.emit("voice:room-users", {
      channelId,
      users: existingUsers,
    });

    // Tell existing users about the new user
    socket.to(voiceRoom).emit("voice:user-joined", {
      channelId,
      userId,
      username,
      socketId: socket.id,
      muted: false,
      deafened: false,
    });

    // Broadcast updated voice state to the whole server
    broadcastVoiceState(io, channelId);

    console.log(`🎙️ ${username} joined voice channel ${channelId} (${room.size} users)`);
  });

  // ── Leave Voice Channel ──
  socket.on("voice:leave", (data: { channelId: string }) => {
    leaveVoiceChannel(io, socket, data.channelId);
  });

  // ── WebRTC Signaling: Offer ──
  socket.on("voice:offer", (data: { to: string; offer: RTCSessionDescriptionInit }) => {
    io.to(data.to).emit("voice:offer", {
      from: socket.id,
      fromUserId: userId,
      fromUsername: username,
      offer: data.offer,
    });
  });

  // ── WebRTC Signaling: Answer ──
  socket.on("voice:answer", (data: { to: string; answer: RTCSessionDescriptionInit }) => {
    io.to(data.to).emit("voice:answer", {
      from: socket.id,
      answer: data.answer,
    });
  });

  // ── WebRTC Signaling: ICE Candidate ──
  socket.on("voice:ice-candidate", (data: { to: string; candidate: RTCIceCandidateInit }) => {
    io.to(data.to).emit("voice:ice-candidate", {
      from: socket.id,
      candidate: data.candidate,
    });
  });

  // ── Toggle Mute ──
  socket.on("voice:toggle-mute", (data: { channelId: string; muted: boolean }) => {
    const room = voiceRooms.get(data.channelId);
    if (room?.has(userId)) {
      const userData = room.get(userId)!;
      userData.muted = data.muted;
      room.set(userId, userData);

      socket.to(`voice:${data.channelId}`).emit("voice:user-muted", {
        userId,
        muted: data.muted,
      });

      broadcastVoiceState(io, data.channelId);
    }
  });

  // ── Toggle Deafen ──
  socket.on("voice:toggle-deafen", (data: { channelId: string; deafened: boolean }) => {
    const room = voiceRooms.get(data.channelId);
    if (room?.has(userId)) {
      const userData = room.get(userId)!;
      userData.deafened = data.deafened;
      // Deafening also mutes
      if (data.deafened) userData.muted = true;
      room.set(userId, userData);

      socket.to(`voice:${data.channelId}`).emit("voice:user-deafened", {
        userId,
        deafened: data.deafened,
        muted: userData.muted,
      });

      broadcastVoiceState(io, data.channelId);
    }
  });

  // ── Disconnect: clean up voice state ──
  socket.on("disconnect", () => {
    const channelId = getUserCurrentVoiceChannel(userId);
    if (channelId) {
      leaveVoiceChannel(io, socket, channelId);
    }
  });
}

function leaveVoiceChannel(io: Server, socket: AuthenticatedSocket, channelId: string) {
  const room = voiceRooms.get(channelId);
  if (!room) return;

  const userId = socket.user!.userId;
  const username = socket.user!.username;

  room.delete(userId);
  socket.leave(`voice:${channelId}`);

  // Notify others
  socket.to(`voice:${channelId}`).emit("voice:user-left", {
    channelId,
    userId,
    socketId: socket.id,
  });

  // Clean up empty rooms
  if (room.size === 0) {
    voiceRooms.delete(channelId);
  }

  broadcastVoiceState(io, channelId);

  console.log(`🔇 ${username} left voice channel ${channelId}`);
}

function broadcastVoiceState(io: Server, channelId: string) {
  // Broadcast to everyone (not just voice room) so the sidebar updates
  io.emit("voice:state-update", {
    channelId,
    users: getRoomUsers(channelId),
  });
}

// Export for external access to voice state
export function getVoiceRoomUsers(channelId: string) {
  return getRoomUsers(channelId);
}
