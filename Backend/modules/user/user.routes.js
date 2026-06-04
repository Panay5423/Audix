import express from "express";
import { Authorization, spotifyCallback } from "./user.controller.js";
const router = express.Router();

router.get('/authorization', Authorization);
router.get('/spotify/callback', spotifyCallback);
export default router;
