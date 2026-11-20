import User from "../models/user/user.models.js";
import { getSpotifyCredentials } from "../config/spotifyScopes.js";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_BASE_API = "https://api.spotify.com/v1";

/**
 * Refreshes the Spotify access token for a given user document or spotifyId
 */
export const refreshSpotifyToken = async (user) => {
    try {
        if (!user.spotifyRefreshToken) {
            throw new Error("No Spotify refresh token available. User must re-authenticate.");
        }

        const credentials = getSpotifyCredentials();
        const response = await fetch(SPOTIFY_TOKEN_URL, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: user.spotifyRefreshToken
            })
        });

        const text = await response.text();
        let data = null;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(text || `Token refresh failed with HTTP status ${response.status}`);
        }

        if (!response.ok || !data.access_token) {
            console.error("Spotify token refresh failed:", data || text);
            throw new Error(data?.error_description || data?.error || text || "Failed to refresh Spotify token");
        }

        user.spotifyAccessToken = data.access_token;
        if (data.refresh_token) {
            user.spotifyRefreshToken = data.refresh_token;
        }
        const expiresInSeconds = data.expires_in || 3600;
        user.spotifyTokenExpiresAt = new Date(Date.now() + (expiresInSeconds - 60) * 1000); // 1 min buffer

        await user.save();
        console.log(`[SpotifyAuth] Refreshed Spotify token for user ${user.spotifyId}`);
        return user.spotifyAccessToken;
    } catch (error) {
        console.error(`[SpotifyAuth] Error in refreshSpotifyToken:`, error.message);
        throw error;
    }
};

/**
 * Returns a valid, non-expired Spotify access token for the user.
 */
export const getValidSpotifyToken = async (userIdOrUser) => {
    let user = userIdOrUser;
    if (typeof userIdOrUser === "string") {
        user = await User.findOne({ spotifyId: userIdOrUser });
        if (!user) {
            throw new Error("User not found");
        }
    }

    if (!user.spotifyAccessToken) {
        throw new Error("User has no Spotify access token. Please re-authenticate.");
    }

    // Check expiration buffer (if token expires in < 2 minutes or already expired)
    const now = new Date();
    if (user.spotifyTokenExpiresAt && user.spotifyTokenExpiresAt <= now) {
        return await refreshSpotifyToken(user);
    }

    return user.spotifyAccessToken;
};

/**
 * Authenticated Spotify API caller with automatic 401 retry & token refresh
 */
export const fetchSpotifyApi = async (user, endpoint, options = {}) => {
    let token = await getValidSpotifyToken(user);
    const url = endpoint.startsWith("http") ? endpoint : `${SPOTIFY_BASE_API}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    let response = await fetch(url, {
        ...options,
        headers
    });

    // If 401 Unauthorized, attempt refresh once and retry
    if (response.status === 401) {
        console.warn("[SpotifyAuth] Received 401 from Spotify API, refreshing token and retrying...");
        token = await refreshSpotifyToken(user);
        headers["Authorization"] = `Bearer ${token}`;
        response = await fetch(url, {
            ...options,
            headers
        });
    }

    // 204 No Content (common in player pause/play/next commands)
    if (response.status === 204) {
        return { success: true, status: 204 };
    }

    const contentType = response.headers.get("content-type");
    let data = null;
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        const text = await response.text();
        data = text ? { raw: text } : { success: response.ok };
    }

    if (!response.ok) {
        const errorMsg = data?.error?.message || data?.error_description || `Spotify API error (${response.status})`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};
