const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: 'Không có token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Đảm bảo key là userId (hoặc đổi lại controller nếu bạn dùng id)
    req.user = {
      userId: decoded.userId || decoded.id || decoded._id,
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token không hợp lệ' });
  }
};
