import { Request, Response } from "express";
import { messageService } from "../services/message.service";

export const messageController = {
  async getByChannel(req: Request, res: Response) {
    try {
      const { channelId } = req.params;
      const cursor = req.query.cursor as string | undefined;
      const result = await messageService.getByChannel(channelId, cursor);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
