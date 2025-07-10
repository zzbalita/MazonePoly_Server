const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Middleware upload mặc định (dùng cho image, images)
const defaultUpload = require("../middleware/upload");

// Route upload thường (nhiều ảnh hoặc 1 ảnh)
router.post("/", defaultUpload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 10 }
]), (req, res) => {
  const image = req.files?.image?.[0];
  const images = req.files?.images || [];

  if (!image && images.length === 0) {
    return res.status(400).json({ message: "Không có file nào được tải lên." });
  }

  res.status(200).json({
    image: image ? `/uploads/${image.filename}` : null,
    images: images.map(file => `/uploads/${file.filename}`)
  });
});

// ✅ Tạo thư mục uploads/avatars nếu chưa có
// Phần avatar
const avatarDir = path.join("/tmp", "uploads", "avatars");
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}


// Cấu hình riêng cho avatar
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const avatarUpload = multer({ storage: avatarStorage });

// API upload avatar
router.post("/avatar", avatarUpload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file được tải lên" });
  }

  const url = `/uploads/avatars/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
