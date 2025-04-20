import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to protect routes
const protect = async (req, res, next) => {
    try {
            let token =  req.headers.authorization;
            if (token && token.startsWith("Bearer")) {
                token = token.split(" ")[1]; // [1] to get the token part
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select("-password"); // Exclude password from the user object
                next(); // Proceed to the next middleware or route handler
            }
            else {
                res.status(401).json(
                    { 
                        message: "Not authorized, no token" 
                    }
                );
            }
    }
    catch (error) {
        res.status(401).json(
            { 
                message: "Token failed", 
                error: error.message 
            }
        );
    }
};

// Middleware for Admin-only access
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next(); // Proceed to the next middleware or route handler
    } else {
        res.status(403).json(
            { 
                message: "Access denied, admin only" 
            }
        );
    }
}

// Middleware to restrict access to specific roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "You need to be logged in to access this resource"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You do not have permission to perform this action"
            });
        }

        next();
    };
};

export { protect, adminOnly, restrictTo };