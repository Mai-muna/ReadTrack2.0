const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { param, body, query } = require('express-validator');
const validate = require('../middleware/validationMiddleware');
const {
  followUser,
  unfollowUser,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  likeReview,
  commentOnReview,
} = require('../controllers/socialController');

const router = express.Router();

router.post('/follow/:id', protect, [param('id').isMongoId()], validate, followUser);
router.post('/unfollow/:id', protect, [param('id').isMongoId()], validate, unfollowUser);
router.get(
  '/notifications',
  protect,
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 50 })],
  validate,
  getNotifications
);
router.patch('/notifications/:id/read', protect, [param('id').isMongoId()], validate, markNotificationRead);
router.patch('/notifications/read-all', protect, markAllNotificationsRead);
router.post('/reviews/:id/like', protect, [param('id').isMongoId()], validate, likeReview);
router.post('/reviews/:id/comment', protect, [param('id').isMongoId(), body('text').isLength({ min: 1 })], validate, commentOnReview);

module.exports = router;
