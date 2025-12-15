const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { exportSummary } = require('../controllers/exportController');

const router = express.Router();

router.get('/reading-summary', protect, exportSummary);

module.exports = router;
