import spotifyService from "./spotify.service.js";

export const getProfile = async (req, res) => {
    try {
        const data = await spotifyService.getProfile(req.user);
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getTopTracks = async (req, res) => {
    try {
        const { time_range = "medium_term", limit = 20, offset = 0 } = req.query;
        const data = await spotifyService.getTopTracks(req.user, {
            time_range,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10)
        });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getTopArtists = async (req, res) => {
    try {
        const { time_range = "medium_term", limit = 20, offset = 0 } = req.query;
        const data = await spotifyService.getTopArtists(req.user, {
            time_range,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10)
        });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getRecentlyPlayed = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const data = await spotifyService.getRecentlyPlayed(req.user, { limit: parseInt(limit, 10) });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getSavedTracks = async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        const data = await spotifyService.getSavedTracks(req.user, {
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10)
        });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const checkSavedTracks = async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) return res.status(400).json({ message: "Track IDs are required" });
        const idList = ids.split(",");
        const data = await spotifyService.checkSavedTracks(req.user, idList);
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const saveTracks = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !ids.length) return res.status(400).json({ message: "Track IDs required" });
        const data = await spotifyService.saveTracks(req.user, ids);
        res.json({ success: true, data });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const removeSavedTracks = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !ids.length) return res.status(400).json({ message: "Track IDs required" });
        const data = await spotifyService.removeSavedTracks(req.user, ids);
        res.json({ success: true, data });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getUserPlaylists = async (req, res) => {
    try {
        const { limit = 30, offset = 0 } = req.query;
        const data = await spotifyService.getUserPlaylists(req.user, {
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10)
        });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await spotifyService.getPlaylist(req.user, id);
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getPlaylistTracks = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        const data = await spotifyService.getPlaylistTracks(req.user, id, {
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10)
        });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const createPlaylist = async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;
        if (!name) return res.status(400).json({ message: "Playlist name is required" });
        const data = await spotifyService.createPlaylist(req.user, { name, description, isPublic });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const addTracksToPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { uris } = req.body;
        if (!uris || !uris.length) return res.status(400).json({ message: "Track URIs required" });
        const data = await spotifyService.addTracksToPlaylist(req.user, id, uris);
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const removeTracksFromPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { uris } = req.body;
        if (!uris || !uris.length) return res.status(400).json({ message: "Track URIs required" });
        const data = await spotifyService.removeTracksFromPlaylist(req.user, id, uris);
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isPublic } = req.body;
        const data = await spotifyService.updatePlaylistDetails(req.user, id, { name, description, isPublic });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const search = async (req, res) => {
    try {
        const { q, type = "track,artist,album,playlist", limit = 15, offset = 0 } = req.query;
        if (!q || !q.trim()) return res.status(400).json({ message: "Search query required" });
        const data = await spotifyService.search(req.user, q, {
            types: type.split(","),
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10)
        });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const [artist, topTracks, albums, related] = await Promise.all([
            spotifyService.getArtist(req.user, id),
            spotifyService.getArtistTopTracks(req.user, id).catch(() => ({ tracks: [] })),
            spotifyService.getArtistAlbums(req.user, id, { limit: 10 }).catch(() => ({ items: [] })),
            spotifyService.getRelatedArtists(req.user, id).catch(() => ({ artists: [] }))
        ]);
        res.json({
            artist,
            topTracks: topTracks.tracks || [],
            albums: albums.items || [],
            relatedArtists: related.artists || []
        });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await spotifyService.getAlbum(req.user, id);
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getFeaturedPlaylists = async (req, res) => {
    try {
        const { limit = 15 } = req.query;
        const data = await spotifyService.getFeaturedPlaylists(req.user, { limit: parseInt(limit, 10) });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getNewReleases = async (req, res) => {
    try {
        const { limit = 15 } = req.query;
        const data = await spotifyService.getNewReleases(req.user, { limit: parseInt(limit, 10) });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getCategories = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const data = await spotifyService.getCategories(req.user, { limit: parseInt(limit, 10) });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getCategoryPlaylists = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 15 } = req.query;
        const data = await spotifyService.getCategoryPlaylists(req.user, id, { limit: parseInt(limit, 10) });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getRecommendations = async (req, res) => {
    try {
        const { seed_artists, seed_genres, seed_tracks, limit = 20, target_energy, target_valence } = req.query;
        const data = await spotifyService.getRecommendations(req.user, {
            seed_artists,
            seed_genres,
            seed_tracks,
            limit: parseInt(limit, 10),
            target_energy: target_energy ? parseFloat(target_energy) : undefined,
            target_valence: target_valence ? parseFloat(target_valence) : undefined
        });
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

// Player controls
export const getPlaybackState = async (req, res) => {
    try {
        const data = await spotifyService.getPlaybackState(req.user);
        res.json(data || { is_playing: false, item: null, device: null });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const getAvailableDevices = async (req, res) => {
    try {
        const data = await spotifyService.getAvailableDevices(req.user);
        res.json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const play = async (req, res) => {
    try {
        const { uris, context_uri, offset, device_id } = req.body;
        const data = await spotifyService.play(req.user, { uris, context_uri, offset, device_id });
        res.json({ success: true, data });
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.message || "Playback command failed. Spotify Premium or an active Spotify player device is required.",
            status: error.status,
            data: error.data
        });
    }
};

export const pause = async (req, res) => {
    try {
        const { device_id } = req.body;
        const data = await spotifyService.pause(req.user, device_id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const nextTrack = async (req, res) => {
    try {
        const { device_id } = req.body;
        const data = await spotifyService.next(req.user, device_id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const previousTrack = async (req, res) => {
    try {
        const { device_id } = req.body;
        const data = await spotifyService.previous(req.user, device_id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const seek = async (req, res) => {
    try {
        const { position_ms, device_id } = req.body;
        const data = await spotifyService.seek(req.user, position_ms, device_id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const setVolume = async (req, res) => {
    try {
        const { volume_percent, device_id } = req.body;
        const data = await spotifyService.setVolume(req.user, volume_percent, device_id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};

export const transferPlayback = async (req, res) => {
    try {
        const { device_id, play = true } = req.body;
        if (!device_id) return res.status(400).json({ message: "Device ID required" });
        const data = await spotifyService.transferPlayback(req.user, device_id, play);
        res.json({ success: true, data });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message, data: error.data });
    }
};
