import app from "./app.js";
import connect_DB from "./config/connect.DB.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

connect_DB().then(() => {
    app.listen(PORT, () => {
        console.log(`Audix Backend Server running on http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error("MongoDB connection warning:", error.message);
    app.listen(PORT, () => {
        console.log(`Audix Backend Server running on http://localhost:${PORT} (limited mode)`);
    });
});
