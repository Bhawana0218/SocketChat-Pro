import { Router } from "express";
import { messageController } from "../controllers/message.controller";
import { healthController } from "../controllers/health.controller";

const router = Router();

router.get("/health", healthController.healthCheck);
router.get("/messages", messageController.getMessages);
router.get("/messages/private", messageController.getPrivateMessages);
router.post("/messages", messageController.sendMessage);

export default router;
