import { Router } from "express";
import { serverController } from "../controllers/server.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.post("/", serverController.create);
router.get("/", serverController.getMyServers);
router.get("/:serverId", serverController.getById);
router.post("/join", serverController.join);

export default router;
