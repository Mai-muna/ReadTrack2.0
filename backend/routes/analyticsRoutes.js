const express = require('express');
const router = express.Router();
const { getUserStats, getAdminStats, setYearlyGoal } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/goal', protect, setYearlyGoal);
router.get('/user', protect, getUserStats);
router.get('/admin', protect, adminOnly, getAdminStats);

module.exports = router;
