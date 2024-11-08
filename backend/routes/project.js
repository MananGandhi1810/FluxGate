import { Router } from "express";
import { checkAuth } from "../middleware/auth.js";
import { newProjectHandler } from "../handlers/project.js";
const router = Router();

router.use(checkAuth);

router.post("/new", newProjectHandler);

export default router;
