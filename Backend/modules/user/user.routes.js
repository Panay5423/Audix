import express from "express";
import { Authorization, spotifyCallback, getUserProfile } from "./user.controller.js";
const router = express.Router();

router.get('/authorization', Authorization);
router.get('/spotify/callback', spotifyCallback);
router.get('/user/:spotifyId', getUserProfile);
export default router;
