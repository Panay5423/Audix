import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
    // Check for token in cookies first, then fallback to Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
        console.log(token)
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains userId
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};
