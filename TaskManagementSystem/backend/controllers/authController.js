import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
        user.profileImageURL = req.body.profileImageURL || user.profileImageURL;
        
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

export {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
};