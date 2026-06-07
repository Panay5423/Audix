import env from "dotenv";
import { refreshToken, Getuser } from "./user.service.js";
import userModels from "../../models/user/user.models.js";
env.config();
const Authorization = async (req, res) => {

    const client_id = process.env.Client_ID;
    const redirect_url = process.env.redirect_url;
    const authorization_url = process.env.authorization_url;

    const scopes = [
        "user-read-email",
        "user-read-private"
    ];

    const response_type = "code";

    const Spotify_auth_URL =
        authorization_url +
        'client_id=' + client_id +
        '&response_type=' + response_type +
        '&redirect_uri=' + encodeURIComponent(redirect_url) +
        '&scope=' + encodeURIComponent(scopes.join(' ')) +
        '&show_dialog=true';
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

    const Data = await refreshToken(code);
    const access_token = Data.access_token;
    const refresh_token = Data.refresh_token;

    const user = await Getuser(access_token);

    const updateFields = {
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
        spotifyRefreshToken: refresh_token
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

    res.redirect(`http://localhost:4200/dashboard?spotifyId=${user.id}`);

}

const getUserProfile = async (req, res) => {
    try {
        const { spotifyId } = req.params;
        const user = await userModels.findOne({ spotifyId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { Authorization, spotifyCallback, getUserProfile };
