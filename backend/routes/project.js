import { Router } from "express";
import { checkAuth } from "../middleware/auth.js";
import {
    newProjectHandler,
    newProjectWithChatHandler,
} from "../handlers/project.js";
const router = Router();

router.use(checkAuth);

router.post("/new", newProjectHandler);
router.post("/newWithChat", newProjectWithChatHandler);

export default router;
