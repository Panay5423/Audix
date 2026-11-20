import express from "express";
import { authenticateuser } from "../../middleware/auth.middleware.js";
import {
    chat,
    getChatHistory,
    generatePlaylist,
    savePlaylistToSpotify,
    getTasteAnalysis
} from "./ai.controller.js";

const router = express.Router();

router.use(authenticateuser);

router.post("/chat", chat);
router.get("/chat/history", getChatHistory);
router.post("/generate-playlist", generatePlaylist);
router.post("/save-playlist", savePlaylistToSpotify);
router.get("/taste-analysis", getTasteAnalysis);

export default router;
