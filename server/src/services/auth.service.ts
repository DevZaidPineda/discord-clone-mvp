import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function generateToken(userId: string, username: string) {
  return jwt.sign({ userId, username }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

const userSelect = { id: true, email: true, username: true, avatarUrl: true, createdAt: true };

export const authService = {
  async register(data: z.infer<typeof registerSchema>) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) {
      throw new Error(existing.email === data.email ? "Email already registered" : "Username already taken");
    }
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { email: data.email, username: data.username, password: hashedPassword },
      select: userSelect,
    });
    return { user, token: generateToken(user.id, user.username) };
  },

  async login(data: z.infer<typeof loginSchema>) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new Error("Invalid credentials");
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new Error("Invalid credentials");
    return {
      user: { id: user.id, email: user.email, username: user.username, avatarUrl: user.avatarUrl },
      token: generateToken(user.id, user.username),
    };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
    if (!user) throw new Error("User not found");
    return user;
  },
};
