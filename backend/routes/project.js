import { Router } from "express";
import { checkAuth } from "../middleware/auth.js";
import {
    getAllProjectsHandler,
    getProjectByIdHandler,
    newProjectHandler,
    newProjectWithChatHandler,
} from "../handlers/project.js";
import { incomingWebhookHandler } from "../handlers/webhook.js";
const router = Router();

router.post("/:projectId/hooks/", incomingWebhookHandler);

router.use(checkAuth);
router.get("/", getAllProjectsHandler);
router.get("/:projectId", getProjectByIdHandler);
router.post("/new", newProjectHandler);
router.post("/newWithChat", newProjectWithChatHandler);

export default router;
