import jwt from "jsonwebtoken";
import { exchangeCodeForTokens, Getuser } from "./user.service.js";
import User from "../../models/user/user.models.js";
import { getSpotifyAuthUrl } from "../../config/spotifyScopes.js";
import { getValidSpotifyToken } from "../../services/spotifyToken.service.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4200";

const Authorization = async (req, res) => {
    try {
        const url = getSpotifyAuthUrl();
        res.json({ url });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate authorization URL", error: error.message });
    }
};

const spotifyCallback = async (req, res) => {
    const code = req.query.code;
    const errorParam = req.query.error;

    if (errorParam) {
        console.error("Spotify OAuth error:", errorParam);
        return res.redirect(`${FRONTEND_URL}/home?error=${encodeURIComponent(errorParam)}`);
    }

    if (!code) {
        return res.redirect(`${FRONTEND_URL}/home?error=authorization_code_missing`);
    }

    try {
        const tokenData = await exchangeCodeForTokens(code);
        if (!tokenData || !tokenData.access_token) {
            console.error("Token exchange failed:", tokenData);
            return res.redirect(`${FRONTEND_URL}/home?error=token_exchange_failed`);
        }

        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        const expiresIn = tokenData.expires_in || 3600;

        const spotifyProfile = await Getuser(accessToken);
        if (!spotifyProfile || !spotifyProfile.id) {
            console.error("Failed to fetch Spotify user profile:", spotifyProfile);
            return res.redirect(`${FRONTEND_URL}/home?error=profile_fetch_failed`);
        }

        const jwtSecret = process.env.JWT_SECRET || "audix_default_jwt_secret_key";
        const token = jwt.sign(
            { userId: spotifyProfile.id, spotifyId: spotifyProfile.id },
            jwtSecret,
            { expiresIn: "7d" }
        );

        const tokenExpiresAt = new Date(Date.now() + (expiresIn - 60) * 1000);

        const updateFields = {
            spotifyId: spotifyProfile.id,
            displayName: spotifyProfile.display_name,
            email: spotifyProfile.email,
            country: spotifyProfile.country,
            explicit_content: spotifyProfile.explicit_content,
            external_urls: spotifyProfile.external_urls,
            followers: spotifyProfile.followers,
            href: spotifyProfile.href,
            images: spotifyProfile.images,
            product: spotifyProfile.product,
            type: spotifyProfile.type,
            uri: spotifyProfile.uri,
            spotifyAccessToken: accessToken,
            spotifyTokenExpiresAt: tokenExpiresAt,
            JWT_token: token
        };

        if (refreshToken) {
            updateFields.spotifyRefreshToken = refreshToken;
        }

        let dbUser = await User.findOne({ spotifyId: spotifyProfile.id });

        if (!dbUser) {
            dbUser = new User(updateFields);
        } else {
            Object.assign(dbUser, updateFields);
        }

        await dbUser.save();

        // Set HttpOnly cookie for Audix session
        res.cookie("audix_jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Redirect to dashboard with token query parameter for frontend storage
        res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
    } catch (err) {
        console.error("Error during Spotify callback:", err);
        res.redirect(`${FRONTEND_URL}/home?error=${encodeURIComponent(err.message)}`);
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = req.user;
        const sanitized = user.toObject();
        delete sanitized.spotifyAccessToken;
        delete sanitized.spotifyRefreshToken;
        delete sanitized.JWT_token;

        res.json(sanitized);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSdkToken = async (req, res) => {
    try {
        const accessToken = await getValidSpotifyToken(req.user);
        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: "Failed to get active Spotify token", error: error.message });
    }
};

const updatePreferences = async (req, res) => {
    try {
        const user = req.user;
        const { preferredTheme, autoPlayRecommendations, discoveryDegree } = req.body;

        if (!user.preferences) user.preferences = {};
        if (preferredTheme) user.preferences.preferredTheme = preferredTheme;
        if (typeof autoPlayRecommendations === "boolean") user.preferences.autoPlayRecommendations = autoPlayRecommendations;
        if (typeof discoveryDegree === "number") user.preferences.discoveryDegree = discoveryDegree;

        await user.save();
        res.json({ success: true, preferences: user.preferences });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logout = async (req, res) => {
    res.clearCookie("audix_jwt");
    res.json({ success: true, message: "Logged out successfully" });
};

export {
    Authorization,
    spotifyCallback,
    getUserProfile,
    getSdkToken,
    updatePreferences,
    logout
};
