import { fetchSpotifyApi } from "../../services/spotifyToken.service.js";

class SpotifyService {
    // Current user profile
    async getProfile(user) {
        return await fetchSpotifyApi(user, "/me");
    }

    // Top tracks (time_range: short_term (4 weeks), medium_term (6 months), long_term (all time))
    async getTopTracks(user, { time_range = "medium_term", limit = 20, offset = 0 } = {}) {
        return await fetchSpotifyApi(user, `/me/top/tracks?time_range=${time_range}&limit=${limit}&offset=${offset}`);
    }

    // Top artists
    async getTopArtists(user, { time_range = "medium_term", limit = 20, offset = 0 } = {}) {
        return await fetchSpotifyApi(user, `/me/top/artists?time_range=${time_range}&limit=${limit}&offset=${offset}`);
    }

    // Recently played tracks
    async getRecentlyPlayed(user, { limit = 20 } = {}) {
        return await fetchSpotifyApi(user, `/me/player/recently-played?limit=${limit}`);
    }

    // Saved (liked) tracks
    async getSavedTracks(user, { limit = 20, offset = 0 } = {}) {
        return await fetchSpotifyApi(user, `/me/tracks?limit=${limit}&offset=${offset}`);
    }

    // Check if tracks are saved in user's library
    async checkSavedTracks(user, ids) {
        return await fetchSpotifyApi(user, `/me/tracks/contains?ids=${ids.join(",")}`);
    }

    // Save (like) tracks
    async saveTracks(user, ids) {
        return await fetchSpotifyApi(user, `/me/tracks?ids=${ids.join(",")}`, { method: "PUT" });
    }

    // Remove (unlike) tracks
    async removeSavedTracks(user, ids) {
        return await fetchSpotifyApi(user, `/me/tracks?ids=${ids.join(",")}`, { method: "DELETE" });
    }

    // User's playlists
    async getUserPlaylists(user, { limit = 30, offset = 0 } = {}) {
        return await fetchSpotifyApi(user, `/me/playlists?limit=${limit}&offset=${offset}`);
    }

    // Specific playlist details
    async getPlaylist(user, playlistId) {
        return await fetchSpotifyApi(user, `/playlists/${playlistId}`);
    }

    // Specific playlist tracks
    async getPlaylistTracks(user, playlistId, { limit = 50, offset = 0 } = {}) {
        return await fetchSpotifyApi(user, `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
    }

    // Create a new playlist
    async createPlaylist(user, { name, description = "Created with Audix AI", isPublic = false }) {
        return await fetchSpotifyApi(user, `/users/${user.spotifyId}/playlists`, {
            method: "POST",
            body: JSON.stringify({
                name,
                description,
                public: isPublic
            })
        });
    }

    // Add tracks to playlist
    async addTracksToPlaylist(user, playlistId, uris) {
        return await fetchSpotifyApi(user, `/playlists/${playlistId}/tracks`, {
            method: "POST",
            body: JSON.stringify({
                uris
            })
        });
    }

    // Remove tracks from playlist
    async removeTracksFromPlaylist(user, playlistId, uris) {
        const tracks = uris.map(uri => ({ uri }));
        return await fetchSpotifyApi(user, `/playlists/${playlistId}/tracks`, {
            method: "DELETE",
            body: JSON.stringify({
                tracks
            })
        });
    }

    // Update playlist details
    async updatePlaylistDetails(user, playlistId, { name, description, isPublic }) {
        const payload = {};
        if (name !== undefined) payload.name = name;
        if (description !== undefined) payload.description = description;
        if (isPublic !== undefined) payload.public = isPublic;

        return await fetchSpotifyApi(user, `/playlists/${playlistId}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
    }

    // Unified Search
    async search(user, query, { types = ["track", "artist", "album", "playlist"], limit = 10, offset = 0 } = {}) {
        const typeString = Array.isArray(types) ? types.join(",") : types;
        const q = encodeURIComponent(query);
        return await fetchSpotifyApi(user, `/search?q=${q}&type=${typeString}&limit=${limit}&offset=${offset}`);
    }

    // Artist Profile
    async getArtist(user, artistId) {
        return await fetchSpotifyApi(user, `/artists/${artistId}`);
    }

    // Artist Top Tracks
    async getArtistTopTracks(user, artistId, market = "from_token") {
        return await fetchSpotifyApi(user, `/artists/${artistId}/top-tracks?market=${market}`);
    }

    // Artist Albums
    async getArtistAlbums(user, artistId, { limit = 20, offset = 0 } = {}) {
        return await fetchSpotifyApi(user, `/artists/${artistId}/albums?include_groups=album,single&limit=${limit}&offset=${offset}`);
    }

    // Related Artists
    async getRelatedArtists(user, artistId) {
        return await fetchSpotifyApi(user, `/artists/${artistId}/related-artists`);
    }

    // Album details
    async getAlbum(user, albumId) {
        return await fetchSpotifyApi(user, `/albums/${albumId}`);
    }

    // Featured playlists / New releases / Categories
    async getFeaturedPlaylists(user, { limit = 15 } = {}) {
        return await fetchSpotifyApi(user, `/browse/featured-playlists?limit=${limit}`);
    }

    async getNewReleases(user, { limit = 15 } = {}) {
        return await fetchSpotifyApi(user, `/browse/new-releases?limit=${limit}`);
    }

    async getCategories(user, { limit = 20 } = {}) {
        return await fetchSpotifyApi(user, `/browse/categories?limit=${limit}`);
    }

    async getCategoryPlaylists(user, categoryId, { limit = 15 } = {}) {
        return await fetchSpotifyApi(user, `/browse/categories/${categoryId}/playlists?limit=${limit}`);
    }

    // Recommendations
    async getRecommendations(user, { seed_artists = "", seed_genres = "", seed_tracks = "", limit = 20, target_energy, target_valence } = {}) {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (seed_artists) params.append("seed_artists", seed_artists);
        if (seed_genres) params.append("seed_genres", seed_genres);
        if (seed_tracks) params.append("seed_tracks", seed_tracks);
        if (target_energy !== undefined) params.append("target_energy", target_energy.toString());
        if (target_valence !== undefined) params.append("target_valence", target_valence.toString());

        return await fetchSpotifyApi(user, `/recommendations?${params.toString()}`);
    }

    // Player controls
    async getPlaybackState(user) {
        try {
            return await fetchSpotifyApi(user, "/me/player");
        } catch (error) {
            if (error.status === 204 || error.status === 404) return null;
            throw error;
        }
    }

    async getAvailableDevices(user) {
        return await fetchSpotifyApi(user, "/me/player/devices");
    }

    async play(user, { uris, context_uri, offset, device_id } = {}) {
        const query = device_id ? `?device_id=${device_id}` : "";
        const body = {};
        if (uris) body.uris = uris;
        if (context_uri) body.context_uri = context_uri;
        if (offset !== undefined) body.offset = offset;

        return await fetchSpotifyApi(user, `/me/player/play${query}`, {
            method: "PUT",
            body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
        });
    }

    async pause(user, device_id) {
        const query = device_id ? `?device_id=${device_id}` : "";
        return await fetchSpotifyApi(user, `/me/player/pause${query}`, { method: "PUT" });
    }

    async next(user, device_id) {
        const query = device_id ? `?device_id=${device_id}` : "";
        return await fetchSpotifyApi(user, `/me/player/next${query}`, { method: "POST" });
    }

    async previous(user, device_id) {
        const query = device_id ? `?device_id=${device_id}` : "";
        return await fetchSpotifyApi(user, `/me/player/previous${query}`, { method: "POST" });
    }

    async seek(user, position_ms, device_id) {
        const query = new URLSearchParams({ position_ms: position_ms.toString() });
        if (device_id) query.append("device_id", device_id);
        return await fetchSpotifyApi(user, `/me/player/seek?${query.toString()}`, { method: "PUT" });
    }

    async setVolume(user, volume_percent, device_id) {
        const query = new URLSearchParams({ volume_percent: volume_percent.toString() });
        if (device_id) query.append("device_id", device_id);
        return await fetchSpotifyApi(user, `/me/player/volume?${query.toString()}`, { method: "PUT" });
    }

    async transferPlayback(user, device_id, play = true) {
        return await fetchSpotifyApi(user, "/me/player", {
            method: "PUT",
            body: JSON.stringify({
                device_ids: [device_id],
                play
            })
        });
    }
}

export default new SpotifyService();
