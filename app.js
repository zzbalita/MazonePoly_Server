require("dotenv").config();                 //  Load biến môi trường
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");   //  Kết nối MongoDB
const uploadRoutes = require("./routes/upload.routes");

connectDB();                                //  Thực thi kết nối

const app = express();

app.use(logger("dev"));
app.use(cors());                            //  Cho phép frontend React truy cập
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/api/admin", require("./routes/admin.routes")); //  Các route đăng ký/đăng nhập admin
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/brands", require("./routes/brand.routes"));
app.use("/api/sizes", require("./routes/size.routes"));
app.use("/api/description-fields", require("./routes/descriptionField.routes"));
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));





module.exports = app;
