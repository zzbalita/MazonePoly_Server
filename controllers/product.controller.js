const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");


// Lấy danh sách sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm" });
  }
};

// Thêm sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      status
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!name || !price || isNaN(price) || Number(price) <= 0 || !category || !brand) {
      return res.status(400).json({ message: "Vui lòng nhập tên, giá > 0, danh mục và thương hiệu." });
    }

    // Parse mô tả
    let parsedDescription = [];
    try {
      parsedDescription = JSON.parse(description);
      if (
        !Array.isArray(parsedDescription) ||
        parsedDescription.some((d) => !d.field || !d.value)
      ) {
        return res.status(400).json({ message: "Mô tả không hợp lệ." });
      }
    } catch {
      return res.status(400).json({ message: "Mô tả phải đúng định dạng JSON." });
    }

    // Parse variations (color + size + quantity)
    let variations = [];
    if (req.body.variations) {
      try {
        variations = JSON.parse(req.body.variations);

        // Validate từng item trong variations
        const isValid = variations.every(v => v.color && v.size && !isNaN(v.quantity));
        if (!isValid) {
          return res.status(400).json({ message: "Dữ liệu biến thể không hợp lệ" });
        }
      } catch {
        return res.status(400).json({ message: "Dữ liệu biến thể phải là JSON" });
      }
    }

    // Tính tổng số lượng
    const totalQuantity = variations.reduce((sum, v) => sum + Number(v.quantity), 0);

    // Xử lý ảnh
    const images = req.files?.images?.map(file => "/uploads/" + file.filename) || [];

    const product = new Product({
      name: name.trim(),
      image: req.files?.image?.[0] ? "/uploads/" + req.files.image[0].filename : "",
      images,
      description: parsedDescription,
      price: Number(price),
      quantity: totalQuantity,
      category: category.trim(),
      brand: brand.trim(),
      variations,
      status: status ? status.trim() : "Đang bán",
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Lỗi khi tạo sản phẩm:", err);
    res.status(400).json({ message: "Lỗi khi tạo sản phẩm" });
  }
};

// Chi tiét sp
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json(product);
  } catch (err) {
    console.error("❌ Lỗi khi lấy sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm" });
  }
};


// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Parse description nếu có
    if (typeof updateData.description === "string") {
      try {
        updateData.description = JSON.parse(updateData.description);
      } catch {
        return res.status(400).json({ message: "Mô tả không hợp lệ khi cập nhật." });
      }
    }

    // Parse colors nếu có
    if (req.body.colors && typeof req.body.colors === "string") {
      try {
        updateData.colors = JSON.parse(req.body.colors);
      } catch {
        return res.status(400).json({ message: "Màu sắc không hợp lệ." });
      }
    }

    // Parse variations (color + size + quantity)
    if (req.body.variations) {
      try {
        const parsedVariations = JSON.parse(req.body.variations);

        if (!Array.isArray(parsedVariations)) {
          return res.status(400).json({ message: "Dữ liệu variations phải là mảng." });
        }

        for (let v of parsedVariations) {
          if (!v.color || !v.size || isNaN(v.quantity)) {
            return res.status(400).json({ message: "Mỗi variation phải có color, size và quantity." });
          }
        }

        updateData.variations = parsedVariations;
        updateData.quantity = parsedVariations.reduce((sum, v) => sum + Number(v.quantity || 0), 0);
      } catch {
        return res.status(400).json({ message: "Variations không đúng định dạng JSON." });
      }
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    // Xử lý ảnh đại diện (image)
    if (req.files?.image?.[0]) {
      updateData.image = "/uploads/" + req.files.image[0].filename;
    } else if (req.body.imageMode === "keep") {
      updateData.image = product.image;
    } else {
      updateData.image = "";
    }

    // Xử lý danh sách ảnh (images)
    let updatedImages = product.images || [];

    if (req.body.imagesToRemove) {
      const imagesToRemove = Array.isArray(req.body.imagesToRemove)
        ? req.body.imagesToRemove
        : [req.body.imagesToRemove];

      updatedImages = updatedImages.filter((img) => !imagesToRemove.includes(img));

      imagesToRemove.forEach((imgPath) => {
        const filePath = path.join(__dirname, "..", imgPath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    if (req.files?.images?.length > 0) {
      const newImages = req.files.images.map((file) => "/uploads/" + file.filename);
      if (req.body.imagesMode === "append") {
        updatedImages = [...updatedImages, ...newImages];
      } else {
        updatedImages = newImages;
      }
    }

    updateData.images = updatedImages;

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("Lỗi khi cập nhật sản phẩm:", err);
    res.status(400).json({ message: "Không thể cập nhật sản phẩm" });
  }
};

// Xoá sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xoá sản phẩm" });
  } catch (err) {
    console.error("Lỗi khi xoá sản phẩm:", err);
    res.status(400).json({ message: "Không thể xoá sản phẩm" });
  }
};
