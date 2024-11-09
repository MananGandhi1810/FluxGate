import { Router } from "express";
import {
    githubCallbackHandler,
    accessTokenHandler,
    userHandler,
    getRepositoriesHandler,
} from "../handlers/auth.js";
import { checkAuth } from "../middleware/auth.js";

var router = Router();

router.get("/gh-callback", githubCallbackHandler);
router.post("/get-access-token", accessTokenHandler);
router.get("/user", checkAuth, userHandler);
router.get("/user/repositories", checkAuth, getRepositoriesHandler);

export default router;
