import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connect_DB = async () => {


    try {
        console.log(process.env.MONGO_URL)
        await mongoose.connect(process.env.MONGO_URL, {
        });
        console.log(" MongoDB connectedddddd");
    } catch (error) {
        console.error(" DB connection error:", error.message);
        process.exit(1);
    }
}

export default connect_DB;