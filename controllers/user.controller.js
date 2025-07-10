const User = require('../models/User');

// Lấy thông tin người dùng dựa vào token
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      'full_name email phone_number avatar_url date_of_birth gender'
    );

    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone_number, date_of_birth, gender, avatar_url } = req.body;
    const userId = req.user.userId;

    // Kiểm tra trùng số điện thoại
    if (phone_number) {
      const existing = await User.findOne({ phone_number });
      if (existing && existing._id.toString() !== userId) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng bởi người khác.' });
      }
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        full_name,
        phone_number,
        date_of_birth,
        gender,
        avatar_url
      },
      { new: true, runValidators: true }
    ).select('full_name phone_number date_of_birth gender avatar_url');

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: updated
    });
  } catch (err) {
    console.error('Lỗi khi cập nhật thông tin:', err);
    res.status(500).json({ message: 'Không thể cập nhật thông tin' });
  }
};