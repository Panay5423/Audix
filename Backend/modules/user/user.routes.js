import express from "express";
import acessToken from "./user.controller.js";
const router = express.Router();

router.get('/acess-token', acessToken);

export default router;
