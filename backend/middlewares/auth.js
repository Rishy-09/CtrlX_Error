import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1]; // Get the token part
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password"); // Exclude password
            next();
        } else {
            res.status(401).json({ 
                message: "Not authorized, no token" 
            });
        }
    } catch (error) {
        res.status(401).json({ 
            message: "Token failed", 
            error: error.message 
        });
    }
};

// Role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized, no user" });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role ${req.user.role} is not authorized to access this resource` 
            });
        }
        
        next();
    };
};

export default {
    verifyToken,
    authorize
}; 