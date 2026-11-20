import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            return callback(null, true);
        }
        return callback(null, true); // Permissive in local dev
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token", "X-Requested-With"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({
        message: "Audix Backend API is online",
        docs: "/api/health"
    });
});

app.use("/api", router);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Audix Server Error:", err.stack || err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error occurred",
        error: process.env.NODE_ENV === "development" ? err : {}
    });
});

export default app;
