import express from "express";
const router = express.Router();


import user_router from "./modules/user/user.routes.js";



router.use('/auth', user_router);

export default router;  
