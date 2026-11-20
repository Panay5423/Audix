import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    spotifyId: {
        type: String,
        required: true,
        unique: true,
        index: true
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
        total: { type: Number, default: 0 }
    },
    href: String,
    images: [{
        url: String,
        height: Number,
        width: Number
    }],
    product: {
        type: String,
        default: 'free'
    },
    type: {
        type: String,
        default: 'user'
    },
    uri: String,

    spotifyAccessToken: String,
    spotifyRefreshToken: String,
    spotifyTokenExpiresAt: Date,
    JWT_token: String,

    preferences: {
        preferredTheme: { type: String, default: 'purple' },
        autoPlayRecommendations: { type: Boolean, default: false },
        discoveryDegree: { type: Number, default: 50 } // 0 = comfort, 100 = wild discovery
    }
}, {
    timestamps: true
});

export default mongoose.models.User || mongoose.model("User", userSchema);
