import express from "express";
import { authenticateuser } from "../../middleware/auth.middleware.js";
import { getAnalytics } from "./analytics.controller.js";

const router = express.Router();

router.use(authenticateuser);
router.get("/", getAnalytics);

export default router;
