import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthPayload } from "../middleware/auth";

export interface AuthenticatedSocket extends Socket {
  user?: AuthPayload;
}

export function socketAuthMiddleware(socket: AuthenticatedSocket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication required"));
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
}
