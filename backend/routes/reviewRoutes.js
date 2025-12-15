const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware'); // If the file name has typo, keep the same.

// Create Review (Authenticated Users Only)
router.post(
  '/',
  protect,
  [
    body('book').notEmpty().withMessage('book is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5')
  ],
  reviewController.createReview
);

// Get All Reviews for a Book (Public)
router.get('/book/:id', reviewController.getReviewsForBook);

// Delete Review (Only User Who Posted or Admin)
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
