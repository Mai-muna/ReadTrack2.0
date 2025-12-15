const Review = require('../models/Review');
const Book = require('../models/Book');
const { validationResult } = require('express-validator');

// Helper function to update book average rating
async function updateBookRatings(bookId) {
  const stats = await Review.aggregate([
    { $match: { book: bookId } },
    { $group: { _id: '$book', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    const { avgRating, count } = stats[0];
    await Book.findByIdAndUpdate(bookId, { ratingsAverage: avgRating, ratingsCount: count });
  } else {
    await Book.findByIdAndUpdate(bookId, { ratingsAverage: 0, ratingsCount: 0 });
  }
}

// Create a Review
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { book: bookId, rating, title, comment } = req.body;
    const userId = req.user?.id;

    // Prevent duplicate reviews by same user
    const existing = await Review.findOne({ book: bookId, user: userId });
    if (existing) return res.status(400).json({ message: 'You already reviewed this book.' });

    const review = await Review.create({
      book: bookId,
      user: userId,
      rating,
      title: title || '',
      comment: comment || ''
    });

    await updateBookRatings(bookId);
    res.status(201).json({ message: 'Review created', review });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get All Reviews for a Specific Book
exports.getReviewsForBook = async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const reviews = await Review.find({ book: bookId }).populate('user', 'name email');
    res.json(reviews);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a Review (Only owner or admin)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params; // review ID
    const userId = req.user?.id;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Only owner or admin can delete
    if (req.user.role !== 'admin' && review.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Review.findByIdAndDelete(id);
    await updateBookRatings(review.book);

    res.json({ message: 'Review deleted' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
