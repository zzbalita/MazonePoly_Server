const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token hoặc sai định dạng" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Nếu tạo token là: jwt.sign({ id: admin._id }, ...)
    req.user = {
      id: decoded.id, // hoặc decoded._id tuỳ vào lúc tạo token
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};
