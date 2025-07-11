const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const adminAuth = require("../middleware/authMiddleware");

router.post("/register", adminController.register);
router.post("/login", adminController.login);
router.post("/change-password", adminAuth, adminController.changePassword);

module.exports = router;
