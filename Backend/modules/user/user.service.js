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

    const text = await response.text();
    let data = null;

    try {
        data = JSON.parse(text);
    } catch (parseErr) {
        console.error("Spotify Token API returned non-JSON response:", text);
        if (text.toLowerCase().includes("user is not registered") || text.toLowerCase().includes("user is not allowed")) {
            throw new Error("Spotify Developer Mode restriction: Your Spotify account is not added under 'User Management' in the Spotify Developer Dashboard. Please add your Spotify email there.");
        }
        throw new Error(text || `Token exchange failed with HTTP status ${response.status}`);
    }

    if (!response.ok) {
        const errorDesc = data.error_description || data.error || "Token exchange failed";
        if (typeof errorDesc === "string" && errorDesc.toLowerCase().includes("user is not registered")) {
            throw new Error("Spotify Developer Mode: Your Spotify account must be added in the Developer Dashboard under 'User Management'.");
        }
        throw new Error(errorDesc);
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

    const text = await response.text();
    let data = null;

    try {
        data = JSON.parse(text);
    } catch (parseErr) {
        console.error("Spotify Profile API returned non-JSON response:", text);
        if (text.toLowerCase().includes("user is not registered") || text.toLowerCase().includes("user is not allowed")) {
            throw new Error("Spotify Developer Mode restriction: Your Spotify account is not registered under 'User Management' in the Spotify Developer Dashboard.");
        }
        throw new Error(text || `Spotify profile request failed: ${response.status}`);
    }

    if (!response.ok) {
        const errorMsg = data.error?.message || `Spotify profile request failed: ${response.status}`;
        if (typeof errorMsg === "string" && errorMsg.toLowerCase().includes("user is not registered")) {
            throw new Error("Spotify Developer Mode restriction: Your Spotify account is not added in the Spotify Developer Dashboard under User Management.");
        }
        throw new Error(errorMsg);
    }

    return data;
};

export { exchangeCodeForTokens, Getuser };
