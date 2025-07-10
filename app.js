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

/* ---------- Logging ---------- */
app.use(logger("dev"));

/* ---------- CORS ---------- */
const allowedOrigins = [
  "http://localhost:3000",
  "https://mazonepoly-admin.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ⚠️ THÊM ĐOẠN NÀY ĐỂ XỬ LÝ PRE-FLIGHT CHO CORS
app.options("*", cors(corsOptions));

/* ---------- Body Parser & Cookie ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* ---------- Static ---------- */
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("/tmp/uploads"));

/* ---------- Routes ---------- */
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
