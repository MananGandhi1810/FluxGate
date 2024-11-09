import { Router } from "express";
import { checkAuth } from "../middleware/auth.js";
import {
    getAllProjectsHandler,
    getProjectByIdHandler,
    getProjectStatusHandler,
    newProjectHandler,
    newProjectWithChatHandler,
    startProjectHandler,
    stopProjectHandler,
    getContainerPortHandler,
} from "../handlers/project.js";
import { incomingWebhookHandler } from "../handlers/webhook.js";
const router = Router();

router.post("/:projectId/hooks/", incomingWebhookHandler);

router.use(checkAuth);
router.get("/", getAllProjectsHandler);
router.get("/:projectId", getProjectByIdHandler);
router.post("/new", newProjectHandler);
router.post("/newWithChat", newProjectWithChatHandler);
router.post("/:projectId/start", startProjectHandler);
router.post("/:projectId/stop", stopProjectHandler);
router.get("/:projectId/status", getProjectStatusHandler);
router.get("/:projectId/port", getContainerPortHandler);

export default router;
