require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const app = require("./src/app");
const connectDb = require("./src/config/Db");
const Message = require("./src/models/message.model");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },
});

// ── 🔒 JWT Auth Middleware for Socket.IO ────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded; // attach decoded user to socket
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

// Track userId → socketId for online presence
const onlineUsers = {};

// Helper: create a deterministic room name for 2 users (order-independent)
function getRoomId(userA, userB) {
  return [userA, userB].sort().join("_");
}

io.on("connection", (socket) => {

  console.log("🟢 Socket Connected:", socket.id);

  // ── Step 1: User registers themselves (login) ─────────────────────────────
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    socket.userId = userId; // store on socket for disconnect cleanup
    console.log(`✅ User ${userId} online. Online users:`, Object.keys(onlineUsers));
  });

  // ── Step 2: User opens a chat with someone → join that room ───────────────
  socket.on("joinRoom", ({ userId, receiverId }) => {
    const roomId = getRoomId(userId, receiverId);
    socket.join(roomId);
    console.log(`🏠 Socket ${socket.id} joined room: ${roomId}`);
    // Acknowledge the room to the client
    socket.emit("roomJoined", { roomId });
  });

  // ── Step 3: Send a message ────────────────────────────────────────────────
  socket.on("sendMessage", async (data) => {
    const { sender, receiver, message, clientMsgId } = data;
    const roomId = getRoomId(sender, receiver);

    try {
      // 💾 Save to MongoDB
      const newMessage = await Message.create({ sender, receiver, message });
      console.log(`💾 Message saved to DB: ${newMessage._id}`);

      // 📡 Send the real (DB) message to EVERYONE in the room (both sender & receiver)
      // Include clientMsgId so the sender can replace their optimistic bubble
      io.to(roomId).emit("receiveMessage", {
        ...newMessage.toObject(),
        clientMsgId, // frontend uses this to swap optimistic → real
      });

    } catch (error) {
      console.error("❌ Error saving message:", error.message);
      // Notify sender about failure
      socket.emit("messageFailed", { clientMsgId, error: error.message });
    }
  });

  // ── Disconnect ────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const userId = socket.userId;
    if (userId && onlineUsers[userId] === socket.id) {
      delete onlineUsers[userId];
      console.log(`🔴 User ${userId} went offline.`);
    }
  });
});

// Connect DB and start server
connectDb()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log("❌ MongoDB Connection Failed:", error);
  });