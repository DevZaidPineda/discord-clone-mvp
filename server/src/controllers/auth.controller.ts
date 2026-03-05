import { Request, Response } from "express";
import { authService, registerSchema, loginSchema } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  },

  async getMe(req: Request, res: Response) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json(user);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },
};
