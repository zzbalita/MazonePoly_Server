const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Lấy thông tin cá nhân
router.get('/me', authMiddleware, userController.getMe);

// Cập nhật thông tin cá nhân
router.put('/update-profile', authMiddleware, userController.updateProfile);

module.exports = router;
