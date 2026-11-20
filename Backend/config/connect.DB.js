import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connect_DB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
        if (!mongoUri) {
            console.warn("⚠️ Warning: Neither MONGODB_URI nor MONGO_URL is defined in environment variables.");
            return;
        }
        await mongoose.connect(mongoUri);
        console.log("✅ MongoDB connected successfully to Audix database");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        // Do not force process.exit(1) in development so server can provide informative diagnostics
    }
};

export default connect_DB;
