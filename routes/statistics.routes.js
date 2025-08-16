const express = require('express');
const router = express.Router();
const { getProductStatistics } = require('../controllers/statistics.controller');
const verifyAdmin = require('../middleware/authAdmin');

router.get('/products', verifyAdmin, getProductStatistics);

module.exports = router;
