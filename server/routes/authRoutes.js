import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js"; // Middleware to protect routes
import { getUserProfile, loginUser, registerUser, updateUserProfile, forgotPassword, resetPassword, validateResetToken } from "../controllers/authController.js";
import multer from "multer";

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Auth Routes
router.post("/register", registerUser); // Register User
router.post("/login", loginUser); // Login User
router.get("/profile", protect, getUserProfile); // Get User Profile
router.put("/profile", protect, upload.single('profileImage'), updateUserProfile); // Update User Profile
router.post("/forgot-password", forgotPassword); // Forgot Password
router.post("/reset-password", resetPassword); // Reset Password
router.get("/reset-password/validate", validateResetToken); // Validate Reset Token
router.post("/upload-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const imageURL = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
    }`;
    res.status(200).json({ imageURL });
});

export default router;