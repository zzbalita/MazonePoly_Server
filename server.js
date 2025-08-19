// server.js
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");

// Tạo HTTP server từ Express app
const server = http.createServer(app);

// Khởi tạo socket.io với CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://mazonepoly-admin.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Ghi log khi có client kết nối
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // Join user to their personal room for chat notifications
  socket.on("joinUser", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room user_${userId}`);
  });

  // Handle chat typing indicators
  socket.on("typing", (data) => {
    socket.to(`user_${data.userId}`).emit("userTyping", {
      sessionId: data.sessionId,
      isTyping: true
    });
  });

  socket.on("stopTyping", (data) => {
    socket.to(`user_${data.userId}`).emit("userTyping", {
      sessionId: data.sessionId,
      isTyping: false
    });
  });

  // Handle joining specific chat sessions
  socket.on("joinChatSession", (data) => {
    socket.join(`chat_${data.sessionId}`);
    console.log(`💬 Socket ${socket.id} joined chat session ${data.sessionId}`);
  });

  socket.on("leaveChatSession", (data) => {
    socket.leave(`chat_${data.sessionId}`);
    console.log(`💬 Socket ${socket.id} left chat session ${data.sessionId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// Gắn `io` vào app để dùng được trong controller
app.set("io", io);

// Lắng nghe port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
