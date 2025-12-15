const express = require('express');
const router = express.Router();
const { getUserStats, getAdminStats } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/user', protect, getUserStats);
router.get('/admin', protect, adminOnly, getAdminStats);

module.exports = router;
