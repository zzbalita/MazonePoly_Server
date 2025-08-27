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
      "https://mazonepoly-admin.vercel.app",
      "http://192.168.1.9:5002",
      "http://192.168.1.2:5002",
      "http://localhost:5002",
      "exp://192.168.1.9:8081", // Expo development server
      "exp://localhost:8081"     // Expo local development
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Ghi log khi có client kết nối
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // Join user to their personal room for chat notifications
  socket.on("joinUser", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room user_${userId}`);
    
    // Debug: Check room status
    const room = io.sockets.adapter.rooms.get(`user_${userId}`);
    console.log(`👤 Room user_${userId} now has ${room ? room.size : 0} users`);
    
    // Debug: List all rooms
    console.log('🔍 All active rooms:', Array.from(io.sockets.adapter.rooms.keys()));
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

  // Admin chat events
  socket.on("joinAdminChat", (data) => {
    const roomName = `admin_chat_${data.sessionId}`;
    socket.join(roomName);
    console.log(`👨‍💼 Admin joined admin chat room: ${roomName}`);
    console.log(`👥 Users in room ${roomName}:`, io.sockets.adapter.rooms.get(roomName)?.size || 0);
  });

  socket.on("leaveAdminChat", (data) => {
    socket.leave(`admin_chat_${data.sessionId}`);
    console.log(`👨‍💼 Admin left admin chat session ${data.sessionId}`);
  });

  // Admin connect event
  socket.on("adminConnect", (data) => {
    console.log(`👨‍💼 Admin ${data.adminId} connected`);
    socket.join('admin_room');
    console.log(`👥 Users in admin_room:`, io.sockets.adapter.rooms.get('admin_room')?.size || 0);
  });

  // User typing in admin chat
  socket.on("adminChatTyping", (data) => {
    socket.to(`admin_chat_${data.sessionId}`).emit("userTypingInAdminChat", {
      sessionId: data.sessionId,
      userId: data.userId,
      isTyping: true
    });
  });

  socket.on("adminChatStopTyping", (data) => {
    socket.to(`admin_chat_${data.sessionId}`).emit("userTypingInAdminChat", {
      sessionId: data.sessionId,
      userId: data.userId,
      isTyping: false
    });
  });

  // New user message in admin chat
  socket.on("newUserMessage", (data) => {
    const roomName = `admin_chat_${data.sessionId}`;
    const roomSize = io.sockets.adapter.rooms.get(roomName)?.size || 0;
    console.log(`📱 Emitting newUserMessage to room: ${roomName}, users in room: ${roomSize}`);
    
    // Emit to admin
    socket.to(roomName).emit("newUserMessage", {
      sessionId: data.sessionId,
      userId: data.userId,
      text: data.text,
      timestamp: data.timestamp,
      messageId: data.messageId
    });
    
    // Emit for user to confirm
    socket.to(`user_${data.userId}`).emit("messageSent", {
      sessionId: data.sessionId,
      messageId: data.messageId || Date.now().toString()
    });
  });

  // Admin response event
  socket.on("adminResponse", (data) => {
    const roomName = `admin_chat_${data.sessionId}`;
    console.log(`👨‍💼 Admin response to session: ${data.sessionId}`);
    
    // Emit to user
    socket.to(`user_${data.userId}`).emit("newAdminMessage", {
      sessionId: data.sessionId,
      message: {
        message_id: data.messageId,
        text: data.text,
        is_user: false,
        timestamp: data.timestamp,
        admin_id: data.adminId
      }
    });
    
    // Also emit to admin chat room for real-time updates
    socket.to(roomName).emit("newAdminMessage", {
      sessionId: data.sessionId,
      message: {
        message_id: data.messageId,
        text: data.text,
        is_user: false,
        timestamp: data.timestamp,
        admin_id: data.adminId
      }
    });
  });

  // Bot message event
  socket.on("newBotMessage", (data) => {
    console.log(`🤖 Bot message to session: ${data.sessionId}`);
    
    // Emit to user
    socket.to(`user_${data.userId}`).emit("newMessage", {
      sessionId: data.sessionId,
      message: {
        message_id: data.messageId,
        text: data.text,
        is_user: false,
        timestamp: data.timestamp,
        response_type: data.responseType,
        sub_answers: data.subAnswers || [],
        follow_up_questions: data.followUpQuestions || []
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
    
    // Debug: Check which rooms this socket was in
    const rooms = Array.from(socket.rooms);
    console.log("🔴 Socket was in rooms:", rooms);
    
    // Debug: List remaining rooms
    console.log("🔍 Remaining active rooms:", Array.from(io.sockets.adapter.rooms.keys()));
  });
});

// Gắn `io` vào app để dùng được trong controller
app.set("io", io);

// Lắng nghe port
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`🔌 Socket.io đang chạy tại http://localhost:${PORT}`);
});