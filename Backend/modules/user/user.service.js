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
    const Data_JSON = await Data.json();


    return Data_JSON;

}

const Getuser = async (access_token) => {


    const spotify_base_api = process.env.spotify_base_api;
    const get_user_url = spotify_base_api + '/me';
    const payload = {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${access_token}`,
        }
    };

    const user_data = await fetch(get_user_url, payload);

    const user_data_jason = await user_data.jason();

    console.log("RESPONSE:", user_data_jason);
    return user_data_jason;
}

export { refreshToken, Getuser };   