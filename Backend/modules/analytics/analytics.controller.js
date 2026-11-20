import analyticsService from "./analytics.service.js";

export const getAnalytics = async (req, res) => {
    try {
        const { time_range = "medium_term" } = req.query;
        const data = await analyticsService.getUserAnalytics(req.user, { time_range });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
