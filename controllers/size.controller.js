const Size = require("../models/Size");

// GET all sizes danh 
exports.getAllSizes = async (req, res) => {
  try {
    const sizes = await Size.find().sort({ createdAt: -1 });
    res.json(sizes);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// POST create size Thêm
exports.createSize = async (req, res) => {
  try {
    const { name } = req.body;
    const size = new Size({ name });
    await size.save();
    res.status(201).json(size);
  } catch (err) {
    res.status(400).json({ message: "Không thể tạo size" });
  }
};

// PUT update size Cập nhật
exports.updateSize = async (req, res) => {
  try {
    const { name, status } = req.body;
    const updated = await Size.findByIdAndUpdate(
      req.params.id,
      { name, status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Không thể cập nhật size" });
  }
};

// DELETE size Xóa
exports.deleteSize = async (req, res) => {
  try {
    await Size.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xoá size" });
  } catch (err) {
    res.status(400).json({ message: "Không thể xoá size" });
  }
};
