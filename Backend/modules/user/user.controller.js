import env from "dotenv";
import jwt from "jsonwebtoken";
import { refreshToken, Getuser } from "./user.service.js";
import userModels from "../../models/user/user.models.js";
env.config();
const Authorization = async (req, res) => {

    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const redirect_url = process.env.SPOTIFY_REDIRECT_URI;
    const authorization_url = process.env.SPOTIFY_AUTHORIZATION_URL;

    const scopes = [
        // User
        "user-read-email",
        "user-read-private",

        // Playback
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing",

        // Recently Played
        "user-read-recently-played",

        // Top Artists & Tracks
        "user-top-read",

        // Follow
        "user-follow-read",
        "user-follow-modify",

        // Library
        "user-library-read",
        "user-library-modify",

        // Playlists
        "playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-private",
        "playlist-modify-public",

        // Playback Position
        "user-read-playback-position",

        // Spotify Connect SDK
        "streaming",

        // Images
        "ugc-image-upload",


    ];
    const response_type = "code";

    console.log(redirect_url)

    const Spotify_auth_URL =
        authorization_url +
        'client_id=' + client_id +
        '&response_type=' + response_type +
        '&redirect_uri=' + redirect_url +
        '&scope=' + scopes.join(' ') +
        '&show_dialog=true';

    console.log("Spotify_auth_URL ", Spotify_auth_URL)
    res.json({
        url: Spotify_auth_URL
    });

};

const generateAccountId = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const spotifyCallback = async (req, res) => {

    const code = req.query.code;

    if (!code) {
        return res.status(400).json({ message: "Authorization code is missing" });
    }

    const Data = await refreshToken(code);



    if (!Data || Data.error || !Data.access_token) {
        console.error("Token exchange failed:", Data);
        return res.redirect(`http://localhost:4200/login?error=token_exchange_failed`);
    }

    const access_token = Data.access_token;
    const refresh_token = Data.refresh_token;

    const user = await Getuser(access_token);
    console.log("user :", user)

    if (!user || user.error || !user.id) {
        console.error("Failed to fetch Spotify user profile:", user);
        return res.redirect(`http://localhost:4200/login?error=profile_fetch_failed`);
    }

    const token = jwt.sign(
        {
            userId: user.account_id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
    const updateFields = {
        spotifyId: user.id,
        displayName: user.display_name,
        email: user.email,
        country: user.country,
        explicit_content: user.explicit_content,
        external_urls: user.external_urls,
        followers: user.followers,
        href: user.href,
        images: user.images,
        product: user.product,
        type: user.type,
        uri: user.uri,
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token,
        JWT_token: token
    };

    let dbUser = await userModels.findOne({ spotifyId: user.id });

    if (!dbUser) {
        const account_id = generateAccountId();
        dbUser = new userModels({
            spotifyId: user.id,
            account_id,
            ...updateFields
        });
    } else {
        Object.assign(dbUser, updateFields);
    }

    const save_user = await dbUser.save();

    res.cookie("JWT_token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
    });
    res.redirect(`http://localhost:4200/dashboard`);

}

const getUserProfile = async (req, res) => {
    try {
        const user = await userModels.findOne({ spotifyId });
        console.log("hgey", user)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { Authorization, spotifyCallback, getUserProfile };
