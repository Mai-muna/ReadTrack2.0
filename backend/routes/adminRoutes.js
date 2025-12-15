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

router.post('/ban/:id', protect, adminOnly, [param('id').isMongoId()], validate, banUser);
router.post('/unban/:id', protect, adminOnly, [param('id').isMongoId()], validate, unbanUser);
router.delete('/reviews/:id', protect, adminOnly, [param('id').isMongoId()], validate, removeReview);
router.post(
  '/reviews/:id/report',
  protect,
  [param('id').isMongoId(), body('reason').isLength({ min: 3 })],
  validate,
  reportReview
);
router.post('/reports/:id/resolve', protect, adminOnly, [param('id').isMongoId()], validate, resolveReport);
router.get('/reports', protect, adminOnly, listReports);

module.exports = router;
