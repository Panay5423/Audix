import { getSpotifyCredentials } from "../../config/spotifyScopes.js";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_BASE_API = "https://api.spotify.com/v1";

const exchangeCodeForTokens = async (code) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.Client_ID;
    const redirectUrl = process.env.SPOTIFY_REDIRECT_URI || process.env.redirect_url || "http://localhost:5000/api/auth/spotify/callback";
    const credentials = getSpotifyCredentials();

    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUrl,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error_description || data.error || "Token exchange failed");
    }

    return data;
};

const Getuser = async (accessToken) => {
    const response = await fetch(`${SPOTIFY_BASE_API}/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || `Spotify profile request failed: ${response.status}`);
    }

    return data;
};

export { exchangeCodeForTokens, Getuser };
