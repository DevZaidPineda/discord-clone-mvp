import { Router } from "express";
import { messageController } from "../controllers/message.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/:channelId", messageController.getByChannel);

export default router;
