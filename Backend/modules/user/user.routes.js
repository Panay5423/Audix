import express from "express";
import {
    Authorization,
    spotifyCallback,
    getUserProfile,
    getSdkToken,
    updatePreferences,
    logout
} from "./user.controller.js";
import { authenticateuser } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/authorization", Authorization);
router.get("/spotify/callback", spotifyCallback);
router.get("/user", authenticateuser, getUserProfile);
router.get("/me", authenticateuser, getUserProfile);
router.get("/sdk-token", authenticateuser, getSdkToken);
router.put("/preferences", authenticateuser, updatePreferences);
router.post("/logout", logout);

export default router;
