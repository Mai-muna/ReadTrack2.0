const mongoose = require("mongoose");
const User = require("../models/User");
const Book = require("../models/Book");
const Review = require("../models/Review");
const ReadingList = require("../models/ReadingList");

exports.setYearlyGoal = async (req, res) => {
  try {
    const { year, target } = req.body;
    const y = Number(year || new Date().getFullYear());
    const t = Math.max(0, Number(target || 0));

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { yearlyGoal: { year: y, target: t } },
      { new: true }
    ).select("yearlyGoal");

    res.json({ message: "Goal updated", yearlyGoal: user.yearlyGoal });
  } catch (err) {
    res.status(500).json({ message: "Failed to set goal", error: err.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const year = new Date().getFullYear();

    const statusCounts = await ReadingList.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const topGenre = await ReadingList.aggregate([
      { $match: { user: userId } },
      { $lookup: { from: "books", localField: "book", foreignField: "_id", as: "book" } },
      { $unwind: "$book" },
      { $unwind: "$book.genres" },
      { $group: { _id: "$book.genres", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    // finished this year (for yearly goals)
    const finishedThisYear = await ReadingList.countDocuments({
      user: userId,
      status: "finished",
      finishedAt: {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`)
      }
    });

    // monthly finished counts (for charts)
    const monthly = await ReadingList.aggregate([
      {
        $match: {
          user: userId,
          status: "finished",
          finishedAt: { $ne: null }
        }
      },
      {
        $project: {
          y: { $year: "$finishedAt" },
          m: { $month: "$finishedAt" }
        }
      },
      { $match: { y: year } },
      { $group: { _id: "$m", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const monthlySeries = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = monthly.find((x) => x._id === month);
      return { month, count: found ? found.count : 0 };
    });

    const user = await User.findById(req.user.id).select("yearlyGoal");
    const goal = user.yearlyGoal || { year, target: 0 };

    res.json({
      statusCounts,
      topGenre: topGenre[0] || null,
      goal: { ...goal, completed: finishedThisYear },
      monthlyFinished: monthlySeries
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user analytics", error: err.message });
  }
};

exports.getAdminStats = async (_req, res) => {
  try {
    const [totalUsers, totalBooks, totalReviews] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Review.countDocuments()
    ]);

    const readingListBreakdown = await ReadingList.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({ totalUsers, totalBooks, totalReviews, readingListBreakdown });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admin analytics", error: err.message });
  }
};