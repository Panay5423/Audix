import mongoose from "mongoose";

const connect_DB = async () => {


    try {
        await mongoose.connect(process.env.MONGO_URI, {
        });
        console.log(" MongoDB connectedddddd");
    } catch (error) {
        console.error(" DB connection error:", error.message);
        process.exit(1);
    }
}

export default connect_DB;