const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  followUser,
  unfollowUser,
  getNotifications,
  likeReview,
  commentOnReview,
} = require('../controllers/socialController');

const router = express.Router();

router.post('/follow/:id', protect, followUser);
router.post('/unfollow/:id', protect, unfollowUser);
router.get('/notifications', protect, getNotifications);
router.post('/reviews/:id/like', protect, likeReview);
router.post('/reviews/:id/comment', protect, commentOnReview);

module.exports = router;
