import express from "express";
import { acessToken, spotifyCallback } from "./user.controller.js";
const router = express.Router();

router.get('/acess-token', acessToken);
router.get('/spotify/callback', spotifyCallback);
export default router;
