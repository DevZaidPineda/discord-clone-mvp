import { Request, Response } from "express";
import { channelService } from "../services/channel.service";

export const channelController = {
  async create(req: Request, res: Response) {
    try {
      const { name, type } = req.body;
      const { serverId } = req.params;
      if (!name?.trim()) { res.status(400).json({ error: "Channel name is required" }); return; }
      const channelType = type === "VOICE" ? "VOICE" : "TEXT";
      const channel = await channelService.create(serverId, name.trim(), req.user!.userId, channelType);
      res.status(201).json(channel);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async getByServer(req: Request, res: Response) {
    try {
      const channels = await channelService.getByServer(req.params.serverId);
      res.json(channels);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await channelService.delete(req.params.channelId, req.user!.userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};
