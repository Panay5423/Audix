import express from "express";
import dotenv from "dotenv";
import router from "./modules/user/user.routes.js";
import cors from "cors";
dotenv.config();
const app = express();

app.use(cors({
    origin: "http://localhost:4200"
}));

app.use(cors());
app.get("/", (req, res) => {
    res.send("hello from server")

})
app.use('/api', router)


export default app