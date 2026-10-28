import jwt from "jsonwebtoken";
import { credentials } from "../../config/spotifyScopes.js";

const exchangeCodeForTokens = async (code) => {

    const authorization_code = code;
    const get_token_URl = process.env.get_token_URl
    const Client_ID = process.env.Client_ID;
    const redirect_url = process.env.redirect_url;


    const payload = {
        method: 'POST',
        headers: {
            "Authorization": `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: Client_ID,
            grant_type: 'authorization_code',
            code: authorization_code,
            redirect_uri: redirect_url,

        }),
    }


    const response = await fetch(get_token_URl, payload);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error_description || data.error || "Token exchange failed"
        );
    }

    return data;

}

const Getuser = async (access_token) => {
    const spotify_base_api = process.env.spotify_base_api;
    const get_user_url = `${spotify_base_api}/me`;

    const response = await fetch(get_user_url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error?.message || `Spotify profile request failed: ${response.status}`
        );
    }

    return data;
};


export { exchangeCodeForTokens, Getuser };


