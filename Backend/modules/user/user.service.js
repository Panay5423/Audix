import jwt from "jsonwebtoken";

const refreshToken = async (code) => {

    const authorization_code = code;
    const get_token_URl = process.env.get_token_URl
    const Client_ID = process.env.Client_ID;
    const redirect_url = process.env.redirect_url;
    const Client_SECRET = process.env.Client_SECRET;
    const credentials = Buffer
        .from(`${Client_ID}:${Client_SECRET}`)
        .toString('base64');


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


    const Data = await fetch(get_token_URl, payload);

    const responseText = await Data.text();

    console.log("TOKEN STATUS:", Data.status);
    console.log("TOKEN CONTENT TYPE:", Data.headers.get("content-type"));
    console.log("TOKEN RESPONSE:", responseText);

    let Data_JSON;

    try {
        Data_JSON = JSON.parse(responseText);
    } catch (error) {
        console.error("Spotify token API returned non-JSON response");
        throw new Error(
            `Token exchange failed with status ${Data.status}`
        );
    }

    return Data_JSON;

    return Data_JSON;

}

const Getuser = async (access_token) => {
    const spotify_base_api = process.env.spotify_base_api;
    const get_user_url = `${spotify_base_api}/me`;

    const user_data = await fetch(get_user_url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    const responseText = await user_data.text();

    console.log("Profile status:", user_data.status);
    console.log("Profile response:", responseText);

    if (!user_data.ok) {
        throw new Error(
            `Spotify profile request failed: ${user_data.status}`
        );
    }

    try {
        return JSON.parse(responseText);
    } catch {
        throw new Error("Spotify profile response is not valid JSON");
    }
};

export { refreshToken, Getuser };


