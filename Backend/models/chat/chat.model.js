import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    userId: {
        type: String, // Spotify ID
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    recommendedTracks: [{
        id: String,
        name: String,
        artists: [String],
        album: String,
        albumCover: String,
        duration_ms: Number,
        spotifyUrl: String,
        uri: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);
