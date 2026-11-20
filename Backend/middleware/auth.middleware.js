import jwt from "jsonwebtoken";
import User from "../models/user/user.models.js";

export const authenticateuser = async (req, res, next) => {
    try {
        let token = null;

        // 1. Try HttpOnly Cookie
        if (req.cookies && req.cookies.audix_jwt) {
            token = req.cookies.audix_jwt;
        }

        // 2. Try Authorization: Bearer <token>
        if (!token && req.headers?.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // 3. Try legacy custom token header
        if (!token && req.headers?.token) {
            token = req.headers.token;
        }

        if (!token) {
            return res.status(401).json({
                message: "Authentication required. Please connect your Spotify account."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "audix_default_jwt_secret_key");
        const spotifyId = decoded.userId || decoded.spotifyId;

        const user = await User.findOne({ spotifyId });
        if (!user) {
            return res.status(401).json({ message: "Audix user session not found. Please log in again." });
        }

        req.user = user;
        req.userId = user.spotifyId;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        }
        return res.status(403).json({ message: "Invalid authentication token." });
    }
};

export const requireAuth = authenticateuser;
