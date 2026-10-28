import express from "express";
import { Authorization, spotifyCallback, getUserProfile } from "./user.controller.js";
import { authenticateuser } from "../../middleware/auth.middleware.js";
const router = express.Router();

router.get('/authorization', Authorization);
router.get('/spotify/callback', spotifyCallback);
router.get('/user', authenticateuser, getUserProfile);
export default router;
