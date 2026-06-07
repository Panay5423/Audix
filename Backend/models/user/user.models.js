import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    spotifyId: {
        type: String,
        required: true,
        unique: true
    },
    account_id: {
        type: String,
        unique: true,
        sparse: true
    },
    country: String,
    displayName: String,
    email: String,
    explicit_content: {
        filter_enabled: { type: Boolean, default: false },
        filter_locked: { type: Boolean, default: false }
    },
    external_urls: {
        spotify: String
    },
    followers: {
        href: String,
        total: Number
    },
    href: String,
    images: [{
        url: String,
        height: Number,
        width: Number
    }],
    product: String,
    type: String,
    uri: String,

    spotifyAccessToken: String,
    spotifyRefreshToken: String

}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);