const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema({
  full_name: { type: String, required: true, maxLength: 255 },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: { type: String, required: true }, // bcrypt hash trước khi lưu

  date_of_birth: { type: Date },

  gender: {
    type: Number,
    default: 0 // 0 = chưa chọn, 1 = nam, 2 = nữ, 3 = khác
  },

  phone_number: {
    type: String,
    unique: true,
    sparse: true, // chỉ unique nếu tồn tại
    default: null // đảm bảo undefined sẽ là null trong Mongo
  },

  shipping_phone_number: {
    type: String,
    default: function () {
      return this.phone_number || '';
    }
  },

  is_phone_verified: { type: Boolean, default: false },

  avatar_url: { type: String },

  uid: {
    type: String,
    unique: true,
    sparse: true,
    default: null // thêm để tránh lỗi trùng uid = null
  },

  google_id: {
    type: String,
    sparse: true,
    default: null // thêm để tránh lỗi trùng
  },

  role: {
    type: Number,
    enum: [0, 1], // 0 = admin, 1 = user
    default: 1
  },

  status: {
    type: Number,
    default: 1 // 1 = hoạt động, 0 = bị khóa
  }

}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = mongoose.model('user', Users, 'users');
