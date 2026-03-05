import { Request, Response } from "express";
import { serverService } from "../services/server.service";

export const serverController = {
  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name?.trim()) { res.status(400).json({ error: "Server name is required" }); return; }
      const server = await serverService.create(name.trim(), req.user!.userId);
      res.status(201).json(server);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async getMyServers(req: Request, res: Response) {
    try {
      const servers = await serverService.getByUser(req.user!.userId);
      res.json(servers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const server = await serverService.getById(req.params.serverId, req.user!.userId);
      res.json(server);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },

  async join(req: Request, res: Response) {
    try {
      const { inviteCode } = req.body;
      if (!inviteCode) { res.status(400).json({ error: "Invite code is required" }); return; }
      const server = await serverService.joinByInvite(inviteCode, req.user!.userId);
      res.json(server);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};
