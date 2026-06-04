import env from "dotenv";
import { refreshToken, Getuser } from "./user.service.js";
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

const spotifyCallback = async (req, res) => {
    const code = req.query.code;


    const Data = await refreshToken(code);
    const access_token = Data.access_token;

    const user = await Getuser(access_token);


    res.redirect(`http://localhost:4200/dashboard`)

}


export { Authorization, spotifyCallback };
