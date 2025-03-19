import express from "express"
import cors from "cors"
import http from "http"   // required for WebSockets
import {Server} from "socket.io"    // import socket.io
import dotenv from "dotenv"

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import bugRoutes from "./routes/bugRoutes.js"
import commentRoutes from "./routes/commentRoutes.js"
import reportRoutes from "./routes/reportRoutes.js"

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server for WebSocket
const io = new Server(server, { cors: { origin: "*" } }); // WebSocket server

app.use(express.json());
app.use(cors());

// connect to mongoDB
connectDB()

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Share `io` instance with routes, now routes can use WebSockets
app.set("io", io);

// Routes
// Without these, API requests like GET /api/bugs won’t work.
app.use("/api/comments", commentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/reports", reportRoutes);

// wraping all routes in a universal error handler so that errors don’t crash the server.
// 🔥 Global Error Handler (Prevents Crashes)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
