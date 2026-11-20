import express from "express";
import user_router from "./modules/user/user.routes.js";
import spotify_router from "./modules/spotify/spotify.routes.js";
import ai_router from "./modules/ai/ai.routes.js";
import analytics_router from "./modules/analytics/analytics.routes.js";

const router = express.Router();

router.get("/health", (req, res) => {
    res.json({
        status: "ok",
        platform: "Audix AI Music Engine",
        timestamp: new Date().toISOString()
    });
});

router.use("/auth", user_router);
router.use("/spotify", spotify_router);
router.use("/ai", ai_router);
router.use("/analytics", analytics_router);

export default router;
