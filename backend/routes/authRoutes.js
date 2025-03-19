import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);     // open to all users
router.post("/login", loginUser);

export default router;
