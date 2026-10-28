import env from "dotenv";
import jwt from "jsonwebtoken";
import { exchangeCodeForTokens, Getuser } from "./user.service.js";
import userModels from "../../models/user/user.models.js";
import { spotify_auth_url } from "../../config/spotifyScopes.js";
env.config();

const Authorization = async (req, res) => {
    res.json({
        url: spotify_auth_url
    });

};

const spotifyCallback = async (req, res) => {

    const code = req.query.code;


    if (!code) {
        return res.status(400).json({ message: "Authorization code is missing" });
    }

    const Data = await exchangeCodeForTokens(code);
    if (!Data || Data.error || !Data.access_token) {
        console.error("Token exchange failed:", Data);
        return res.redirect(`http://localhost:4200/login?error=token_exchange_failed`);
    }

    const access_token = Data.access_token;
    const refresh_token = Data.refresh_token;

    const user = await Getuser(access_token);
    console.log("user fatch:", user)

    if (!user || user.error || !user.id) {
        console.error("Failed to fetch Spotify user profile:", user);
        return res.redirect(`http://localhost:4200/login?error=profile_fetch_failed`);
    }

    const token = jwt.sign(
        {
            userId: user.id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
    console.log("get the user and create the token", token);
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
        dbUser = new userModels({
            spotifyId: user.id,
            ...updateFields
        });
    } else {
        Object.assign(dbUser, updateFields);
    }

    const save_user = await dbUser.save();

    res.redirect(`http://localhost:4200/dashboard?token=${token}`);

}

const getUserProfile = async (req, res) => {
    try {
        const spotifyId = req.userId;

        const user = await userModels.findOne({ spotifyId }).select("-spotifyAccessToken -spotifyRefreshToken -JWT_token");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { Authorization, spotifyCallback, getUserProfile };
