const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token hoặc sai định dạng" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 👉 Map userId từ token về thành _id để dùng với MongoDB
    req.user = {
      _id: decoded.userId, // dùng cho User.findById(req.user._id)
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};
