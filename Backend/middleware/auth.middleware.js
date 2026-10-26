import jwt from "jsonwebtoken";

export const authenticateuser = (req, res, next) => {
    const token = req.cookies?.JWT_token;

    if (!token) {
        return res.status(401).json({ message: "Please login first" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};