require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");

// Kết nối DB
connectDB();

const app = express();

// Middleware cơ bản
app.use(logger("dev"));
const allowedOrigins = [
    "http://localhost:3000", // dùng khi phát triển local
    "https://mazonepoly-admin.vercel.app", // domain frontend trên Vercel
];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true, // nếu có dùng cookie; nếu không thì vẫn nên để an toàn
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static từ thư mục public
app.use(express.static(path.join(__dirname, "public")));

// ✅ Static để truy cập ảnh đã upload từ `/tmp/uploads`
app.use("/uploads", express.static("/tmp/uploads"));

// Mount routes
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
