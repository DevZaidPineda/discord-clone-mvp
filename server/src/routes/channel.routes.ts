import { Router } from "express";
import { channelController } from "../controllers/channel.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.post("/:serverId", channelController.create);
router.get("/:serverId", channelController.getByServer);
router.delete("/:channelId", channelController.delete);

export default router;
