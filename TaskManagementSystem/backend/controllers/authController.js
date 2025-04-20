import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import nodemailer from "nodemailer";

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
        const { name, email, password, profileImageURL, adminInviteToken, role } = 
        req.body;

        // Check if user already exists
        const userExists = await User.findOne(
            { 
                email 
            }
        );
        
        if (userExists) {
            return res.status(400).json(
                { 
                    message: "User already exists" 
                }
            );
        }

        // Validate role - must be one of the allowed roles
        const allowedRoles = ["admin", "developer", "tester"];
        let userRole = role && allowedRoles.includes(role) ? role : "tester";

        // Validate admin invite token only if the role is admin
        if (userRole === "admin") {
            if (!adminInviteToken || adminInviteToken !== process.env.ADMIN_INVITE_TOKEN) {
                return res.status(400).json({ 
                    message: "Invalid admin invite token" 
                });
            }
        }
        // For other roles, adminInviteToken is optional and ignored

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create(
            { 
                name, 
                email, 
                password: hashedPassword, 
                profileImageURL, 
                role: userRole 
            }
        );

        // Return user data with JWT
        res.status(201).json(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImageURL: user.profileImageURL,
                role: user.role,
                token: generateToken(user._id),
            }
        )
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
            return res.status(404).json(
                {
                    message: "User not found"
                }
            );
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        
        // Handle profile image upload if file was sent
        if (req.file) {
            // Generate a unique filename
            const filename = `${Date.now()}-${req.file.originalname}`;
            
            // Get the upload path
            const uploadPath = path.join(__dirname, '../../uploads/profiles', filename);
            
            // Make sure the directory exists
            await fs.mkdir(path.dirname(uploadPath), { recursive: true });
            
            // Save the file
            await fs.writeFile(uploadPath, req.file.buffer);
            
            // Set the profile image URL
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            user.profileImageURL = `${baseUrl}/uploads/profiles/${filename}`;
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
            token: generateToken(updatedUser._id),
        });
    } 
    catch (error) {
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

        // Create email transport
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'no-reply@taskmanagement.com',
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset</h1>
                <p>You requested a password reset for your Task Management System account.</p>
                <p>Please click the link below to reset your password. This link is valid for 1 hour.</p>
                <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Reset Password</a>
                <p>If you did not request this reset, please ignore this email and your password will remain unchanged.</p>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Respond to client (regardless of whether user exists or not)
        res.status(200).json({ 
            message: "If your email is registered, you will receive password reset instructions" 
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
        const { token, email, password } = req.body;
        
        if (!token || !email || !password) {
            return res.status(400).json({ message: "Token, email, and password are required" });
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
    } catch (error) {
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