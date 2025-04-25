import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { 
            id: userId
        }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: "7d",
        }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, adminInviteToken, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Validate role - must be one of the allowed roles
        const allowedRoles = ["admin", "developer", "tester"];
        let userRole = role && allowedRoles.includes(role) ? role : "tester";

        // Validate admin invite token only if the role is admin
        if (userRole === "admin") {
            if (!adminInviteToken || adminInviteToken !== process.env.ADMIN_INVITE_TOKEN) {
                return res.status(400).json({ message: "Invalid admin invite token" });
            }
        }
        // For other roles, adminInviteToken is optional and ignored

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Handle profile image upload if file was sent
        let profileImageURL = '';
        if (req.file) {
            try {
                // Generate a unique filename
                const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
                
                // Get the upload path with normalized path for cross-platform support
                const uploadDir = path.resolve(process.cwd(), 'uploads', 'profiles');
                const uploadPath = path.join(uploadDir, filename);
                
                // Make sure the directory exists
                await fs.mkdir(uploadDir, { recursive: true });
                
                // Save the file
                await fs.writeFile(uploadPath, req.file.buffer);
                
                // Set the profile image URL - use consistent path separator
                const serverPort = process.env.PORT || 8000;
                const baseUrl = process.env.BASE_URL || `http://localhost:${serverPort}`;
                profileImageURL = `${baseUrl}/uploads/profiles/${filename}`;
                
                console.log(`Profile image saved at: ${uploadPath}`);
            } catch (uploadError) {
                console.error('Error saving profile image during registration:', uploadError);
                // Continue with registration even if image upload fails
            }
        }

        // Create new user
        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword, 
            profileImageURL, 
            role: userRole 
        });

        // Return user data with JWT
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageURL: user.profileImageURL,
            role: user.role,
            token: generateToken(user._id),
        });
    } 
    catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message 
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Update last login time
        user.lastLogin = Date.now();
        await user.save();

        // Return user data with JWT
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageURL: user.profileImageURL,
            role: user.role,
            token: generateToken(user._id),
        });
    } 
    catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message 
        });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private (Requires JWT)
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password"); // Exclude password from the user object
        if (!user){
            return res.status(404).json(
                {
                    message: "User not found"
                }
            );
        }
        res.json(
            {
                user
            }
        );

    } 
    catch (error) {
        res.status(500).json(
            { 
                message: "Server Error", 
                error: error.message 
            }
        );
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private (Requires JWT)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user){
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        
        // Handle profile image upload if file was sent
        if (req.file) {
            try {
                // Generate a unique filename
                const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
                
                // Get the upload path with normalized path for cross-platform support
                const uploadDir = path.resolve(process.cwd(), 'uploads', 'profiles');
                const uploadPath = path.join(uploadDir, filename);
                
                // Make sure the directory exists
                await fs.mkdir(uploadDir, { recursive: true });
                
                // Save the file
                await fs.writeFile(uploadPath, req.file.buffer);
                
                // Set the profile image URL - use consistent path separator
                const serverPort = process.env.PORT || 8000;
                const baseUrl = process.env.BASE_URL || `http://localhost:${serverPort}`;
                user.profileImageURL = `${baseUrl}/uploads/profiles/${filename}`;
                
                console.log(`Profile image saved at: ${uploadPath}`);
            } catch (uploadError) {
                console.error('Error saving profile image:', uploadError);
                // Continue with the update even if image upload fails
            }
        } else if (req.body.profileImageURL) {
            user.profileImageURL = req.body.profileImageURL;
        }
        
        if (req.body.password) {
            // Hash password if provided
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImageURL: updatedUser.profileImageURL,
            role: updatedUser.role,
            notificationSettings: updatedUser.notificationSettings,
            token: generateToken(updatedUser._id),
        });
    } 
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message 
        });
    }
};

// @desc    Forgot Password - Send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Log the received email in development mode
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Forgot password request for email: ${email}`);
        }

        // Find the user
        const user = await User.findOne({ email });
        if (!user) {
            // We don't want to reveal if the email exists or not for security reasons
            return res.status(200).json({ 
                message: "If your email is registered, you will receive password reset instructions" 
            });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

        // Save the reset token and expiry to the user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Create reset URL
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password/${resetToken}?email=${encodeURIComponent(email)}`;

        // Email content
        const emailContent = {
            to: email.trim(), // Ensure email is trimmed of any whitespace
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset</h1>
                <p>You requested a password reset for your Task Management System account.</p>
                <p>Please click the link below to reset your password. This link is valid for 1 hour.</p>
                <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Reset Password</a>
                <p>If you did not request this reset, please ignore this email and your password will remain unchanged.</p>
            `,
            // Plain text version as fallback
            text: `
                Password Reset
                
                You requested a password reset for your Task Management System account.
                
                Please use the following link to reset your password (valid for 1 hour):
                ${resetUrl}
                
                If you did not request this reset, please ignore this email and your password will remain unchanged.
            `
        };

        // Send the email using our email service
        const emailResult = await sendEmail(emailContent);

        // Log the email sending result in development mode
        if (process.env.NODE_ENV !== 'production') {
            console.log('Email sending result:', {
                success: emailResult.success,
                recipient: email,
                info: emailResult.info ? 'Email info available' : 'No email info'
            });
        }

        // Response for production (secure)
        if (process.env.NODE_ENV === 'production') {
            return res.status(200).json({ 
                message: "If your email is registered, you will receive password reset instructions" 
            });
        }

        // More detailed response for development
        return res.status(200).json({ 
            message: "Password reset link generated successfully",
            success: emailResult.success,
            resetUrl: resetUrl,
            resetToken: resetToken,
            emailStatus: emailResult.success ? "sent" : "not_sent",
            note: emailResult.success ? 
                "Email sent successfully. Check your inbox." : 
                "Email sending skipped or failed. Use the direct reset link for testing."
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message 
        });
    }
};

// @desc    Validate reset token
// @route   GET /api/auth/reset-password/validate
// @access  Public
const validateResetToken = async (req, res) => {
    try {
        const { token, email } = req.query;
        
        if (!token || !email) {
            return res.status(400).json({ message: "Token and email are required" });
        }

        const user = await User.findOne({
            email,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        res.status(200).json({ valid: true });
    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message 
        });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token, email, password, currentPassword, newPassword } = req.body;
        
        // Check if this is a reset password request (with token) or a change password request (with user authentication)
        if (token && email) {
            // Password reset flow using token
            if (!password) {
                return res.status(400).json({ message: "Password is required" });
            }

            const user = await User.findOne({
                email,
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ message: "Invalid or expired reset token" });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            
            // Clear reset token fields
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            
            await user.save();

            res.status(200).json({ message: "Password has been reset successfully" });
        } else if (req.user && currentPassword && newPassword) {
            // Change password flow for authenticated user
            const user = await User.findById(req.user._id);
            
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            
            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }
            
            // Hash and save new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            
            res.status(200).json({ message: "Password has been changed successfully" });
        } else {
            return res.status(400).json({ 
                message: "Invalid request. Either provide token and email, or be authenticated and provide currentPassword and newPassword" 
            });
        }
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message 
        });
    }
};

export {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    validateResetToken
};