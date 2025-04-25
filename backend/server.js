import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables early
dotenv.config();

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import bugRoutes from "./routes/bugRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import attachmentRoutes from "./routes/attachmentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// Initialize express app
const app = express();

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware to handle CORS
app.use(
    cors({ 
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Middleware to parse JSON requests
app.use(express.json());

// Connect Database
connectDB();

// Display system startup information
const displaySystemInfo = () => {
    console.log("\n=== Task Management System API ===");
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server Port: ${process.env.PORT || 8000}`);
    console.log(`Client URL: ${process.env.CLIENT_URL || '*'}`);
    
    // Email configuration status
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log("Email Service: Configured - emails will be sent");
    } else {
        console.log("Email Service: Not configured - emails will be logged to console only");
        console.log("To enable email sending, set EMAIL_USER and EMAIL_PASSWORD environment variables");
    }
    
    // JWT status
    if (process.env.JWT_SECRET) {
        console.log("JWT Secret: Configured");
    } else {
        console.log("JWT Secret: Missing - using default insecure secret (not recommended for production)");
    }

    console.log("===================================\n");
};

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/chats", chatRoutes);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ 
        status: "ok", 
        time: new Date().toISOString(),
        emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
    });
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    displaySystemInfo();
});