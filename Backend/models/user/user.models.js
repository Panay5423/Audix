import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    spotifyId: {
        type: String,
        required: true,
        unique: true
    },

    displayName: String,
    email: String,

    spotifyAccessToken: String,
    spotifyRefreshToken: String

}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);