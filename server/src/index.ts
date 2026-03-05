import express from "express";
import cors from "cors";
import { createServer } from "http";
import { env } from "./config/env";
import { corsOptions } from "./config/cors";
import { errorHandler } from "./middleware/errorHandler";
import { setupSocket } from "./socket";

// Routes
import authRoutes from "./routes/auth.routes";
import serverRoutes from "./routes/server.routes";
import channelRoutes from "./routes/channel.routes";
import messageRoutes from "./routes/message.routes";

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Setup Socket.io
const io = setupSocket(httpServer);

// Start server
httpServer.listen(env.PORT, () => {
  console.log(`
  🚀 Server running on http://localhost:${env.PORT}
  📡 Socket.io ready
  🗄️  Database connected
  `);
});

export { io };
