const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // đã xử lý phân biệt Cloudinary & Local

const isProduction = process.env.NODE_ENV === "production";
const serverURL = process.env.SERVER_URL || "http://localhost:5000";

// Helper lấy URL phù hợp
const getFileUrl = (file) => {
  if (isProduction) {
    return file.path; // Cloudinary URL
  } else {
    return `${serverURL}/uploads/${file.filename}`; // Local file URL
  }
};

// Upload 1 ảnh hoặc nhiều ảnh
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  (req, res) => {
    const image = req.files?.image?.[0];
    const images = req.files?.images || [];

    if (!image && images.length === 0) {
      return res.status(400).json({ message: "Không có file nào được tải lên." });
    }

    res.status(200).json({
      image: image ? getFileUrl(image) : null,
      images: images.map(getFileUrl),
    });
  }
);

// Upload avatar (1 ảnh)
router.post("/avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file được tải lên" });
  }

  const url = getFileUrl(req.file);
  res.json({ url });
});

module.exports = router;
