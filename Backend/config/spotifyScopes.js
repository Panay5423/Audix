import dotenv from "dotenv";
dotenv.config();

// Spotify Scopes
export const spotify_scopes = [
    // User profile & email
    "user-read-email",
    "user-read-private",

    // Playback state & control
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",

    // Listening history
    "user-read-recently-played",

    // Top Artists & Tracks
    "user-top-read",

    // Follow
    "user-follow-read",
    "user-follow-modify",

    // Library (saved music)
    "user-library-read",
    "user-library-modify",

    // Playlists
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "playlist-modify-public",

    // Playback Position
    "user-read-playback-position",

    // Spotify Connect Web Playback SDK
    "streaming",

    // Images
    "ugc-image-upload"
];

export const getSpotifyAuthUrl = () => {
    const authEndpoint = process.env.SPOTIFY_AUTHORIZATION_URL || "https://accounts.spotify.com/authorize";
    const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.Client_ID || "";
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || process.env.redirect_url || "http://localhost:5000/api/auth/spotify/callback";
    const responseType = "code";

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: responseType,
        redirect_uri: redirectUri,
        scope: spotify_scopes.join(" "),
        show_dialog: "true"
    });

    return `${authEndpoint}?${params.toString()}`;
};

export const getSpotifyCredentials = () => {
    const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.Client_ID || "";
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
    return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
};

// Backwards compatibility export
export const spotify_auth_url = getSpotifyAuthUrl();
export const credentials = getSpotifyCredentials();
