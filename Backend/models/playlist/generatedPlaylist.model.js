import mongoose from "mongoose";

const generatedPlaylistSchema = new mongoose.Schema({
    userId: {
        type: String, // Spotify ID
        required: true,
        index: true
    },
    prompt: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    genreTags: [String],
    mood: String,
    spotifyPlaylistId: String,
    spotifyPlaylistUrl: String,
    isSavedToSpotify: {
        type: Boolean,
        default: false
    },
    tracks: [{
        spotifyId: String,
        name: String,
        artist: String,
        album: String,
        albumCover: String,
        durationMs: Number,
        uri: String,
        previewUrl: String
    }]
}, {
    timestamps: true
});

export default mongoose.models.GeneratedPlaylist || mongoose.model("GeneratedPlaylist", generatedPlaylistSchema);
