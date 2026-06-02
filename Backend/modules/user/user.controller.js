import env from "dotenv";
env.config();
const acessToken = async (req, res) => {

    const client_id = process.env.Client_ID;
    const redirect_uri = process.env.redirect_uri;
    console.log("acessToken")
    console.log("client", client_id)
    console.log("URL", redirect_uri)
    const response_type = "code"
    const Spotify_auth_URL =
        'https://accounts.spotify.com/authorize?' +
        'client_id=' + client_id +
        '&response_type=' + response_type +
        '&redirect_uri=' + encodeURIComponent(redirect_uri);

    res.json({
        url: Spotify_auth_URL
    }
    )

}
export default acessToken;

