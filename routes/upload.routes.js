const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/", upload.fields([
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

module.exports = router;
