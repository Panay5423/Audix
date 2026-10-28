import env from "dotenv";
env.config();

//scope
const spotify_scopes =
    [
        "user-read-email",
        "user-read-private",


        //playback 
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing",

        //recently played
        "user-read-recently-played",

        //Top Artists & Tracks
        "user-top-read",

        //Follow
        "user-follow-read",
        "user-follow-modify",

        //Library
        "user-library-read",
        "user-library-modify",

        //Playlists
        "playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-private",
        "playlist-modify-public",

        //Playback Position
        "user-read-playback-position",

        //Spotify Connect SDK
        "streaming",

        //Images
        "ugc-image-upload",


    ]


//authorization url 

const authorization_url = process.env.SPOTIFY_AUTHORIZATION_URL;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const redirect_url = process.env.SPOTIFY_REDIRECT_URI;
const response_type = "code";

const spotify_auth_url =
    authorization_url +
    'client_id=' + client_id +
    '&response_type=' + response_type +
    '&redirect_uri=' + redirect_url +
    '&scope=' + spotify_scopes.join(' ') +
    '&show_dialog=true';



// credentials
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const Client_ID = process.env.Client_ID;
const credentials = Buffer.from(`${Client_ID}:${client_secret}`).toString('base64');




export { spotify_auth_url, credentials }
