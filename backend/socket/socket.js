// socketServer.js or server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

// CORS for REST API
app.use(
  cors({
    origin: "https://chat-app-static-wtt5.onrender.com", // Your frontend domain
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Optional: parse incoming JSON requests
app.use(express.json());

// HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "https://chat-app-static-wtt5.onrender.com", // Your frontend domain
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // { userId: socketId }

// Function to get socket ID of a specific user
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("🔌 New socket connection:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`✅ User ${userId} connected with socket ID: ${socket.id}`);
  }

  // Send list of online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnection
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      console.log(`❌ User ${userId} disconnected`);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Test API route
app.get("/", (req, res) => {
  res.send("✅ Socket.IO server is running!");
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export { app, io, server };
