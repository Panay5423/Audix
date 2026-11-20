import express from "express";
import { authenticateuser } from "../../middleware/auth.middleware.js";
import {
    getProfile,
    getTopTracks,
    getTopArtists,
    getRecentlyPlayed,
    getSavedTracks,
    checkSavedTracks,
    saveTracks,
    removeSavedTracks,
    getUserPlaylists,
    getPlaylist,
    getPlaylistTracks,
    createPlaylist,
    addTracksToPlaylist,
    removeTracksFromPlaylist,
    updatePlaylist,
    search,
    getArtist,
    getAlbum,
    getFeaturedPlaylists,
    getNewReleases,
    getCategories,
    getCategoryPlaylists,
    getRecommendations,
    getPlaybackState,
    getAvailableDevices,
    play,
    pause,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    transferPlayback
} from "./spotify.controller.js";

const router = express.Router();

// Require authentication for all Spotify API routes
router.use(authenticateuser);

// User Spotify endpoints
router.get("/me", getProfile);
router.get("/top-tracks", getTopTracks);
router.get("/top-artists", getTopArtists);
router.get("/recently-played", getRecentlyPlayed);
router.get("/saved-tracks", getSavedTracks);
router.get("/saved-tracks/check", checkSavedTracks);
router.put("/saved-tracks", saveTracks);
router.delete("/saved-tracks", removeSavedTracks);

// Playlists
router.get("/playlists", getUserPlaylists);
router.get("/playlists/:id", getPlaylist);
router.get("/playlists/:id/tracks", getPlaylistTracks);
router.post("/playlists", createPlaylist);
router.post("/playlists/:id/tracks", addTracksToPlaylist);
router.delete("/playlists/:id/tracks", removeTracksFromPlaylist);
router.put("/playlists/:id", updatePlaylist);

// Discovery & Search
router.get("/search", search);
router.get("/artists/:id", getArtist);
router.get("/albums/:id", getAlbum);
router.get("/featured-playlists", getFeaturedPlaylists);
router.get("/new-releases", getNewReleases);
router.get("/categories", getCategories);
router.get("/categories/:id/playlists", getCategoryPlaylists);
router.get("/recommendations", getRecommendations);

// Player & Playback controls
router.get("/player/state", getPlaybackState);
router.get("/player/devices", getAvailableDevices);
router.put("/player/play", play);
router.put("/player/pause", pause);
router.post("/player/next", nextTrack);
router.post("/player/previous", previousTrack);
router.put("/player/seek", seek);
router.put("/player/volume", setVolume);
router.put("/player/transfer", transferPlayback);

export default router;
