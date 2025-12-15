const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Review = require('../models/Review');
const ReadingList = require('../models/ReadingList');

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await ReadingList.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      user: userId,
      stats
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch user analytics",
      error: err.message
    });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalReviews = await Review.countDocuments();

    const readingListBreakdown = await ReadingList.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      systemStats: {
        totalUsers,
        totalBooks,
        totalReviews
      },
      readingListBreakdown
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch admin analytics",
      error: err.message
    });
  }
};
