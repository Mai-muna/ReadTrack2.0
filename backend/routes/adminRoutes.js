const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { param, body } = require('express-validator');
const validate = require('../middleware/validationMiddleware');
const {
  banUser,
  unbanUser,
  removeReview,
  reportReview,
  resolveReport,
  listReports,
} = require('../controllers/adminController');

const router = express.Router();

router.post('/ban/:id', protect, adminOnly, banUser);
router.post('/unban/:id', protect, adminOnly, unbanUser);
router.delete('/reviews/:id', protect, adminOnly, removeReview);
router.post('/reviews/:id/report', protect, reportReview);
router.post('/reports/:id/resolve', protect, adminOnly, resolveReport);
router.get('/reports', protect, adminOnly, listReports);

module.exports = router;
