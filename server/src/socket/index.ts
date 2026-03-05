import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { socketAuthMiddleware, AuthenticatedSocket } from "./auth.socket";
import { registerChatHandlers } from "./handlers/chatHandler";
import { registerVoiceHandlers } from "./handlers/voiceHandler";

export function setupSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Auth middleware for all socket connections
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`🔌 Connected: ${socket.user?.username} (${socket.id})`);

    // Register all event handlers
    registerChatHandlers(io, socket);
    registerVoiceHandlers(io, socket);

    // Join a personal room for direct notifications
    socket.join(`user:${socket.user!.userId}`);

    socket.on("disconnect", () => {
      console.log(`❌ Disconnected: ${socket.user?.username}`);
    });
  });

  return io;
}
