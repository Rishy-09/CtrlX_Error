import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js"; // Middleware to protect routes
import { getUserProfile, loginUser, registerUser, updateUserProfile, forgotPassword, resetPassword, validateResetToken } from "../controllers/authController.js";
import multer from "multer";
import User from "../models/User.js";

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Auth Routes
router.post("/register", upload.single('profileImage'), registerUser); // Register User
router.post("/login", loginUser); // Login User
router.get("/profile", protect, getUserProfile); // Get User Profile
router.put("/profile", protect, upload.single('profileImage'), updateUserProfile); // Update User Profile
router.post("/forgot-password", forgotPassword); // Forgot Password
router.post("/reset-password", resetPassword); // Reset Password (for public reset using token)
router.post("/reset-password/authenticated", protect, resetPassword); // Reset Password (for authenticated users)
router.get("/reset-password/validate", validateResetToken); // Validate Reset Token

// Development-only route to check reset token status (only available in dev mode)
if (process.env.NODE_ENV !== 'production') {
  router.get("/dev/reset-tokens", async (req, res) => {
    try {
      // Find users with active reset tokens
      const users = await User.find({
        resetPasswordToken: { $exists: true, $ne: null },
        resetPasswordExpires: { $gt: Date.now() }
      }).select('email resetPasswordToken resetPasswordExpires -_id');
      
      // Format the response with useful info
      const formattedTokens = users.map(user => ({
        email: user.email,
        token: user.resetPasswordToken,
        expires: new Date(user.resetPasswordExpires).toLocaleString(),
        expiresIn: Math.round((user.resetPasswordExpires - Date.now()) / 60000) + ' minutes',
        resetUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${user.resetPasswordToken}?email=${encodeURIComponent(user.email)}`
      }));
      
      res.status(200).json({
        count: formattedTokens.length,
        message: 'This endpoint is only available in development mode',
        activeTokens: formattedTokens
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reset tokens', error: error.message });
    }
  });
}

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