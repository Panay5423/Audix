import aiService from "./ai.service.js";

export const chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Message prompt is required" });
        }

        const result = await aiService.chat(req.user, message.trim());
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const history = await aiService.getChatHistory(req.user);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const generatePlaylist = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ message: "Playlist prompt is required" });
        }

        const playlist = await aiService.generatePlaylist(req.user, prompt.trim());
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const savePlaylistToSpotify = async (req, res) => {
    try {
        const { playlistId } = req.body;
        if (!playlistId) {
            return res.status(400).json({ message: "Generated playlist ID is required" });
        }

        const result = await aiService.savePlaylistToSpotify(req.user, playlistId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTasteAnalysis = async (req, res) => {
    try {
        const analysis = await aiService.generateTasteAnalysis(req.user);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
