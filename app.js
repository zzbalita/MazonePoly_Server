require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");

// Kết nối MongoDB
connectDB();

const app = express();

// ✅ Log origin để kiểm tra
app.use((req, res, next) => {
  console.log("👉 Origin:", req.headers.origin);
  next();
});

// ✅ CORS cấu hình chuẩn
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://mazonepoly-admin.vercel.app",
  ],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ✅ Phải có để xử lý OPTIONS request (preflight)
app.options("*", cors(corsOptions));

// Các middleware khác
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("/tmp/uploads"));

// Routes
app.use("/", require("./routes/index"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/brands", require("./routes/brand.routes"));
app.use("/api/sizes", require("./routes/size.routes"));
app.use("/api/description-fields", require("./routes/descriptionField.routes"));
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));

module.exports = app;
